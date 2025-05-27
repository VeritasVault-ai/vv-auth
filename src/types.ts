/**
 * Core type definitions for the vv-auth package
 */

// Core enums
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum AuthMethod {
  EMAIL_PASSWORD = 'email_password',
  OAUTH_GOOGLE = 'oauth_google',
  OAUTH_GITHUB = 'oauth_github',
  OAUTH_MICROSOFT = 'oauth_microsoft',
  WALLET_METAMASK = 'wallet_metamask',
  WALLET_PLURALITY = 'wallet_plurality',
  API_KEY = 'api_key'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Core interfaces
export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  walletAddresses?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  authMethod: AuthMethod;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  error: Error | null;
  wallet: WalletInfo | null;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  session?: Session;
  tokens?: TokenData;
  wallet?: WalletInfo;
  error?: Error;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider?: any;
  balance?: string;
  networkName?: string;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithProvider: (provider: string) => Promise<AuthResult>;
  loginWithWallet: (walletType: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  getToken: () => Promise<string | null>;
}

// Placeholder interface for auth provider
export interface AuthProvider {
  type: string;
  name: string;
  isReady(): Promise<boolean>;
  login(params?: any): Promise<AuthResult>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<TokenData | null>;
}

// Placeholder interface for wallet provider
export interface WalletProvider extends AuthProvider {
  type: 'wallet';
  walletType: string;
  connect(): Promise<WalletInfo>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: any): Promise<string>;
  getAccounts(): Promise<string[]>;
  getChainId(): Promise<number>;
  switchChain(chainId: number): Promise<void>;
}
