import { Eip1193Provider } from 'ethers';

declare global {
  interface Window {
    ethereum: Eip1193Provider & {
      isMetaMask?: boolean;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
      _metamask?: {
        isUnlocked?: () => Promise<boolean>;
      };
    };
  }
}

export {};