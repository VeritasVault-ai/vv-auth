import { SupabaseClient } from '@supabase/supabase-js';
import { WalletAdapter } from '../interfaces/wallet-adapter';
import { createWalletOrchestrator } from '../orchestrators/wallet-orchestrator';
import { Web3AuthConfig, createWeb3AuthProvider } from '../providers/web3';
import { ComplianceService } from '@/services/compliance';

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
  ) {
    // Create wallet adapters (MetaMaskAdapter is required via createWeb3AuthProvider)
    const walletAdapters: WalletAdapter[] = [];
    
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