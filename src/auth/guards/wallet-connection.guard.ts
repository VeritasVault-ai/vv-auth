import { WalletOrchestrator } from '../services/wallet-orchestrator.service';

/**
 * Guard requiring an active wallet connection
 * This is separate from authentication - a user could be authenticated
 * but not have an active wallet connection at the moment
 */
export class ActiveWalletGuard {
  constructor(private walletOrchestrator: WalletOrchestrator, private router: any) {}

  async canActivate(route: any, state: any): Promise<boolean> {
    const isConnected = await this.walletOrchestrator.isWalletConnected().toPromise();
    
    if (isConnected) {
      return true;
    }
    
    // Redirect to wallet connection page
    this.router.navigate(['/connect-wallet'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}

/**
 * Guard requiring specific permission for actions
 * This can check if an action requires specific authentication methods
 */
export class PermissionGuard {
  constructor(private permissionService: any, private router: any) {}

  canActivate(route: any, state: any): boolean {
    const requiredPermission = route.data.permission;
    
    if (!requiredPermission) {
      return true;
    }
    
    const hasPermission = this.permissionService.hasPermission(requiredPermission);
    
    if (hasPermission) {
      return true;
    }
    
    // Check if this permission requires a specific auth method
    const requiredMethod = this.permissionService.requiresSpecificMethod(requiredPermission);
    
    if (requiredMethod) {
      // Redirect to appropriate linking page
      this.router.navigate(['/account/link-methods'], { 
        queryParams: { 
          required: requiredMethod,
          returnUrl: state.url,
          permission: requiredPermission
        } 
      });
    } else {
      // Generic access denied
      this.router.navigate(['/access-denied']);
    }
    
    return false;
  }
}