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
