import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { createWeb3AuthProvider, WalletConnectionOptions, Web3AuthConfig } from '../src/providers/web3';
import { ComplianceService } from '../src/services/compliance';

// Example of how to create and use the Web3 provider

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase environment variables are not set. ' +
    'Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Create configuration
const config: Web3AuthConfig = {
  domain: 'veritasvault.com',
  statement: 'Sign in to VeritasVault with your Ethereum account',
  uri: 'https://veritasvault.com',
  chainId: 1, // Ethereum mainnet
  supabaseClient,
  apiEndpoint: '/api/auth/web3',
  complianceEnabled: true,
};

// Create compliance service (optional)
const complianceService = new ComplianceService();

// Create Web3 provider
const web3Provider = createWeb3AuthProvider(config, complianceService);

// Example: Login with wallet
async function loginWithWalletExample() {
  const options: WalletConnectionOptions = {
    chainId: 1, // Ethereum mainnet
    rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
  };

  const response = await web3Provider.loginWithWallet('metamask', options);
  
  if (response.success) {
    console.log('Login successful:', response.user);
  } else {
    console.error('Login failed:', response.error);
  }
}

// Example: Sign message
async function signMessageExample() {
  try {
    const signature = await web3Provider.signMessage('Hello, VeritasVault!');
    console.log('Signature:', signature);
  } catch (error) {
    console.error('Failed to sign message:', error);
  }
}

// Example: Sign transaction
async function signTransactionExample() {
  try {
    const transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest> = {
      to: '0x1234567890123456789012345678901234567890',
      value: ethers.utils.parseEther('0.001'),
      gasLimit: 21000,
    };
    
    const signedTx = await web3Provider.signTransaction(transaction);
    console.log('Signed transaction:', signedTx);
  } catch (error) {
    console.error('Failed to sign transaction:', error);
  }
}

// Example: Send transaction
async function sendTransactionExample() {
  try {
    const transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest> = {
      to: '0x1234567890123456789012345678901234567890',
      value: ethers.utils.parseEther('0.001'),
      gasLimit: 21000,
    };
    
    const txResponse = await web3Provider.sendTransaction(transaction);
    console.log('Transaction sent:', txResponse.hash);
    
    // Wait for transaction to be mined
    const receipt = await txResponse.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
  } catch (error) {
    console.error('Failed to send transaction:', error);
  }
}

// Example: Link wallet to account
async function linkWalletExample() {
  try {
    const user = await web3Provider.linkCurrentWallet();
    if (user) {
      console.log('Wallet linked:', user.walletAddresses);
    } else {
      console.error('Failed to link wallet');
    }
  } catch (error) {
    console.error('Failed to link wallet:', error);
  }
}

// Example: Get wallet address
async function getWalletAddressExample() {
  try {
    const address = await web3Provider.getWalletAddress();
    console.log('Connected wallet address:', address);
  } catch (error) {
    console.error('Failed to get wallet address:', error);
  }
}

// Example: Listen for auth state changes
function setupAuthListener() {
  const unsubscribe = web3Provider.onAuthStateChanged((user) => {
    if (user) {
      console.log('User signed in:', user);
    } else {
      console.log('User signed out');
    }
  });
  
  // To stop listening later:
  // unsubscribe();
  
  return unsubscribe;
}

// Example: Logout
async function logoutExample() {
  const success = await web3Provider.logout();
  if (success) {
    console.log('Logout successful');
  } else {
    console.error('Logout failed');
  }
}
