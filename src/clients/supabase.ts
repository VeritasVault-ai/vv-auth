import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required');
  }
  
  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('Supabase URL must be a valid HTTPS URL');
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}

export class SupabaseAuthProvider {
  type = 'supabase';
  name = 'Supabase';
  
  // Methods will be implemented in the full version
}

// Export a singleton instance
export const supabaseAuth = new SupabaseAuthProvider();
