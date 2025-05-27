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
