import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../interfaces/user-repository';
import { AuthResponse, User } from '../types/auth';

export class SupabaseUserRepository implements UserRepository {
  private supabaseClient: SupabaseClient;
  
  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }
  
  async getUser(): Promise<User | null> {
    const { data, error } = await this.supabaseClient.auth.getUser();
    if (error || !data.user) return null;
    return this.transformUser(data.user);
  }
  
  async signIn(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword(credentials);
    
    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'unknown',
          message: error.message || 'An unknown error occurred',
          originalError: error,
        }
      };
    }
    
    return {
      success: true,
      user: this.transformUser(data.user),
      session: data.session,
    };
  }
  
  async signOut(): Promise<{ error: any | null }> {
    return await this.supabaseClient.auth.signOut();
  }
  
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabaseClient.auth.onAuthStateChange(callback);
  }
  
  transformUser(supabaseUser: any): User | null {
    if (!supabaseUser) return null;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      emailVerified: supabaseUser.email_confirmed_at !== null,
      displayName: supabaseUser.user_metadata?.full_name || '',
      photoURL: supabaseUser.user_metadata?.avatar_url || '',
      walletAddresses: supabaseUser.user_metadata?.wallet_addresses || [],
      metadata: {
        ...supabaseUser.user_metadata,
        provider: 'web3',
        lastSignInAt: supabaseUser.last_sign_in_at,
        createdAt: supabaseUser.created_at,
      },
    };
  }
}