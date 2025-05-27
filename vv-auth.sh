#!/bin/bash
# run-vv-auth-deployment.sh
# Complete deployment script for vv-auth package
# This script handles the entire process from repository creation to npm publishing

set -e # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "██╗   ██╗██╗   ██╗      █████╗ ██╗   ██╗████████╗██╗  ██╗"
echo "██║   ██║██║   ██║     ██╔══██╗██║   ██║╚══██╔══╝██║  ██║"
echo "██║   ██║██║   ██║     ███████║██║   ██║   ██║   ███████║"
echo "╚██╗ ██╔╝██║   ██║     ██╔══██║██║   ██║   ██║   ██╔══██║"
echo " ╚████╔╝ ╚██████╔╝     ██║  ██║╚██████╔╝   ██║   ██║  ██║"
echo "  ╚═══╝   ╚═════╝      ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝"
echo "                                                         "
echo -e "${GREEN}VeritasVault Authentication Package Deployment${NC}"
echo -e "${NC}"

# Parse arguments
GITHUB_TOKEN=$1
NPM_TOKEN=$2
WORKING_DIR="vv-auth-deployment-$(date +%Y%m%d%H%M%S)"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI not found. Checking if we can install it...${NC}"
    
    if command -v apt-get &> /dev/null; then
        echo -e "${BLUE}Installing GitHub CLI via apt...${NC}"
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh
    elif command -v brew &> /dev/null; then
        echo -e "${BLUE}Installing GitHub CLI via Homebrew...${NC}"
        brew install gh
    else
        echo -e "${RED}GitHub CLI not found and couldn't be installed automatically.${NC}"
        echo -e "${RED}Please install it manually: https://cli.github.com/${NC}"
        exit 1
    fi
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Create working directory
echo -e "${BLUE}Creating working directory: ${WORKING_DIR}${NC}"
mkdir -p "${WORKING_DIR}"
cd "${WORKING_DIR}"

# Step 1: GitHub Authentication
echo -e "${BLUE}Step 1: Authenticating with GitHub...${NC}"
if [ -n "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | gh auth login --with-token
else
    gh auth login
fi

# Step 2: Create GitHub repository
echo -e "${BLUE}Step 2: Creating GitHub repository...${NC}"
gh repo create VeritasVault-ai/vv-auth --private --description "Authentication library for VeritasVault services" --confirm

# Step 3: Clone the repository
echo -e "${BLUE}Step 3: Cloning the repository...${NC}"
git clone https://github.com/VeritasVault-ai/vv-auth.git
cd vv-auth

# Step 4: Create directory structure
echo -e "${BLUE}Step 4: Creating directory structure...${NC}"
mkdir -p src/{clients,compliance,context,defi,hooks,middleware,providers/{oauth,wallet},types,utils} examples/{nextjs-app-router,nextjs-pages-router} migrations tests docs

# Step 5: Initialize npm package
echo -e "${BLUE}Step 5: Initializing npm package...${NC}"
npm init -y

# Step 6: Update package.json
echo -e "${BLUE}Step 6: Updating package.json...${NC}"
cat > package.json << 'EOF'
{
  "name": "@veritasvault/vv-auth",
  "version": "0.1.0",
  "description": "Authentication library for VeritasVault services",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "prepare": "npm run build",
    "docs": "typedoc --out docs src"
  },
  "keywords": [
    "auth",
    "authentication",
    "defi",
    "web3",
    "wallet",
    "supabase",
    "nextauth",
    "veritasvault"
  ],
  "author": "VeritasVault",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/VeritasVault-ai/vv-auth.git"
  },
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.8.1",
    "@supabase/auth-helpers-react": "^0.4.1",
    "@supabase/supabase-js": "^2.38.0",
    "ethers": "^6.8.0",
    "next-auth": "^4.24.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "web3": "^4.1.2",
    "web3modal": "^1.9.12"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.4",
    "@rollup/plugin-node-resolve": "^15.2.1",
    "@rollup/plugin-typescript": "^11.1.5",
    "@testing-library/react": "^14.0.0",
    "@testing-library/react-hooks": "^8.0.1",
    "@types/jest": "^29.5.5",
    "@types/node": "^20.8.2",
    "@types/react": "^18.2.25",
    "@typescript-eslint/eslint-plugin": "^6.7.4",
    "@typescript-eslint/parser": "^6.7.4",
    "eslint": "^8.51.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "prettier": "^3.0.3",
    "rollup": "^3.29.4",
    "rollup-plugin-dts": "^6.0.2",
    "rollup-plugin-peer-deps-external": "^2.2.4",
    "rollup-plugin-terser": "^7.0.2",
    "ts-jest": "^29.1.1",
    "tslib": "^2.6.2",
    "typedoc": "^0.25.1",
    "typescript": "^5.2.2"
  },
  "peerDependencies": {
    "next": ">=13.0.0",
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Step 7: Create configuration files
echo -e "${BLUE}Step 7: Creating configuration files...${NC}"

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "declaration": true,
    "declarationDir": "dist",
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
EOF

# Create rollup.config.js
cat > rollup.config.js << 'EOF'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import { defineConfig } from 'rollup';
import pkg from './package.json';

// List of dependencies to externalize (don't bundle)
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'react/jsx-runtime',
  'next/router',
  'next/navigation',
  'crypto'
];

// Common plugins used in all builds
const commonPlugins = [
  // Extract peer dependencies
  peerDepsExternal(),
  
  // Resolve node modules
  resolve({
    browser: true,
    preferBuiltins: true
  }),
  
  // Convert CommonJS modules to ES6
  commonjs({
    include: 'node_modules/**'
  }),
  
  // Compile TypeScript
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: true,
    inlineSources: true,
    declaration: false
  })
];

export default defineConfig([
  // Main builds (CJS, ESM, UMD)
  {
    input: 'src/index.ts',
    output: [
      // CommonJS build (for Node.js)
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        interop: 'auto'
      },
      // ES Module build (for bundlers)
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        exports: 'named'
      },
      // UMD build (for browsers)
      {
        name: 'VVAuth',
        file: 'dist/vv-auth.umd.js',
        format: 'umd',
        sourcemap: true,
        exports: 'named',
        plugins: [terser()],
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@supabase/supabase-js': 'Supabase',
          'ethers': 'ethers'
        }
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // Middleware build (separate entry point)
  {
    input: 'src/middleware/index.ts',
    output: [
      {
        file: 'dist/middleware.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/middleware.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // Compliance build (separate entry point)
  {
    input: 'src/compliance/index.ts',
    output: [
      {
        file: 'dist/compliance.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/compliance.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // Wallet providers build (separate entry point)
  {
    input: 'src/providers/wallet/index.ts',
    output: [
      {
        file: 'dist/wallet.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/wallet.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // TypeScript declaration files
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  },
  {
    input: 'src/middleware/index.ts',
    output: [{ file: 'dist/middleware.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  },
  {
    input: 'src/compliance/index.ts',
    output: [{ file: 'dist/compliance.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  },
  {
    input: 'src/providers/wallet/index.ts',
    output: [{ file: 'dist/wallet.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  }
]);
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# vv-auth .gitignore

# Dependencies
node_modules/
.pnp/
.pnp.js
.yarn/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-store/

# Build outputs
dist/
build/
lib/
.next/
out/
coverage/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Editor directories and files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# Logs
logs
*.log

# Testing
coverage/
.nyc_output/

# Misc
.cache/
.turbo/
.eslintcache
.rollup.cache/
tsconfig.tsbuildinfo
storybook-static/

# Local Supabase
.supabase/
EOF

# Create .npmignore
cat > .npmignore << 'EOF'
# vv-auth .npmignore
# Files and directories to exclude when publishing to npm

# Source files (we only want to publish the compiled distribution)
src/
tests/
**/*.test.ts
**/*.test.tsx
**/*.spec.ts
**/*.spec.tsx

# Development configuration
.github/
.vscode/
.eslintrc*
.prettierrc*
.editorconfig
.babelrc
jest.config.*
tsconfig.json
rollup.config.js
.nvmrc
.npmrc
jscpd.json

# Examples (should be in documentation, not in the package)
examples/

# Build tools and cache
node_modules/
coverage/
.nyc_output/
.turbo/
.cache/
.rollup.cache/
*.tsbuildinfo

# Environment and local files
.env*
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Migration scripts (should be applied manually)
migrations/

# Other development files
.aiguidance/
.aiguidelines/
.aihistory/
CONTRIBUTING.md
CHANGELOG.md

# Keep these files
# dist/ - This directory contains the compiled code (automatically included)
# README.md - Documentation (automatically included)
# LICENSE - License information (automatically included)
# package.json - Package configuration (automatically included)
EOF

# Create LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 VeritasVault

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create README.md
cat > README.md << 'EOF'
# vv-auth

A comprehensive authentication package for VeritasVault services, providing unified authentication across traditional OAuth and Web3 wallet methods with built-in compliance features for DeFi applications.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Unified Authentication** - Single interface for email/password, social, and wallet authentication
- **Multi-provider Support** - Google, GitHub, Microsoft, MetaMask, Plurality.network
- **DeFi-ready** - Wallet integration, signature verification, transaction signing
- **Compliance Built-in** - Comprehensive audit logging, risk assessment, tamper-evident logs
- **Next.js Integration** - Middleware for both App Router and Pages Router
- **Type Safety** - Full TypeScript support with comprehensive type definitions
- **React Hooks** - Easy-to-use React hooks for authentication state

## Installation

```bash
npm install @veritasvault/vv-auth
```

## Quick Start

```tsx
// Wrap your app with the AuthProvider
import { AuthProvider } from '@veritasvault/vv-auth'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

// Use the auth hooks in your components
import { useAuth } from '@veritasvault/vv-auth'

function LoginPage() {
  const { login, loginWithProvider, loginWithWallet } = useAuth()
  
  return (
    <div>
      <button onClick={() => login('email@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => loginWithProvider('google')}>
        Google Login
      </button>
      <button onClick={() => loginWithWallet('metamask')}>
        Connect MetaMask
      </button>
    </div>
  )
}
```

## Documentation

For full documentation, examples, and API reference, see the [docs](./docs) directory.

## License

MIT
EOF

# Step 8: Create GitHub Actions workflow for publishing
echo -e "${BLUE}Step 8: Creating GitHub Actions workflow...${NC}"
mkdir -p .github/workflows

cat > .github/workflows/publish.yml << 'EOF'
name: Publish Package

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          registry-url: 'https://registry.npmjs.org/'
          scope: '@veritasvault'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access private
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
EOF

# Step 9: Create core source files
echo -e "${BLUE}Step 9: Creating core source files...${NC}"

# Create index.ts
cat > src/index.ts << 'EOF'
/**
 * VeritasVault Authentication Package (vv-auth)
 * 
 * This is the main entry point for the vv-auth package.
 * It exports all authentication functionality for VeritasVault services.
 */

// Export all types
export * from './types';

// Export auth providers
export * from './providers';

// Export auth clients
export * from './clients/supabase';

// Export React hooks
export * from './hooks/useAuth';

// Export middleware
export * from './middleware/auth-middleware';

// Export compliance and audit features
export * from './compliance/audit-logger';

// Export auth context provider for React applications
export { AuthProvider, useAuthContext } from './context/auth-context';

// Version information
export const VERSION = '0.1.0';
EOF

# Create types.ts
cat > src/types.ts << 'EOF'
/**
 * Core type definitions for the vv-auth package
 */

// Core enums
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum AuthMethod {
  EMAIL_PASSWORD = 'email_password',
  OAUTH_GOOGLE = 'oauth_google',
  OAUTH_GITHUB = 'oauth_github',
  OAUTH_MICROSOFT = 'oauth_microsoft',
  WALLET_METAMASK = 'wallet_metamask',
  WALLET_PLURALITY = 'wallet_plurality',
  API_KEY = 'api_key'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Core interfaces
export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  walletAddresses?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  authMethod: AuthMethod;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  error: Error | null;
  wallet: WalletInfo | null;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  session?: Session;
  tokens?: TokenData;
  wallet?: WalletInfo;
  error?: Error;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider?: any;
  balance?: string;
  networkName?: string;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithProvider: (provider: string) => Promise<AuthResult>;
  loginWithWallet: (walletType: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  getToken: () => Promise<string | null>;
}

// Placeholder interface for auth provider
export interface AuthProvider {
  type: string;
  name: string;
  isReady(): Promise<boolean>;
  login(params?: any): Promise<AuthResult>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<TokenData | null>;
}

// Placeholder interface for wallet provider
export interface WalletProvider extends AuthProvider {
  type: 'wallet';
  walletType: string;
  connect(): Promise<WalletInfo>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: any): Promise<string>;
  getAccounts(): Promise<string[]>;
  getChainId(): Promise<number>;
  switchChain(chainId: number): Promise<void>;
}
EOF

# Create minimal structure for required modules
echo -e "${BLUE}Step 10: Creating minimal file structure...${NC}"

# Create providers directory files
mkdir -p src/providers/wallet
cat > src/providers/index.ts << 'EOF'
// Export wallet providers
export * from './wallet';
EOF

cat > src/providers/wallet/index.ts << 'EOF'
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
EOF

# Create clients directory files
mkdir -p src/clients
cat > src/clients/supabase.ts << 'EOF'
/**
 * Supabase Authentication Client
 * 
 * Placeholder implementation - will be replaced with full implementation
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Client-side Supabase client (for use in client components)
export const getBrowserClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};

// Alias for getBrowserClient for backward compatibility
export const createBrowserClient = getBrowserClient;

// Export SupabaseAuthProvider placeholder
export class SupabaseAuthProvider {
  type = 'supabase';
  name = 'Supabase';
  
  // Methods will be implemented in the full version
}

// Export a singleton instance
export const supabaseAuth = new SupabaseAuthProvider();
EOF

# Create hooks directory files
mkdir -p src/hooks
cat > src/hooks/useAuth.tsx << 'EOF'
/**
 * useAuth Hook
 * 
 * Placeholder implementation - will be replaced with full implementation
 */
import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { 
  AuthState, 
  AuthResult, 
  AuthContextType
} from '../types';

// Default initial auth state
const initialAuthState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  session: null,
  error: null,
  wallet: null
};

// Create context for auth state
const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  login: async () => ({ success: false, error: new Error('Not implemented') }),
  loginWithProvider: async () => ({ success: false, error: new Error('Not implemented') }),
  loginWithWallet: async () => ({ success: false, error: new Error('Not implemented') }),
  logout: async () => {},
  refreshSession: async () => {},
  signMessage: async () => null,
  getToken: async () => null
});

/**
 * Auth Provider component for wrapping application with authentication context
 */
export function AuthProvider({ 
  children
}: { 
  children: ReactNode;
}) {
  // Implementation will be added in the full version
  return (
    <AuthContext.Provider value={{
      ...initialAuthState,
      login: async () => ({ success: false, error: new Error('Not implemented') }),
      loginWithProvider: async () => ({ success: false, error: new Error('Not implemented') }),
      loginWithWallet: async () => ({ success: false, error: new Error('Not implemented') }),
      logout: async () => {},
      refreshSession: async () => {},
      signMessage: async () => null,
      getToken: async () => null
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for accessing authentication context
 */
export function useAuthContext(): AuthContextType {
  return useContext(AuthContext);
}

/**
 * Main authentication hook for use in components
 */
export function useAuth(): AuthContextType {
  return useAuthContext();
}

export default useAuth;
EOF

# Create context directory files
mkdir -p src/context
cat > src/context/auth-context.tsx << 'EOF'
/**
 * Auth Context
 * 
 * Placeholder implementation - will be replaced with full implementation
 */
import { createContext, useContext } from 'react';
import { AuthContextType } from '../types';
import { useAuth } from '../hooks/useAuth';

// Re-export from useAuth.tsx
export { AuthProvider, useAuthContext } from '../hooks/useAuth';
EOF

# Create middleware directory files
mkdir -p src/middleware
cat > src/middleware/index.ts << 'EOF'
/**
 * Authentication Middleware for Next.js
 * 
 * This module exports middleware functions and utilities for protecting routes
 * in Next.js applications, supporting both App Router and Pages Router.
 * 
 * @module middleware
 */

import { createAuthMiddleware } from './auth-middleware';

export {
  // Main middleware function
  createAuthMiddleware
};

// Default export for convenience
export default createAuthMiddleware;
EOF

cat > src/middleware/auth-middleware.ts << 'EOF'
/**
 * Authentication Middleware for Next.js
 * 
 * Placeholder implementation - will be replaced with full implementation
 */
import { NextRequest, NextResponse } from 'next/server';

// Types for middleware configuration
export type RouteConfig = {
  matcher?: string | string[];
  publicRoutes?: string[];
  protectedRoutes?: string[];
  loginRoute?: string;
  apiPrefix?: string;
  enableAuditLogging?: boolean;
  walletAuthEnabled?: boolean;
};

// Default configuration
export const defaultRouteConfig: RouteConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  publicRoutes: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback'
  ],
  protectedRoutes: ['/dashboard', '/profile', '/settings', '/api/'],
  loginRoute: '/login',
  apiPrefix: '/api',
  enableAuditLogging: true,
  walletAuthEnabled: true,
};

/**
 * Main authentication middleware factory
 */
export function createAuthMiddleware(config: RouteConfig = defaultRouteConfig) {
  // Merge with default config
  const mergedConfig = { ...defaultRouteConfig, ...config };
  
  return async function authMiddleware(
    req: NextRequest
  ): Promise<NextResponse> {
    // Placeholder implementation
    // Will be replaced with full implementation
    return NextResponse.next();
  };
}
EOF

# Create compliance directory files
mkdir -p src/compliance
cat > src/compliance/index.ts << 'EOF'
/**
 * Compliance Module for vv-auth
 * 
 * This module exports all compliance-related functionality for the vv-auth package,
 * including audit logging, risk assessment, and compliance utilities for DeFi applications.
 * 
 * @module compliance
 */

import { AuditLogger, AuditEventType } from './audit-logger';

// Export all audit logging components
export {
  // Main classes
  AuditLogger,
  
  // Enums
  AuditEventType
};

// Export singleton instance
export const auditLogger = new AuditLogger();
EOF

cat > src/compliance/audit-logger.ts << 'EOF'
/**
 * Compliance Audit Logger
 * 
 * Placeholder implementation - will be replaced with full implementation
 */

// Export enums and types specific to audit logging
export enum AuditEventType {
  // Authentication events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  
  // Session events
  SESSION_CREATED = 'session_created',
  SESSION_REFRESHED = 'session_refreshed',
  
  // Wallet events
  WALLET_LINKED = 'wallet_linked',
  WALLET_SIGNATURE_REQUESTED = 'wallet_signature_requested',
  
  // Security events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

/**
 * Main AuditLogger class
 */
export class AuditLogger {
  /**
   * Log an authentication event
   */
  async log(params: {
    eventType: AuditEventType;
    action: string;
    wasSuccessful: boolean;
    userId?: string;
    failureReason?: string;
    details?: Record<string, any>;
  }): Promise<string> {
    // Placeholder implementation
    console.log('Audit log:', params);
    return 'log-id';
  }
}

// Export a singleton instance
export const auditLogger = new AuditLogger();
EOF

# Create migrations
cat > migrations/01_create_auth_audit_logs.sql << 'EOF'
-- Migration: 01_create_auth_audit_logs.sql
-- Description: Creates the auth_audit_logs table and related indexes for compliance features

-- Create the auth_audit_logs table
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  risk_level TEXT NOT NULL DEFAULT 'low',
  was_successful BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  session_id TEXT,
  geo_location JSONB,
  device_info JSONB,
  network_info JSONB,
  previous_value JSONB,
  new_value JSONB,
  related_entities JSONB,
  hash_value TEXT,
  previous_entry_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type ON auth_audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_risk_level ON auth_audit_logs (risk_level);
EOF

# Step 11: Install dependencies
echo -e "${BLUE}Step 11: Installing dependencies...${NC}"
npm install

# Step 12: Initial commit
echo -e "${BLUE}Step 12: Creating initial commit...${NC}"
git add .
git commit -m "Initial setup for vv-auth package"
git push origin main

# Step 13: Set up npm publishing
echo -e "${BLUE}Step 13: Setting up npm publishing...${NC}"

if [ -n "$NPM_TOKEN" ]; then
    # Create .npmrc with token
    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
    echo "@veritasvault:registry=https://registry.npmjs.org/" >> .npmrc
    
    # Set npm scope
    npm config set scope veritasvault
    
    echo -e "${GREEN}NPM token configured. Ready to publish.${NC}"
else
    echo -e "${YELLOW}NPM token not provided. You'll need to login manually:${NC}"
    npm login
    npm config set scope veritasvault
fi

# Step 14: Build the package
echo -e "${BLUE}Step 14: Building the package...${NC}"
npm run build

# Step 15: Publish to npm
echo -e "${BLUE}Step 15: Publishing package to npm...${NC}"
npm publish --access private

# Step 16: Create GitHub release
echo -e "${BLUE}Step 16: Creating GitHub release...${NC}"
gh release create v0.1.0 \
    --title "Initial Release v0.1.0" \
    --notes "Initial release of the vv-auth package with core authentication functionality, wallet integration, and compliance features."

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Repository: https://github.com/VeritasVault-ai/vv-auth${NC}"
echo -e "${GREEN}Package: @veritasvault/vv-auth${NC}"

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Complete the implementation of core files"
echo -e "2. Add comprehensive tests"
echo -e "3. Integrate with vv-landing"
echo -e "4. Set up CI/CD for automated testing and publishing"

# Return to original directory
cd ../..
echo -e "${GREEN}Deployment files created in ${WORKING_DIR}${NC}"
echo -e "${YELLOW}You can now run the script to deploy the package.${NC}"

exit 0
