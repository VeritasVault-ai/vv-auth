import { Router } from 'next/router';
import { AuthProvider } from '../services/auth-provider.service';

/**
 * Basic authentication guard that checks if user is authenticated by any method
 */
export class AuthenticationGuard {
  constructor(private authProvider: AuthProvider, private router: Router) {}

  async canActivate(_route: any, state: any): Promise<boolean> {
    let isAuthenticated = false;
    try {
      isAuthenticated = await this.authProvider.isAuthenticated().toPromise();
    } catch (error) {
      // Log the error for debugging/monitoring
      console.error('Authentication check failed:', error);
      // Optionally, you could show a notification or report error here
      this.router.push({ pathname: '/login', query: { returnUrl: state.url } });
      return false;
    }
    if (isAuthenticated) {
      return true;
    }
    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;
    // Redirect to login page (Next.js Router uses push)
    this.router.push({ pathname: '/login', query: { returnUrl } });
    return false;
  }
}

// Define allowed authentication methods
export type AuthMethod = 'wallet' | 'email' | 'social';

/**
 * Guard requiring specific authentication method(s)
 */
export class MethodSpecificGuard {
  constructor(
    private authProvider: AuthProvider,
    private router: Router,
    private requiredMethods: AuthMethod[]
  ) {}

  async canActivate(_route: any, state: any): Promise<boolean> {
    let isAuthenticated = false;
    try {
      isAuthenticated = await this.authProvider.isAuthenticated().toPromise();
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.router.push({ pathname: '/login', query: { returnUrl: state.url } });
      return false;
    }
    if (!isAuthenticated) {
      this.router.push({ 
        pathname: '/login',
        query: { 
          returnUrl: state.url,
          requiredMethods: this.requiredMethods.join(',')
        } 
      });
      return false;
    }
    let linkedMethods: AuthMethod[] = [];
    try {
      linkedMethods = await this.authProvider.getLinkedAuthenticationMethods().toPromise();
    } catch (error) {
      console.error('Failed to retrieve linked authentication methods:', error);
      this.router.push({ pathname: '/login', query: { returnUrl: state.url } });
      return false;
    }
    // Check if user has at least one of the required methods
    const hasRequiredMethod = this.requiredMethods.some(method => 
      linkedMethods.includes(method)
    );
    if (hasRequiredMethod) {
      return true;
    }
    // Redirect to method linking page
    this.router.push({ 
      pathname: '/account/link-methods',
      query: { 
        required: this.requiredMethods.join(','),
        returnUrl: state.url 
      } 
    });
    return false;
  }
}

/**
 * Factory function to create a method-specific guard with the required methods
 */
export function createMethodSpecificGuard(
  authProvider: AuthProvider,
  router: Router,
  requiredMethods: AuthMethod[]
): MethodSpecificGuard {
  // Validate requiredMethods contains only allowed values
  const allowed: AuthMethod[] = ['wallet', 'email', 'social'];
  const invalid = requiredMethods.filter(
    (method) => !allowed.includes(method)
  );
  if (invalid.length > 0) {
    throw new Error(
      `Invalid authentication method(s) provided: ${invalid.join(', ')}`
    );
  }
  return new MethodSpecificGuard(authProvider, router, requiredMethods);
}