import { SupabaseClient } from '@supabase/supabase-js';
import { Web3AuthProvider, Web3AuthConfig, createWeb3AuthProvider } from '../providers/web3';
import { WalletAdapter } from '../interfaces/wallet-adapter';
import { MetaMaskAdapter } from '../adapters/metamask-adapter';
import { WalletConnectAdapter } from '../adapters/walletconnect-adapter';
import { WalletOrchestrator, createWalletOrchestrator } from '../orchestrators/wallet-orchestrator';
import { ComplianceService } from '../services/compliance';
import { SupabaseUserRepository } from '../repositories/supabase-user-repo';

/**
 * Factory for creating the authentication system components
 */
export class AuthFactory {
  /**
   * Creates a complete wallet authentication system
   * 
   * @param supabaseClient - Supabase client instance
   * @param config - Web3 authentication configuration
   * @param complianceService - Optional compliance service
   * @returns Wallet orchestrator instance
   */
  static createWalletAuth(
    supabaseClient: SupabaseClient,
    config: Omit<Web3AuthConfig, 'supabaseClient'>,
    complianceService?: ComplianceService
  ): WalletOrchestrator {
    // Create user repository
    const userRepository = new SupabaseUserRepository(supabaseClient);
    
    // Create wallet adapters
    const walletAdapters: WalletAdapter[] = [
      new MetaMaskAdapter(),
      // Uncomment when implemented:
      // new WalletConnectAdapter(),
    ];
    
    // Create auth provider with full config
    const authProvider = createWeb3AuthProvider(
      {
        ...config,
        supabaseClient
      },
      complianceService
    );
    
    // Create and return orchestrator
    return createWalletOrchestrator(
      authProvider,
      walletAdapters,
      complianceService
    );
  }
}