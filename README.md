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
