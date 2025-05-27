import { AuthProvider } from '../services/auth-provider.service';

/**
 * Basic authentication guard that checks if user is authenticated by any method
 */
export class AuthenticationGuard {
  constructor(private authProvider: AuthProvider, private router: any) {}

  async canActivate(route: any, state: any): Promise<boolean> {
    const isAuthenticated = await this.authProvider.isAuthenticated().toPromise();
    
    if (isAuthenticated) {
      return true;
    }
    
    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;
    
    // Redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
    return false;
  }
}

/**
 * Guard requiring specific authentication method(s)
 */
export class MethodSpecificGuard {
  constructor(
    private authProvider: AuthProvider,
    private router: any,
    private requiredMethods: ('wallet'|'email'|'social')[]
  ) {}

  async canActivate(route: any, state: any): Promise<boolean> {
    // First ensure user is authenticated at all
    const isAuthenticated = await this.authProvider.isAuthenticated().toPromise();
    if (!isAuthenticated) {
      // Redirect to login page
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: state.url,
          requiredMethods: this.requiredMethods.join(',')
        } 
      });
      return false;
    }
    
    // Get current linked methods
    const linkedMethods = await this.authProvider.getLinkedAuthenticationMethods().toPromise();
    
    // Check if user has at least one of the required methods
    const hasRequiredMethod = this.requiredMethods.some(method => 
      linkedMethods.includes(method)
    );
    
    if (hasRequiredMethod) {
      return true;
    }
    
    // Redirect to method linking page
    this.router.navigate(['/account/link-methods'], { 
      queryParams: { 
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
  router: any,
  requiredMethods: ('wallet'|'email'|'social')[]
): MethodSpecificGuard {
  return new MethodSpecificGuard(authProvider, router, requiredMethods);
}