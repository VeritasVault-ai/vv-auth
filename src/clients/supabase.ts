import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

export class SupabaseAuthProvider {
  type = 'supabase';
  name = 'Supabase';
  
  // Methods will be implemented in the full version
}

// Export a singleton instance
export const supabaseAuth = new SupabaseAuthProvider();
