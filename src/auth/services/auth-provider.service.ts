import { AuthenticationState, UserProfile, LinkingState } from '../models/auth.models';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * AuthProvider manages authentication state and provides methods for
 * authentication, regardless of the method used (wallet, email, social)
 */
export class AuthProvider {
  // Current authentication state
  private authState = new BehaviorSubject<AuthenticationState>({
    status: 'UNAUTHENTICATED'
  });

  // Current user profile if authenticated
  private userProfile = new BehaviorSubject<UserProfile | null>(null);

  // Current linking operation state, if any
  private linkingState = new BehaviorSubject<LinkingState | null>(null);

  constructor(private apiService: any, private storageService: any) {
    // Check for existing session on initialization
    this.restoreSession();
  }

  /**
   * Attempt to restore session from storage
   */
  private restoreSession(): void {
    const token = this.storageService.getItem('auth_token');
    if (token) {
      // Validate token with backend
      this.apiService.validateToken(token).subscribe(
        (response: any) => {
          if (response.valid) {
            this.setAuthenticatedState(response.user, response.authenticatedWith);
          } else {
            this.clearSession();
          }
        },
        () => {
          this.clearSession();
        }
      );
    }
  }

  /**
   * Get current authentication state as an observable
   */
  getAuthState(): Observable<AuthenticationState> {
    return this.authState.asObservable();
  }

  /**
   * Get current user profile if authenticated
   */
  getUserProfile(): Observable<UserProfile | null> {
    return this.userProfile.asObservable();
  }

  /**
   * Get linked authentication methods for current user
   */
  getLinkedAuthenticationMethods(): Observable<('wallet' | 'email' | 'social')[]> {
    return this.authState.pipe(
      map(state => state.authenticatedWith || [])
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.authState.pipe(
      map(state => state.status === 'AUTHENTICATED')
    );
  }

  /**
   * Initiate email authentication process
   */
  authenticateWithEmail(email: string, password: string): Promise<void> {
    this.authState.next({
      status: 'CHALLENGE_PENDING'
    });

    return new Promise<void>((resolve, reject) => {
      this.apiService.authenticateWithEmail(email, password).subscribe(
        (response: any) => {
          if (response.success) {
            this.storageService.setItem('auth_token', response.token);
            this.setAuthenticatedState(response.user, ['email']);
            resolve();
          } else {
            this.setAuthErrorState(response.error || 'Authentication failed');
            reject(new Error(response.error || 'Authentication failed'));
          }
        },
        (error: any) => {
          this.setAuthErrorState(error.message || 'Authentication failed');
          reject(error);
        }
      );
    });
  }

  /**
   * Initiate wallet authentication process
   * @param signedChallenge The challenge signed by the wallet
   * @param walletAddress The wallet address
   */
  authenticateWithWallet(signedChallenge: string, walletAddress: string): Promise<void> {
    this.authState.next({
      status: 'CHALLENGE_PENDING'
    });

    return new Promise<void>((resolve, reject) => {
      this.apiService.authenticateWithWallet(signedChallenge, walletAddress).subscribe(
        (response: any) => {
          if (response.success) {
            this.storageService.setItem('auth_token', response.token);
            this.setAuthenticatedState(response.user, ['wallet']);
            resolve();
          } else {
            this.setAuthErrorState(response.error || 'Authentication failed');
            reject(new Error(response.error || 'Authentication failed'));
          }
        },
        (error: any) => {
          this.setAuthErrorState(error.message || 'Authentication failed');
          reject(error);
        }
      );
    });
  }

  /**
   * Initiate social authentication process
   */
  authenticateWithSocial(provider: string, token: string): Promise<void> {
    this.authState.next({
      status: 'CHALLENGE_PENDING'
    });

    return new Promise<void>((resolve, reject) => {
      this.apiService.authenticateWithSocial(provider, token).subscribe(
        (response: any) => {
          if (response.success) {
            this.storageService.setItem('auth_token', response.token);
            this.setAuthenticatedState(response.user, ['social']);
            resolve();
          } else {
            this.setAuthErrorState(response.error || 'Authentication failed');
            reject(new Error(response.error || 'Authentication failed'));
          }
        },
        (error: any) => {
          this.setAuthErrorState(error.message || 'Authentication failed');
          reject(error);
        }
      );
    });
  }

  /**
   * Begin linking a new authentication method to the current account
   */
  initiateMethodLinking(method: 'wallet' | 'email' | 'social'): void {
    this.linkingState.next({
      status: 'LINK_INITIATED',
      method
    });
  }

  /**
   * Complete the linking of a wallet to an existing account
   */
  linkWalletToAccount(signedChallenge: string, walletAddress: string): Promise<void> {
    this.linkingState.next({
      status: 'LINK_VERIFICATION_PENDING',
      method: 'wallet'
    });

    return new Promise<void>((resolve, reject) => {
      this.apiService.linkWalletToAccount(signedChallenge, walletAddress).subscribe(
        (response: any) => {
          if (response.success) {
            // Update auth state with new linked method
            const currentState = this.authState.value;
            const updatedMethods = [...(currentState.authenticatedWith || []), 'wallet'];
            
            this.authState.next({
              ...currentState,
              authenticatedWith: updatedMethods
            });
            
            this.linkingState.next({
              status: 'LINK_COMPLETE',
              method: 'wallet'
            });
            
            // Update user profile
            this.userProfile.next(response.user);
            
            resolve();
          } else {
            this.linkingState.next({
              status: 'LINK_ERROR',
              method: 'wallet',
              error: response.error || 'Failed to link wallet'
            });
            reject(new Error(response.error || 'Failed to link wallet'));
          }
        },
        (error: any) => {
          this.linkingState.next({
            status: 'LINK_ERROR',
            method: 'wallet',
            error: error.message || 'Failed to link wallet'
          });
          reject(error);
        }
      );
    });
  }

  /**
   * Complete the linking of an email to an existing account
   */
  linkEmailToAccount(email: string, password: string, verificationCode: string): Promise<void> {
    this.linkingState.next({
      status: 'LINK_VERIFICATION_PENDING',
      method: 'email'
    });

    return new Promise<void>((resolve, reject) => {
      this.apiService.linkEmailToAccount(email, password, verificationCode).subscribe(
        (response: any) => {
          if (response.success) {
            // Update auth state with new linked method
            const currentState = this.authState.value;
            const updatedMethods = [...(currentState.authenticatedWith || []), 'email'];
            
            this.authState.next({
              ...currentState,
              authenticatedWith: updatedMethods
            });
            
            this.linkingState.next({
              status: 'LINK_COMPLETE',
              method: 'email'
            });
            
            // Update user profile
            this.userProfile.next(response.user);
            
            resolve();
          } else {
            this.linkingState.next({
              status: 'LINK_ERROR',
              method: 'email',
              error: response.error || 'Failed to link email'
            });
            reject(new Error(response.error || 'Failed to link email'));
          }
        },
        (error: any) => {
          this.linkingState.next({
            status: 'LINK_ERROR',
            method: 'email',
            error: error.message || 'Failed to link email'
          });
          reject(error);
        }
      );
    });
  }

  /**
   * Log out the current user
   */
  logout(): void {
    this.apiService.logout().subscribe(
      () => {
        this.clearSession();
      },
      () => {
        this.clearSession();
      }
    );
  }

  /**
   * Clear the current session
   */
  clearSession(): void {
    this.storageService.removeItem('auth_token');
    this.authState.next({
      status: 'UNAUTHENTICATED'
    });
    this.userProfile.next(null);
  }

  /**
   * Get user permissions
   */
  getUserPermissions(): Observable<string[]> {
    return this.userProfile.pipe(
      map(profile => profile?.permissions || [])
    );
  }

  /**
   * Set authenticated state
   */
  private setAuthenticatedState(user: UserProfile, methods: ('wallet' | 'email' | 'social')[]): void {
    this.authState.next({
      status: 'AUTHENTICATED',
      authenticatedWith: methods,
      userId: user.id
    });
    this.userProfile.next(user);
  }

  /**
   * Set auth error state
   */
  private setAuthErrorState(error: string): void {
    this.authState.next({
      status: 'AUTH_ERROR',
      error
    });
  }
}