import { createClient, Session } from '@supabase/supabase-js';
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

export type ResolveRoleResult =
  | { role: UserRole; verified: true; error?: never }
  | { role: null; verified: false; error: Error };

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
 * Resolves the role for a given session by checking PostgreSQL permissions.
 * - No session -> { role: 'none', verified: true }
 * - Anonymous session -> { role: 'team', verified: true } (without invoking is_admin RPC)
 * - Authenticated session -> queries is_admin() RPC:
 *     - data === true -> { role: 'admin', verified: true }
 *     - data === false -> { role: 'team', verified: true }
 *     - error/network failure -> { role: null, verified: false, error }
 */
export async function resolveRole(session: Session | null): Promise<ResolveRoleResult> {
  if (!session || !session.user) {
    return { role: 'none', verified: true };
  }

  // Anonymous users are always team players; skip RPC
  if (session.user.is_anonymous) {
    return { role: 'team', verified: true };
  }

  try {
    const { data: isAdmin, error } = await supabase.rpc('is_admin');
    if (error) {
      return { role: null, verified: false, error: new Error(error.message) };
    }
    if (isAdmin === true) {
      return { role: 'admin', verified: true };
    }
    return { role: 'team', verified: true };
  } catch (err: any) {
    return {
      role: null,
      verified: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
