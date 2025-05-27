import React, { useState } from 'react';
import { Web3AuthProvider, WalletConnectionOptions } from '../src/providers/web3';
import { AuthResponse, WalletType } from '../src/types/auth';

interface Web3LoginButtonProps {
  web3Provider: Web3AuthProvider;
  walletType: WalletType;
  onLoginSuccess?: (response: AuthResponse) => void;
  onLoginError?: (error: any) => void;
  chainId?: number;
  buttonText?: string;
  className?: string;
}

/**
 * React component for Web3 wallet login
 */
export const Web3LoginButton: React.FC<Web3LoginButtonProps> = ({
  web3Provider,
  walletType,
  onLoginSuccess,
  onLoginError,
  chainId = 1,
  buttonText,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      const options: WalletConnectionOptions = {
        chainId,
      };
      
      const response = await web3Provider.loginWithWallet(walletType, options);
      
      if (response.success) {
        onLoginSuccess?.(response);
      } else {
        onLoginError?.(response.error);
      }
    } catch (error) {
      onLoginError?.(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getButtonText = () => {
    if (isLoading) {
      return 'Connecting...';
    }
    
    if (buttonText) {
      return buttonText;
    }
    
    switch (walletType) {
      case 'metamask':
        return 'Connect with MetaMask';
      case 'walletconnect':
        return 'Connect with WalletConnect';
      default:
        return 'Connect Wallet';
    }
  };
  
  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={className}
    >
      {getButtonText()}
    </button>
  );
};
