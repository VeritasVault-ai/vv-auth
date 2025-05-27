import { ethers } from 'ethers';
import { WalletAdapter, WalletConnectionOptions } from './wallet-adapter';
import { AuthError, AuthResponse, WalletType } from '../types/auth';

/**
 * Wallet session event types
 */
export type WalletSessionEvent = 
  | 'connected'
  | 'disconnected' 
  | 'chain_changed'
  | 'account_changed'
  | 'session_expired';

/**
 * Wallet session state
 */
export interface WalletSessionState {
  connected: boolean;
  walletType: WalletType | null;
  address: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
}

/**
 * Wallet orchestrator interface that coordinates all wallet interactions
 */
export interface WalletOrchestrator {
  // Session management
  connectWallet(walletType: WalletType, options?: WalletConnectionOptions): Promise<AuthResponse>;
  disconnectWallet(): Promise<boolean>;
  
  // Status and information
  getSessionState(): WalletSessionState;
  getWalletAddress(): Promise<string | null>;
  
  // Operations
  signMessage(message: string): Promise<string>;
  switchNetwork(chainId: number, rpcUrl?: string): Promise<boolean>;
  
  // Events
  onSessionChange(callback: (state: WalletSessionState, event: WalletSessionEvent) => void): () => void;
}