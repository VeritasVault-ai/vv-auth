# User Personas & Stories

## Personas

1. **Retail DeFi User (Primary)**: Primarily uses MetaMask for trading, yield, and governance
2. **Institutional User (Future/Roadmap)**: Requires advanced wallet controls and permissions

## User Stories

### Retail DeFi User Stories

- As a retail user, I want to connect my wallet via Plurality to securely access my vault assets and functions.
- As a retail user, I want to deposit tokens to the vault through Plurality to earn yield.
- As a retail user, I want to withdraw tokens from the vault through Plurality so I retain control over my assets.
- As a retail user, I want to view my wallet address and vault balances via Plurality to track holdings.
- As a retail user, I want to participate in governance with my Plurality-connected wallet.

### Edge Cases

- As a user, I want actionable error messages if my wallet connection fails so I can fix the issue.
- As a user, I want alerts if my browser is unsupported with clear guidance on alternatives.
- As a user, I want to know exactly why a transaction failed and what I should do next.

## User Experience

### Entry Point & First-Time Experience

- Upon navigating to the vault, users are prompted with a modal to connect their MetaMask wallet via Plurality
- First-time users receive an educational message on the benefits and security guarantees of Plurality-mediated connection

### Core Experience Flow

#### Step 1: Connect Wallet
- User clicks "Connect Wallet," launching the Plurality-powered authentication workflow
- Plurality presents a branded, secure interface to walk the user through MetaMask connection
- On success, wallet address and balances appear in the app
- If an error occurs, an explicit error message is shown with remediation steps

#### Step 2: Deposit/Withdraw Assets
- User initiates deposit/withdrawal; Plurality manages the MetaMask transaction flow
- Real-time progress is displayed: "Awaiting signature," "Transaction sent," "Confirmation pending," and finally, "Success" or error

#### Step 3: Governance Participation
- Users cast votes for on-chain proposals directly through the connected wallet
- The app guides them through the required confirmations with security and context cues

#### Step 4: Errors & Logout
- If a session error, account/network change, or timeout occurs, Plurality triggers a secure logout and explanatory message
- Users can manually log out (via Plurality) any time with state cleared

### Advanced Features

- Automatic logout and messaging upon session timeout
- Instant warnings if the user switches accounts/networks, preventing transaction errors
- Browser support checks with actionable suggestions for unsupported environments

### UI/UX Highlights

- Security badges and compliance labels to build trust at connection and transaction steps
- Consistent, intuitive labeling and clear call-to-action prompts throughout all Plurality-controlled interactions
- Responsiveness for mobile and desktop, with accessible notifications and instructions

## User Narrative

Samantha, a retail DeFi user, discovers a promising yield vault. On her first visit, she's greeted by a clear modal explaining the benefits of connecting via Plurality—emphasizing both security and user control. She connects her MetaMask wallet in two clicks, guided by a secure Plurality interface. After Samantha connects her MetaMask wallet via Plurality, she is prompted to sign a secure challenge to log in. Once signed, her session is authenticated, and she can view her personalized vault dashboard and activity. As she deposits tokens, she receives immediate, plain-language feedback at every step—no confusion, no errors. When she decides to vote on a governance proposal, her connection remains stable, and the process is just as seamless, with real-time confirmation. Trusting the system, Samantha returns often, confident her experience will remain smooth and secure.