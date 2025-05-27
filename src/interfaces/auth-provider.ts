import { User, AuthResponse } from '../types/auth';

/**
 * Authentication provider name
 */
export type AuthProviderName = 'supabase' | 'web3';

/**
 * Interface for authentication providers
 */
export interface AuthProvider {
  /**
   * Name of the provider
   */
  readonly name: AuthProviderName;
  
  /**
   * Logs out the current user
   */
  logout(): Promise<boolean>;
  
  /**
   * Gets the current authenticated user
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Registers a callback for auth state changes
   * 
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
