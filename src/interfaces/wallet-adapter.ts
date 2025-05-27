import { ethers } from 'ethers';
import { WalletType } from '../types/auth';

export interface WalletConnectionOptions {
  chainId?: number;
  rpcUrl?: string;
}

export interface WalletAdapter {
  readonly type: WalletType;
  
  connect(options?: WalletConnectionOptions): Promise<{
    provider: ethers.BrowserProvider;
    signer: ethers.Signer;
    address: string;
  }>;
  
  signMessage(message: string, signer: ethers.Signer): Promise<string>;
  getAddress(signer: ethers.Signer): Promise<string>;
  switchChain(provider: ethers.BrowserProvider, chainId: number, rpcUrl?: string): Promise<void>;
  /**
   * 
   * Connect to wallet
   * @returns Promise that resolves to the connected wallet address
   */
  connect(): Promise<string>;
  
  /**
   * Disconnect from wallet
   */
  disconnect(): Promise<void>;
  
  /**
   * Sign a message with the wallet
   * @param message Message to sign
   * @returns Promise that resolves to the signed message
   */
  signMessage(message: string): Promise<string>;
  
  /**
   * Send a transaction
   * @param transaction Transaction data
   * @returns Promise that resolves to the transaction hash
   */
  sendTransaction(transaction: any): Promise<string>;
  
  /**
   * Register a callback for when wallet is disconnected externally
   */
  onDisconnect(callback: () => void): void;
  
  /**
   * Get current wallet address if connected
   */
  getAddress(): string | null;
  
  /**
   * Get current chain ID if connected
   */
  getChainId(): number | null;
}