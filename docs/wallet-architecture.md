# Wallet Authentication Architecture

## Overview

The wallet authentication system follows a clean layered architecture with clear separation of concerns. This architecture is designed to be modular, maintainable, and extensible, allowing for easy integration of new wallet types and authentication methods.

## Architecture Layers

Our system is divided into four main layers:

```
┌───────────────────┐
│  Application UI   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│Wallet Orchestrator│  Coordinates all wallet interactions
└─────────┬─────────┘
          │
     ┌────┴────┐
     ▼         ▼
┌─────────┐ ┌─────────┐
│  Auth   │ │ Wallet  │ 
│Provider │ │Adapters │  Implementation-specific layers
└────┬────┘ └────┬────┘
     │           │
     │           ▼
     │        /───────\
     │       /         \
     │      │ Plurality │  External middleware service
     │       \         /
     │        \───────/
     │           │
     ▼           ▼
┌─────────┐     /   \
│  User   │    / Web3 \
│Repository│   \ APIs /  External systems
└─────────┘     \___/
```

> **Note**: For MetaMask and other supported wallets, the Wallet Adapters exclusively consume the Plurality.network middleware API rather than direct provider APIs. This ensures compliance by design across all wallet interactions.

### 1. Repository Layer

**Responsibility**: Handles database operations and user persistence.

This layer abstracts away the details of how user data is stored and retrieved. It provides a clean interface for the upper layers to interact with user data without knowing the implementation details.

**Key Components**:
- `UserRepository` interface
- `SupabaseUserRepository` implementation

### 2. Wallet Adapter Layer

**Responsibility**: Provides wallet-specific implementations and interfaces with Web3 APIs through Plurality.

This layer contains adapters for different wallet types (MetaMask, WalletConnect, etc.) and handles the communication with the Plurality middleware service, which in turn manages the low-level details of connecting to wallets, signing messages, and switching networks.

**Key Components**:
- `WalletAdapter` interface
- `PluralityMetaMaskAdapter` implementation - uses Plurality API for MetaMask interactions
- `PluralityWalletConnectAdapter` implementation - uses Plurality API for WalletConnect interactions

### 3. Wallet Orchestration Layer

**Responsibility**: Coordinates wallet workflows and manages wallet sessions.

This is the central coordination layer that:
- Manages the lifecycle of wallet connections
- Coordinates between UI interactions, authentication, and wallet operations
- Handles session state and events (connection, disconnection, chain changes, etc.)
- Provides a unified API for all wallet interactions
- Enforces additional compliance requirements beyond what Plurality provides

**Key Components**:
- `WalletOrchestrator` interface
- `DefaultWalletOrchestrator` implementation

### 4. Auth Provider Layer

**Responsibility**: Manages authentication and user identity.

This layer handles user authentication, maintains sessions, and provides user identity information to the application.

**Key Components**:
- `AuthProvider` interface
- `Web3AuthProvider` implementation

## Plurality Integration

Plurality.network serves as our middleware service for wallet interactions, providing several key benefits:

- **Standardized Wallet Access**: Plurality provides a consistent API for interacting with different wallet types
- **Built-in Compliance**: Plurality enforces regulatory requirements at the wallet interaction level
- **Enhanced Security**: Adds additional security measures to wallet operations
- **Institutional Controls**: Supports institutional-grade wallet access patterns

Our architecture integrates with Plurality exclusively through the Wallet Adapter layer. All wallet operations (connection, signing, network switching) go through Plurality rather than directly to wallet providers like MetaMask.

This approach means:
1. The rest of our stack remains wallet-provider agnostic
2. We inherit Plurality's compliance and security features
3. We can add our own application-specific compliance checks in the Orchestration Layer

## The Wallet Orchestration Layer

The Wallet Orchestration Layer serves as the central coordinator for all wallet-related operations:

- **Coordinates Wallet Sessions**: Manages the entire lifecycle of wallet connections, from initial connection to disconnection, including handling events like network changes and account switching.

- **Mediates Between Components**: Acts as the glue between the UI layer, Auth Provider, and Wallet Adapters (which in turn use Plurality), ensuring proper communication between components.

- **Centralizes Error Handling**: Provides consistent error handling and reporting for all wallet operations, including standardizing errors from Plurality.

- **Supports Extensibility**: Allows new wallet types to be added without changing the core orchestration logic.

- **Enforces Compliance**: While Plurality handles many compliance requirements, the orchestration layer can implement additional application-specific compliance checks and logging.

### Key Features

- **Unified Session Management**: Maintains a consistent session state across the application
- **Event-Based Architecture**: Provides callbacks for wallet state changes
- **Wallet Type Agnostic**: Works with any wallet type through the adapter pattern
- **Compliance Integration**: Built-in support for compliance checks and logging on top of Plurality's compliance features
- **Error Standardization**: Consistent error handling across all wallet operations

## Component Factory

The `AuthFactory` class provides a convenient way to create and wire together all the components of the authentication system:

```typescript
// Create the wallet authentication system
const walletOrchestrator = AuthFactory.createWalletAuth(
  supabaseClient,
  {
    domain: 'yourdomain.com',
    statement: 'Sign in to your account',
    uri: 'https://yourdomain.com',
    apiEndpoint: 'https://api.yourdomain.com/verify-signature',
    complianceEnabled: true,
    pluralityApiKey: 'your-plurality-api-key' // For Plurality integration
  },
  complianceService
);
```

## Usage Examples

### Connecting a Wallet

```typescript
// Connect to MetaMask on Ethereum Mainnet through Plurality
const response = await walletOrchestrator.connectWallet('metamask', {
  chainId: 1 // Ethereum Mainnet
});

if (response.success) {
  console.log('Connected with address:', await walletOrchestrator.getWalletAddress());
} else {
  console.error('Connection failed:', response.error.message);
}
```

### Monitoring Session Changes

```typescript
// Listen for session changes
const unsubscribe = walletOrchestrator.onSessionChange((state, event) => {
  console.log('Session changed:', event);
  
  if (event === 'chain_changed') {
    console.log('Now connected to chain ID:', state.chainId);
  } else if (event === 'account_changed') {
    console.log('Account changed to:', state.address);
  }
});

// Later, when no longer needed
unsubscribe();
```

### Signing Messages

```typescript
try {
  // This will use Plurality to sign the message
  const signature = await walletOrchestrator.signMessage('Hello, world!');
  console.log('Message signed:', signature);
} catch (error) {
  console.error('Failed to sign message:', error);
}
```

### Switching Networks

```typescript
// Switch to Polygon via Plurality
const success = await walletOrchestrator.switchNetwork(
  137, // Polygon Mainnet
  'https://polygon-rpc.com' // RPC URL if network needs to be added
);

if (success) {
  console.log('Successfully switched to Polygon');
} else {
  console.log('Failed to switch network');
}
```

### Disconnecting

```typescript
await walletOrchestrator.disconnectWallet();
console.log('Wallet disconnected');
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Interface Segregation**: Clean interfaces with specific purposes
3. **Testability**: Components can be tested in isolation
4. **Extensibility**: Easy to add new wallet types or authentication methods
5. **Maintainability**: Changes in one layer don't affect others
6. **Compliance**: Built-in support for regulatory requirements through Plurality and additional application-specific checks

By following this architecture, the application achieves a clean separation between authentication logic, wallet interactions, and data persistence, making it more maintainable and extensible.

## For Crystal Clarity

For all supported wallets, Adapters will interact through the Plurality.network middleware API. The rest of the stack remains provider-agnostic and compliant by design. This means:

1. Adding new wallet types only requires creating a new adapter that uses Plurality
2. Compliance and security features are inherited from Plurality
3. The application can focus on business logic rather than wallet integration details
4. Future updates to wallet providers won't affect the core architecture