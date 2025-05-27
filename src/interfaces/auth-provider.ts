import { User, AuthResponse, WalletType } from '../types/auth';
import { WalletConnectionOptions } from './wallet-adapter';

/**
 * Authentication provider name
 */
export type AuthProviderName = 'web3' | 'email' | 'social';

/**
 * Interface for authentication providers
 */
export interface AuthProvider {
  /**
   * Name of the provider
   */
  readonly name: AuthProviderName;
  
  /**
   * Gets the current authenticated user
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Logs out the current user
   */
  logout(): Promise<boolean>;
  
  /**
   * Registers a callback for auth state changes
   * 
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

export interface Web3AuthProvider extends AuthProvider {
  /**
   * Logs in the user with a wallet
   * 
   * @param walletType - Type of wallet to use
   * @param options - Optional wallet connection options
   * @returns Authentication response
   */
  loginWithWallet(walletType: WalletType, options?: WalletConnectionOptions): Promise<AuthResponse>;
  
  /**
   * Signs a message with the user's wallet
   * 
   * @param message - Message to sign
   * @returns Signed message
   */
  signMessage(message: string): Promise<string>;
  
  /**
   * Gets the user's wallet address
   * 
   * @returns Wallet address or null if not available
   */
  getWalletAddress(): Promise<string | null>;
}