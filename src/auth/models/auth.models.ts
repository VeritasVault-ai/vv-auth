export interface AuthenticationState {
  status: 'UNAUTHENTICATED' | 'CHALLENGE_PENDING' | 'AUTHENTICATED' | 'AUTH_ERROR';
  error?: string;
  authenticatedWith?: ('wallet' | 'email' | 'social')[];
  userId?: string;
}

export interface WalletConnectionState {
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  error?: string;
  address?: string;
  chainId?: number;
}

export interface LinkingState {
  status: 'LINK_INITIATED' | 'LINK_VERIFICATION_PENDING' | 'LINK_COMPLETE' | 'LINK_ERROR';
  method: 'wallet' | 'email' | 'social';
  error?: string;
}

export interface UserProfile {
  id: string;
  linkedMethods: {
    type: 'wallet' | 'email' | 'social';
    identifier: string; // wallet address, email, or social id
    linkedAt: Date;
    lastUsed: Date;
  }[];
  permissions: string[];
  createdAt: Date;
  lastLogin: Date;
}