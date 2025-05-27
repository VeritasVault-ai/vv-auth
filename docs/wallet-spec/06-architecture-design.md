# Architecture Design for Wallet Integration

## System Architecture Overview

The wallet integration for our DeFi vault employs a layered architecture designed for security, extensibility, and compliance. This document details the architectural components, interactions, and design decisions with a specific focus on decoupling wallet connection from application authentication and supporting multiple authentication paths.

## Layered System Architecture

### 1. UI Layer
- Presents wallet prompts and receives session updates/statuses
- Displays connection state, transaction progress, and error feedback
- Provides interfaces for governance participation
- Renders security badges and compliance indicators
- Offers account management interfaces for linking multiple authentication methods

### 2. Wallet Orchestration Layer
- Manages all session, routing, error, and business logic for wallet workflows
- Coordinates the authentication flow after successful wallet connection
- Maintains clear separation between wallet connection state and application authentication state
- Ensures that logging out from the app does not require disconnecting the wallet, and vice versa
- Facilitates account linking between wallet and traditional authentication methods

### 3. Wallet Adapter Layer
- Realizes an internal wallet-provider interface through the `PluralityWalletAdapter`
- Facilitates all brokered interaction with Plurality middleware
- Abstracts wallet-specific implementation details from the rest of the application
- Follows adapter pattern for future wallet extensibility

### 4. Plurality Middleware (External)
- Provides wallet orchestration, compliance, and error handling as a service
- Conducts all actual blockchain wallet interactions
- Ensures regulatory compliance and security by design
- Shields the application from direct wallet API interactions

### 5. Repository/Auth Layer
- Stores vault and user data
- Connected to Orchestration Layer for user/session state
- Manages authentication tokens and session persistence
- Separates concerns between wallet connection and user authentication
- Maintains relationships between different authentication methods for the same user
- Provides flexible authentication pathway support (wallet or traditional)

## Authentication Flow Architecture

![Authentication Flow Diagram (Placeholder)]()

### Decoupled Authentication Process

1. **Wallet Connection**:
   - User initiates wallet connection via UI
   - Request routed through Orchestration Layer to Wallet Adapter
   - Wallet Adapter communicates with Plurality Middleware
   - Plurality presents branded interface for MetaMask connection
   - Upon successful connection, wallet address is available to application

2. **Application Authentication**:
   - Orchestration Layer detects successful wallet connection
   - Auth Provider generates a cryptographic challenge (nonce/message)
   - Challenge presented to user via Wallet Adapter and Plurality
   - User signs challenge with their connected wallet (via Plurality)
   - Signed message verified by backend Auth Provider
   - On first encounter, user account created (signup)
   - For returning users, existing session established (login)
   - Auth tokens managed independently from wallet connection

3. **Session Management**:
   - Application session can persist even if wallet is temporarily disconnected
   - User can log out of application without disconnecting wallet
   - User can disconnect wallet while maintaining application session
   - Security timeouts apply to both wallet connection and application session

## Mixed Authentication Support

### Multiple Authentication Pathways

The architecture supports multiple authentication methods, allowing users to:
- Register and authenticate with a wallet via Plurality
- Register and authenticate with email/password
- Register and authenticate with social login providers
- Link any combination of these methods to a single user account

### Authentication Method Registry

- Auth Provider maintains a registry of all authentication methods linked to each user
- Each method is verified independently before linking
- Strong cryptographic proof required for wallet linking
- Email verification required for email authentication
- OAuth verification for social authentication

### Account Linking Flow

1. **Initial Account Creation**:
   - User registers via any supported method (wallet, email/password, social)
   - Unique user profile created with the initial authentication method
   - User receives appropriate onboarding based on chosen authentication method
   
2. **Secondary Authentication Linking**:
   - Authenticated user initiates linking of additional authentication method
   - For wallet linking to existing account:
     - User connects wallet via Plurality
     - Challenge-signature process verifies wallet ownership
     - Upon verification, wallet address is linked to existing user profile
   - For email/social linking to wallet-created account:
     - User provides email or selects social provider
     - Standard verification flow (email code, OAuth) confirms ownership
     - Upon verification, email/social identity linked to wallet-created profile
   
3. **Authentication Flexibility**:
   - User can authenticate using any of their linked methods
   - All methods provide access to the same user profile and permissions
   - User can manage and unlink authentication methods through account settings

### Security Considerations for Mixed Authentication

- Privileged operations (e.g., withdrawals) may require specific authentication method
- Account recovery options vary based on linked authentication methods
- Cross-verification between methods for sensitive account changes
- Clear audit trail of which authentication method was used for each session

## Flow Diagram (Textual)

```
Primary Flow (Wallet):
UI → Orchestration Layer → Wallet Adapter (PluralityWalletAdapter) → Plurality Middleware → Wallet Provider (MetaMask)
                ↓
Repository/Auth Layer ↔ Orchestration Layer (user, vault state maintained here)

Alternative Flow (Email/Social):
UI → Orchestration Layer → Auth Provider → Identity Verification
                ↓
Repository/Auth Layer ↔ Orchestration Layer (user, vault state maintained here)

Account Linking:
UI → Orchestration Layer → [Wallet Adapter OR Auth Provider] → Verification → Auth Registry Update
```

## Security Architecture

### Separation of Concerns
- Wallet connection (proving control of address) is distinct from application authentication
- Challenge-response authentication prevents impersonation
- Authorization layers ensure appropriate access based on authenticated identity
- Authentication methods are verified independently before linking

### Data Protection
- Public addresses only transmitted to application
- Zero access to private keys or seed phrases
- Cryptographic verification of all transaction signing requests
- Secure session handling with automatic timeouts
- Encrypted storage of authentication method relationships

### Compliance Measures
- Automated KYC/AML checks via Plurality
- Transaction monitoring for suspicious activity
- Audit logging of sensitive operations
- Regulatory reporting capabilities
- Clear traceability between authentication methods

## State Management

### Wallet Connection States
- `DISCONNECTED`: No wallet connected
- `CONNECTING`: Connection in progress
- `CONNECTED`: Successfully connected
- `ERROR`: Connection failed with specific error code

### Authentication States
- `UNAUTHENTICATED`: No active authentication
- `CHALLENGE_PENDING`: Authentication challenge issued, awaiting signature/verification
- `AUTHENTICATED`: User successfully authenticated
- `AUTH_ERROR`: Authentication failed with specific error code

### Account Linking States
- `LINK_INITIATED`: User has requested to link a new authentication method
- `LINK_VERIFICATION_PENDING`: Waiting for verification of the new method
- `LINK_COMPLETE`: Authentication methods successfully linked
- `LINK_ERROR`: Failed to link authentication methods

### Transaction States
- `IDLE`: No active transaction
- `PREPARING`: Transaction being constructed
- `CONFIRMING`: Awaiting user confirmation
- `PENDING`: Submitted to blockchain
- `COMPLETE`: Successfully processed
- `FAILED`: Transaction failed with specific error

## Error Handling Architecture

### Error Categorization
- **Connection Errors**: Issues with wallet connectivity
- **Authentication Errors**: Challenges with proving ownership of address or account
- **Linking Errors**: Problems connecting multiple authentication methods
- **Authorization Errors**: Permission or authentication failures
- **Transaction Errors**: Issues with blockchain operations
- **Network Errors**: Communication failures
- **Validation Errors**: Input or state validation failures

### Error Flow
1. Error detected at source layer
2. Transformed to standardized error object
3. Enriched with context and resolution steps
4. Routed to appropriate handler
5. Presented to user with actionable information

## Extensibility Architecture

### Adapter Pattern Implementation
- Common interface for all wallet providers
- Factory method for adapter instantiation
- Strategy pattern for provider-specific behaviors
- Authentication provider interface for consistent method handling

### Future Integration Points
- Enterprise wallet support via adapter extensions
- Multi-chain support through extended adapter interfaces
- Hardware wallet integration pathway
- Additional social login providers
- Enterprise SSO integration
- Biometric authentication options

## Performance Considerations

- Lazy loading of wallet adapters and authentication providers
- Optimized state transitions
- Caching of frequent operations
- Batched blockchain operations where possible
- Efficient user profile retrieval regardless of authentication path

## Monitoring and Observability

- Instrumentation of key operations
- Performance metrics collection
- Error rate tracking by authentication method
- User journey analytics across authentication pathways
- Conversion tracking for account linking prompts
- Authentication method usage patterns