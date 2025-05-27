import { AuthProviderName, User } from '../types/auth';

/**
 * Authentication capabilities
 */
export enum AuthCapability {
  // Basic authentication
  LOGIN = 'auth:login',
  LOGOUT = 'auth:logout',
  
  // User profile
  VIEW_PROFILE = 'profile:view',
  EDIT_PROFILE = 'profile:edit',
  
  // Social authentication
  SOCIAL_LOGIN = 'social:login',
  
  // Web3 wallet
  WALLET_CONNECT = 'wallet:connect',
  WALLET_SIGN_MESSAGE = 'wallet:sign-message',
  WALLET_LINK = 'wallet:link',
  
  // DeFi capabilities
  DEFI_STAKE = 'defi:stake',
  DEFI_SWAP = 'defi:swap',
  
  // Admin capabilities
  ADMIN_VIEW_USERS = 'admin:view-users',
}

/**
 * Default provider capabilities
 */
export const DEFAULT_PROVIDER_CAPABILITIES: Record<AuthProviderName, AuthCapability[]> = {
  supabase: [
    AuthCapability.LOGIN,
    AuthCapability.LOGOUT,
    AuthCapability.VIEW_PROFILE,
    AuthCapability.EDIT_PROFILE,
    AuthCapability.SOCIAL_LOGIN,
  ],
  web3: [
    AuthCapability.LOGIN,
    AuthCapability.LOGOUT,
    AuthCapability.VIEW_PROFILE,
    AuthCapability.WALLET_CONNECT,
    AuthCapability.WALLET_SIGN_MESSAGE,
    AuthCapability.WALLET_LINK,
  ],
};

/**
 * Capability check options
 */
export interface CapabilityCheckOptions {
  includeLinkedAccounts?: boolean;
  includeMetadataCapabilities?: boolean;
  throwOnMissing?: boolean;
}

/**
 * Capability manager
 */
export class AuthCapabilityManager {
  private customCapabilities: Map<string, Set<AuthCapability>> = new Map();
  
  /**
   * Gets all capabilities for a user
   */
  getUserCapabilities(user: User | null, options?: CapabilityCheckOptions): Set<AuthCapability> {
    
const capabilities = new Set<AuthCapability>();

if (!user) {
  return capabilities;          // anonymous user ⇒ empty capability set
}

// Add provider capabilities
const providerName = user.metadata?.provider as AuthProviderName;
    if (providerName && DEFAULT_PROVIDER_CAPABILITIES[providerName]) {
      DEFAULT_PROVIDER_CAPABILITIES[providerName].forEach(cap => capabilities.add(cap));
    }
    
    // Add capabilities from linked accounts if enabled
    if (options?.includeLinkedAccounts && user.walletAddresses?.length) {
      DEFAULT_PROVIDER_CAPABILITIES.web3.forEach(cap => capabilities.add(cap));
    }
    
    return capabilities;
  }
  
  /**
   * Checks if a user has a capability
   */
  hasCapability(user: User | null, capability: AuthCapability, options?: CapabilityCheckOptions): boolean {
    const capabilities = this.getUserCapabilities(user, options);
    return capabilities.has(capability);
  }
}
