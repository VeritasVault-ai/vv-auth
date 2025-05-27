/**
 * Common authentication types for vv-auth
 */

/**
 * User wallet address
 */
export interface WalletAddress {
  address: string;
  type: string;
  linkedAt: string;
}

/**
 * Authenticated user
 */
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  walletAddresses?: WalletAddress[];
  metadata?: Record<string, any>;
}

/**
 * Authentication error
 */
export interface AuthError {
  code: string;
  message: string;
  originalError?: any;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  user?: User | null;
  session?: any;
  error?: AuthError;
  redirectUrl?: string;
}

/**
 * User credentials
 */
export interface UserCredentials {
  email?: string;
  password?: string;
  provider?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Social provider type
 */
export type SocialProvider = 'google' | 'github' | 'microsoft' | 'twitter' | 'facebook' | 'apple' | 'discord' | 'linkedin' | 'twitch' | 'instagram' | 'discord' | 'linkedin' | 'twitch' | 'instagram';

/**
 * Wallet type
 */
export type WalletType = 'metamask' | 'walletconnect';

/**
 * Authentication provider name
 */
export type AuthProviderName = 'supabase' | 'web3';
