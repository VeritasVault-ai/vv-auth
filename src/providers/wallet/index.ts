/**
 * Wallet Provider Module for vv-auth
 */
export interface MetaMaskProviderOptions {
  appName: string;
  appLogoUrl?: string;
  infuraId?: string;
  chainId?: number;
  requiredChainId?: number;
  rpcUrl?: string;
  auditLogEnabled?: boolean;
}

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && 
    typeof window.ethereum !== 'undefined' && 
    window.ethereum.isMetaMask === true;
};

// Placeholder for MetaMaskProvider
export class MetaMaskProvider {
  type = 'wallet';
  walletType = 'metamask';
  name = 'MetaMask';
  
  async isReady(): Promise<boolean> {
    return isMetaMaskInstalled();
  }
  
  // Other methods will be implemented in the full version
}

// Export a singleton instance
export const metamaskAuth = new MetaMaskProvider();
