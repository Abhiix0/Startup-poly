import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type UserRole = 'admin' | 'team' | 'none';

/**
 * Ensures an anonymous session exists for player phones.
 */
export async function ensureAnonymousSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw error;
    }
    return data.session;
  }
  return session;
}

/**
 * Derives user role server-side via Supabase permissions, never trusting localStorage flags.
 */
export async function getSessionRole(): Promise<UserRole> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) {
    return 'none';
  }

  // 1. Check if user is an admin by querying is_admin() RPC or admins table
  try {
    const { data: isAdmin, error } = await supabase.rpc('is_admin');
    if (!error && isAdmin === true) {
      return 'admin';
    }
  } catch {
    // Fall back to table query
    const { data } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (data) {
      return 'admin';
    }
  }

  // 2. Otherwise, if user has an active session (e.g. anonymous or claimed), they are a team player
  return 'team';
}
