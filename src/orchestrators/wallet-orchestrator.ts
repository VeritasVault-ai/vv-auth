import { WalletAdapter, WalletConnectionOptions } from '../interfaces/wallet-adapter';
import { WalletOrchestrator, WalletSessionEvent, WalletSessionState } from '../interfaces/wallet-orchestrator';
import { Web3AuthProvider } from '../providers/web3';
import { ComplianceService } from '../services/compliance';
import { AuthResponse, WalletType } from '../types/auth';

/**
 * Implementation of the Wallet Orchestrator that coordinates
 * all wallet interactions across the application
 */
export class DefaultWalletOrchestrator implements WalletOrchestrator {
  private authProvider: Web3AuthProvider;
  private walletAdapters: Map<WalletType, WalletAdapter>;
  private complianceService?: ComplianceService;
  private sessionListeners: Set<(state: WalletSessionState, event: WalletSessionEvent) => void>;
  private sessionState: WalletSessionState;
  
  /**
   * Creates a new wallet orchestrator
   * 
   * @param authProvider - The authentication provider to use
   * @param walletAdapters - Adapters for different wallet types
   * @param complianceService - Optional compliance service for regulatory checks
   */
  constructor(
    authProvider: Web3AuthProvider,
    walletAdapters: WalletAdapter[],
    complianceService?: ComplianceService
  ) {
    this.authProvider = authProvider;
    this.walletAdapters = new Map();
    this.complianceService = complianceService;
    this.sessionListeners = new Set();
    
    // Initial session state
    this.sessionState = {
      connected: false,
      walletType: null,
      address: null,
      chainId: null,
      provider: null
    };
    
    // Register wallet adapters
    for (const adapter of walletAdapters) {
      this.walletAdapters.set(adapter.type, adapter);
    }
    
    // Set up wallet event listeners
    this.setupEventListeners();
  }
  
  /**
   * Sets up event listeners for wallet changes
   */
  private setupEventListeners(): void {
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        const newAddress = accounts[0] || null;
        if (this.sessionState.address !== newAddress) {
          this.updateSessionState({
            address: newAddress,
            connected: !!newAddress
          }, 'account_changed');
          
          // If we lost the account, disconnect
          if (!newAddress && this.sessionState.connected) {
            this.disconnectWallet().catch(console.error);
          }
        }
      });
      
      // Listen for network changes
      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        if (this.sessionState.chainId !== chainId) {
          this.updateSessionState({ chainId }, 'chain_changed');
        }
      });
    }
    
    // Listen for auth state changes
    this.authProvider.onAuthStateChanged((user) => {
      if (!user && this.sessionState.connected) {
        // If we lost authentication but wallet shows connected, update state
        this.updateSessionState({
          connected: false
        }, 'session_expired');
      }
    });
  }
  
  /**
   * Updates the current session state and notifies listeners
   * 
   * @param updates - Partial state updates to apply
   * @param event - The event that triggered this update
   */
  private updateSessionState(updates: Partial<WalletSessionState>, event: WalletSessionEvent): void {
    this.sessionState = {
      ...this.sessionState,
      ...updates
    };
    
    // Notify all listeners
    for (const listener of this.sessionListeners) {
      listener(this.sessionState, event);
    }
  }
  
  /**
   * Logs a wallet session event
   * 
   * @param event - Event type
   * @param metadata - Additional event data
   */
  private async logSessionEvent(event: string, metadata: Record<string, any> = {}): Promise<void> {
    if (this.complianceService) {
      await this.complianceService.logWalletEvent({
        type: event,
        walletAddress: this.sessionState.address || 'unknown',
        walletType: this.sessionState.walletType || 'unknown',
        timestamp: new Date(),
        metadata
      });
    }
  }
  
  /**
   * Connects to a wallet and establishes a session
   * 
   * @param walletType - Type of wallet to connect to
   * @param options - Connection options
   * @returns Authentication response
   */
  async connectWallet(walletType: WalletType, options?: WalletConnectionOptions): Promise<AuthResponse> {
    try {
      // Find the appropriate adapter
      const adapter = this.walletAdapters.get(walletType);
      if (!adapter) {
        throw new Error(`Unsupported wallet type: ${walletType}`);
      }
      
      // Connect using the adapter
      const { provider, signer, address } = await adapter.connect(options);
      
      // Update session state first with wallet connection
      this.updateSessionState({
         walletType,
         address,
         provider,
        chainId: options?.chainId || null,
        connected: true
       }, 'connected');
      
      // Log the connection event
      await this.logSessionEvent('WALLET_CONNECTED', {
        walletType,
        address,
        chainId: options?.chainId
      });
      
      // Perform authentication with the provider
      const authResponse = await this.authProvider.loginWithWallet(walletType, options);
      
      // Update connected state based on auth result
      this.updateSessionState({
        connected: authResponse.success
      }, 'connected');
      
      return authResponse;
    } catch (error: any) {
      // Reset session state on error
      this.updateSessionState({
        connected: false,
        walletType: null,
        address: null,
        provider: null
      }, 'disconnected');
      
      // Log the error
      await this.logSessionEvent('WALLET_CONNECTION_ERROR', {
        walletType,
        error: error.message
      });
      
      // Return error response
      return {
        success: false,
        error: {
          code: error.code || 'connection_failed',
          message: error.message || 'Failed to connect wallet',
          originalError: error
        }
      };
    }
  }
  
  /**
   * Disconnects the current wallet and ends the session
   * 
   * @returns Success status
   */
  async disconnectWallet(): Promise<boolean> {
    try {
      // Capture current state for logging
      const { walletType, address } = this.sessionState;
      
      // Log out from auth provider
      const success = await this.authProvider.logout();
      
      // Reset session state
      this.updateSessionState({
        connected: false,
        walletType: null,
        address: null,
        provider: null,
        chainId: null
      }, 'disconnected');
      
      // Log the disconnection
      await this.logSessionEvent('WALLET_DISCONNECTED', {
        walletType,
        address
      });
      
      return success;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return false;
    }
  }
  
  /**
   * Gets the current wallet session state
   * 
   * @returns Current session state
   */
  getSessionState(): WalletSessionState {
    return { ...this.sessionState };
  }
  
  /**
   * Gets the connected wallet address
   * 
   * @returns Wallet address or null if not connected
   */
  async getWalletAddress(): Promise<string | null> {
    if (this.sessionState.connected && this.sessionState.address) {
      return this.sessionState.address;
    }
    
    // Try to get address from auth provider as fallback
    return await this.authProvider.getWalletAddress();
  }
  
  /**
   * Signs a message with the connected wallet
   * 
   * @param message - Message to sign
   * @returns Signature
   */
  async signMessage(message: string): Promise<string> {
    if (!this.sessionState.connected) {
      throw new Error('No wallet connected');
    }
    
    try {
      const signature = await this.authProvider.signMessage(message);
      
      // Log the signing event
      await this.logSessionEvent('MESSAGE_SIGNED', {
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        address: this.sessionState.address
      });
      
      return signature;
    } catch (error: any) {
      // Log the error
      await this.logSessionEvent('MESSAGE_SIGNING_ERROR', {
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Switches to a different network
   * 
   * @param chainId - Network chain ID
   * @param rpcUrl - Optional RPC URL if the network needs to be added
   * @returns Success status
   */
  async switchNetwork(chainId: number, rpcUrl?: string): Promise<boolean> {
    if (!this.sessionState.connected || !this.sessionState.provider) {
      throw new Error('No wallet connected');
    }
    
    try {
      const adapter = this.walletAdapters.get(this.sessionState.walletType!);
      if (!adapter) {
        throw new Error('Wallet adapter not found');
      }
      
      // Use adapter to switch chains
      const previous = this.sessionState.chainId;
      await adapter.switchChain(this.sessionState.provider, chainId, rpcUrl);
      this.updateSessionState({ chainId }, 'chain_changed');
      await this.logSessionEvent('NETWORK_SWITCHED', {
        chainId,
        previousChainId: previous
      });
      
      return true;
    } catch (error: any) {
      // Log the error
      await this.logSessionEvent('NETWORK_SWITCH_ERROR', {
        chainId,
        error: error.message
      });
      
      return false;
    }
  }
  
  /**
   * Registers a callback for session state changes
   * 
   * @param callback - Function to call when session state changes
   * @returns Unsubscribe function
   */
  onSessionChange(callback: (state: WalletSessionState, event: WalletSessionEvent) => void): () => void {
    this.sessionListeners.add(callback);
    
    // Call immediately with current state
    callback(this.sessionState, 'connected');
    
    // Return unsubscribe function
    return () => {
      this.sessionListeners.delete(callback);
    };
  }
}

/**
 * Creates a wallet orchestrator with the given providers and adapters
 * 
 * @param authProvider - Authentication provider
 * @param walletAdapters - Wallet adapters to use
 * @param complianceService - Optional compliance service
 * @returns Wallet orchestrator instance
 */
export function createWalletOrchestrator(
  authProvider: Web3AuthProvider,
  walletAdapters: WalletAdapter[],
  complianceService?: ComplianceService
): WalletOrchestrator {
  return new DefaultWalletOrchestrator(
    authProvider,
    walletAdapters,
    complianceService
  );
}