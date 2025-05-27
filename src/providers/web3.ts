import { ethers } from 'ethers';
import { Web3AuthProvider as IWeb3AuthProvider } from '../interfaces/auth-provider';
import { UserRepository } from '../interfaces/user-repository';
import { WalletAdapter, WalletConnectionOptions } from '../interfaces/wallet-adapter';
import { ComplianceService } from '../services/compliance';
import { AuthError, AuthResponse, User, WalletType } from '../types/auth';

/**
 * Configuration for Web3 authentication provider
 */
export interface Web3AuthConfig {
  domain: string;
  statement: string;
  uri: string;
  timeout?: number;
  version?: string;
  chainId?: number;
  apiEndpoint?: string;
  complianceEnabled?: boolean;
}

/**
 * EIP-4361 Sign-In with Ethereum message parameters
 */
interface SiweMessageParams {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

/**
 * Implementation of the Web3AuthProvider interface
 */
export class Web3AuthProvider implements IWeb3AuthProvider {
  private userRepository: UserRepository;
  private walletAdapters: Map<WalletType, WalletAdapter>;
  private complianceService?: ComplianceService;
  private config: Web3AuthConfig;
  private provider?: ethers.BrowserProvider;
  readonly name = 'web3';

  /**
   * Creates a new Web3AuthProvider instance
   */
  constructor(
  config: Web3AuthConfig,
    userRepository: UserRepository,
    walletAdapters: WalletAdapter[],
  complianceService?: ComplianceService
  ) {
    this.userRepository = userRepository;
    this.walletAdapters = new Map();
    
    // Register wallet adapters
    for (const adapter of walletAdapters) {
      this.walletAdapters.set(adapter.type, adapter);
}
    
    this.config = {
      version: '1',
      timeout: 60 * 5, // 5 minutes
      ...config
    };
    
    if (config.complianceEnabled && complianceService) {
      this.complianceService = complianceService;
    }
  }

  /**
   * Logs an authentication event if compliance service is enabled
   */
  private async logAuthEvent(eventType: string, user: User | null, metadata: Record<string, any> = {}) {
    if (this.complianceService) {
      await this.complianceService.logAuthEvent({
        type: eventType,
        userId: user?.id || 'anonymous',
        provider: this.name,
        timestamp: new Date(),
        metadata,
      });
    }
  }

  /**
   * Performs pre-authentication compliance checks
   */
  private async preAuthCheck(walletAddress: string, walletType: WalletType) {
    if (this.complianceService) {
      await this.complianceService.preAuthCheck({
        walletAddress,
        walletType,
        provider: 'web3',
      });
    }
  }

  /**
   * Transforms an error to the common AuthError type
   */
  private transformError(error: any): AuthError {
    return {
      code: error.code || 'unknown',
      message: error.message || 'An unknown error occurred',
      originalError: error,
    };
  }

  /**
   * Connects to a Web3 wallet
   */
  private async connectWallet(walletType: WalletType, options?: WalletConnectionOptions): Promise<{
    provider: ethers.BrowserProvider;
    signer: ethers.Signer;
    address: string;
  }> {
    try {
      const adapter = this.walletAdapters.get(walletType);
      
      if (!adapter) {
        throw new Error(`Unsupported wallet type: ${walletType}`);
      }
      
      const { provider, signer, address } = await adapter.connect(options);
      
      // Store provider for later use
      this.provider = provider;
      
      return { provider, signer, address };
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Generates a nonce for signing
   */
private generateNonce(): string {
  // 96 bits entropy, base-36 encoded → slice to first 8 chars
  return Math.random().toString(36).substring(2, 10);
 }

  /**
   * Creates an EIP-4361 (Sign-In with Ethereum) message
   */
  private createSignInWithEthereumMessage(address: string, nonce: string): string {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + this.config.timeout! * 1000);

    const params: SiweMessageParams = {
      domain: this.config.domain,
      address,
      statement: this.config.statement,
      uri: this.config.uri,
      version: this.config.version!,
      chainId: this.config.chainId || 1,
      nonce,
      issuedAt: now.toISOString(),
      expirationTime: expirationDate.toISOString(),
    };

    // Format according to EIP-4361
    return `${params.domain} wants you to sign in with your Ethereum account:
${params.address}

${params.statement}

URI: ${params.uri}
Version: ${params.version}
Chain ID: ${params.chainId}
Nonce: ${params.nonce}
Issued At: ${params.issuedAt}
Expiration Time: ${params.expirationTime}`;
  }

  /**
   * Verifies a signed message
   */
  private verifySignature(message: string, signature: string, address: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Gets a JWT token from the backend after signature verification
   */
  private async getJwtFromBackend(address: string, message: string, signature: string): Promise<string> {
    if (!this.config.apiEndpoint) {
      throw new Error('API endpoint not configured for Web3 authentication');
    }

    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        message,
        signature,
      }),
    });

let res: Response;
try {
  res = await fetch(this.config.apiEndpoint, { ... });
} catch {
  throw new Error('Network error contacting auth API');
}

let body: any = {};
try { body = await res.json(); } catch {}

if (!res.ok) {
  throw new Error(body?.message ?? `Auth API error ${res.status}`);
}

const { jwt } = body;
if (!jwt) throw new Error('Auth API response missing JWT');
    return data.jwt;
  }

  /**
   * Authenticates a user with a Web3 wallet
   */
  async loginWithWallet(walletType: WalletType, options?: WalletConnectionOptions): Promise<AuthResponse> {
    try {
      // Connect to wallet using the appropriate adapter
      const { signer, address } = await this.connectWallet(walletType, options);
      
      await this.preAuthCheck(address, walletType);
      
      // Generate nonce
      const nonce = this.generateNonce();
      
      // Create message
      const message = this.createSignInWithEthereumMessage(address, nonce);
      
      // Get the adapter again to use its signMessage method
      const adapter = this.walletAdapters.get(walletType)!;
      
      // Sign message
      const signature = await adapter.signMessage(message, signer);
      
      // Verify signature locally
      const isValid = this.verifySignature(message, signature, address);
      if (!isValid) {
        throw new Error('Invalid signature');
      }
      
      // Get JWT from backend
      const jwt = await this.getJwtFromBackend(address, message, signature);
      
      // Sign in with UserRepository
      const authResponse = await this.userRepository.signIn({
        email: `${address.toLowerCase()}@web3auth.veritasvault.com`,
        password: jwt,
      });
      
      if (!authResponse.success) {
        throw authResponse.error;
      }
      
      // Log successful authentication
      await this.logAuthEvent('LOGIN_WALLET', authResponse.user, {
        walletAddress: address,
        walletType,
      });
      
      return authResponse;
    } catch (error) {
      const transformedError = this.transformError(error);
      await this.logAuthEvent('LOGIN_FAILURE', null, {
        error: transformedError,
        walletType,
      });
      return {
        success: false,
        error: transformedError,
      };
    }
  }

  /**
   * Gets the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.userRepository.getUser();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logs out the current user
   */
  async logout(): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      const { error } = await this.userRepository.signOut();
      
      if (error) throw error;
      
      // Reset provider
      this.provider = undefined;
      
      await this.logAuthEvent('LOGOUT', currentUser);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Registers a callback for auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const { data } = this.userRepository.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = session?.user ? this.userRepository.transformUser(session.user) : null;
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
        // Reset provider on sign out
        this.provider = undefined;
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }

  /**
   * Signs a message with the connected wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('No wallet connected');
    }

    const signer = await this.provider.getSigner();
    return await signer.signMessage(message);
  }

  /**
   * Gets the connected wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const signer = await this.provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error('Get wallet address error:', error);
      return null;
    }
  }
}

/**
 * Creates a Web3 auth provider instance with all required dependencies
 */
export function createWeb3AuthProvider(
  config: Web3AuthConfig & { supabaseClient: any },
  complianceService?: ComplianceService
): Web3AuthProvider {
  // Create user repository
  const userRepository = new (require('../repositories/supabase-user-repo').SupabaseUserRepository)(
    config.supabaseClient
  );
  
  // Create wallet adapters
  const walletAdapters = [
    new (require('../adapters/metamask-adapter').MetaMaskAdapter)(),
    // Add more adapters as needed
  ];
  
  // Create and return provider
  return new Web3AuthProvider(
    {
      domain: config.domain,
      statement: config.statement,
      uri: config.uri,
      timeout: config.timeout,
      version: config.version,
      chainId: config.chainId,
      apiEndpoint: config.apiEndpoint,
      complianceEnabled: config.complianceEnabled,
    },
    userRepository,
    walletAdapters,
    complianceService
  );
}      version: config.version,
      chainId: config.chainId,
      apiEndpoint: config.apiEndpoint,
      complianceEnabled: config.complianceEnabled,
    },
    userRepository,
    walletAdapters,
    complianceService
  );
}