import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletConnectionState } from '../models/auth.models';
import { AuthProvider } from './auth-provider.service';

/**
 * WalletOrchestrator manages wallet connection state and orchestrates
 * interactions between the UI, adapter layer, and authentication provider
 */
export class WalletOrchestrator {
  // Current wallet connection state
  private walletState = new BehaviorSubject<WalletConnectionState>({
    status: 'DISCONNECTED'
  });

  constructor(
    private walletAdapter: any, // Will be PluralityWalletAdapter
    private authProvider: AuthProvider
  ) {
    // Listen for adapter disconnection events
    this.walletAdapter.onDisconnect(() => {
      this.setDisconnectedState();
    });
  }

  /**
   * Get current wallet connection state
   */
  getWalletState(): Observable<WalletConnectionState> {
    return this.walletState.asObservable();
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): Observable<boolean> {
    return this.walletState.pipe(
      map(state => state.status === 'CONNECTED')
    );
  }

  /**
   * Initiate wallet connection
   */
  connectWallet(): Promise<string> {
    this.walletState.next({
      status: 'CONNECTING'
    });

    return new Promise<string>((resolve, reject) => {
      this.walletAdapter.connect()
        .then((address: string) => {
          this.setConnectedState(address);
          resolve(address);
        })
        .catch((error: any) => {
          this.setErrorState(error.message || 'Failed to connect wallet');
          reject(error);
        });
    });
  }

  /**
   * Sign a message with the connected wallet
   * Used for authentication challenges and transactions
   */
  signMessage(message: string): Promise<string> {
    if (this.walletState.value.status !== 'CONNECTED') {
      return Promise.reject(new Error('Wallet not connected'));
    }

    return this.walletAdapter.signMessage(message);
  }

  /**
   * Initiate wallet-based authentication
   * Connects wallet if not connected, then signs challenge for auth
   */
  async authenticateWithWallet(): Promise<void> {
    try {
      // Connect wallet if not already connected
      if (this.walletState.value.status !== 'CONNECTED') {
        await this.connectWallet();
      }

      const address = this.walletState.value.address;
      if (!address) {
        throw new Error('Wallet address unavailable');
      }

      // Request challenge from API
      const challenge = await this.requestAuthChallenge(address);
      
      // Sign challenge with wallet
      const signedChallenge = await this.signMessage(challenge);
      
      // Complete authentication with signed challenge
      await this.authProvider.authenticateWithWallet(signedChallenge, address);
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Link a wallet to an existing authenticated account
   */
  async linkWalletToAccount(): Promise<void> {
    try {
      // Verify user is authenticated
      const authenticated = await this.authProvider.isAuthenticated().toPromise();
      if (!authenticated) {
        throw new Error('Must be authenticated to link wallet');
      }

      // Connect wallet if not already connected
      if (this.walletState.value.status !== 'CONNECTED') {
        await this.connectWallet();
      }

      const address = this.walletState.value.address;
      if (!address) {
        throw new Error('Wallet address unavailable');
      }

      // Request linking challenge
      const challenge = await this.requestLinkingChallenge(address);
      
      // Sign challenge with wallet
      const signedChallenge = await this.signMessage(challenge);
      
      // Complete linking with signed challenge
      await this.authProvider.linkWalletToAccount(signedChallenge, address);
    } catch (error: any) {
      throw new Error(`Wallet linking failed: ${error.message}`);
    }
  }

  /**
   * Disconnect the current wallet
   */
  disconnectWallet(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.walletAdapter.disconnect()
        .then(() => {
          this.setDisconnectedState();
          resolve();
        })
        .catch((error: any) => {
          // Still set disconnected state locally even if adapter fails
          this.setDisconnectedState();
          reject(error);
        });
    });
  }

  /**
   * Request auth challenge from API for given wallet address
   */
  private requestAuthChallenge(address: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // This would be an API call to get a challenge nonce
      fetch('/api/auth/wallet/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
        .then(response => response.json())
        .then(data => {
          if (data.challenge) {
            resolve(data.challenge);
          } else {
            reject(new Error('Failed to get challenge'));
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Request linking challenge from API for given wallet address
   */
  private requestLinkingChallenge(address: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // This would be an API call to get a challenge nonce for linking
      fetch('/api/auth/wallet/linking-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ address })
      })
        .then(response => response.json())
        .then(data => {
          if (data.challenge) {
            resolve(data.challenge);
          } else {
            reject(new Error('Failed to get linking challenge'));
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Set wallet connected state
   */
  private setConnectedState(address: string, chainId?: number): void {
    this.walletState.next({
      status: 'CONNECTED',
      address,
      chainId
    });
  }

  /**
   * Set wallet disconnected state
   */
  private setDisconnectedState(): void {
    this.walletState.next({
      status: 'DISCONNECTED'
    });
  }

  /**
   * Set wallet error state
   */
  private setErrorState(error: string): void {
    this.walletState.next({
      status: 'ERROR',
      error
    });
  }
}