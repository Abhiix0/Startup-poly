import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, resolveRole, UserRole } from './client';
import { AuthError, mapSupabaseAuthError } from './authErrors';
import { logger } from '../lib/logger';

export type RoleStatus = 'checking' | 'verified' | 'unverified';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  roleStatus: RoleStatus;
  loading: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  lastAdminEmail?: string;
  promptReAuth: () => void;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const RETRY_DELAYS = [2000, 5000, 10000];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('none');
  const [roleStatus, setRoleStatus] = useState<RoleStatus>('checking');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  const wasAdminRef = useRef<boolean>(false);
  const intentionalSignOutRef = useRef<boolean>(false);
  const lastAdminEmailRef = useRef<string>('');
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef<number>(0);
  const activeSessionRef = useRef<Session | null>(null);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const verifyRole = useCallback(async (targetSession: Session | null) => {
    clearRetryTimer();

    if (!targetSession || !targetSession.user) {
      setRole('none');
      setRoleStatus('verified');
      setLoading(false);
      return;
    }

    const result = await resolveRole(targetSession);

    if (result.verified) {
      setRole(result.role);
      setRoleStatus('verified');
      retryAttemptRef.current = 0;

      if (result.role === 'admin') {
        wasAdminRef.current = true;
        if (targetSession.user.email) {
          lastAdminEmailRef.current = targetSession.user.email;
        }
        setIsSessionExpired(false);
      }
      setLoading(false);
    } else {
      // Unverified due to network/server failure: KEEP the previous role, mark unverified
      logger.warn('Auth', 'Role verification network failure. Preserving current role and retrying...', result.error);
      setRoleStatus('unverified');
      setLoading(false);

      // Schedule retry with exponential backoff: 2s -> 5s -> 10s -> 10s...
      const delay = RETRY_DELAYS[Math.min(retryAttemptRef.current, RETRY_DELAYS.length - 1)];
      retryAttemptRef.current += 1;

      retryTimerRef.current = setTimeout(() => {
        if (activeSessionRef.current) {
          verifyRole(activeSessionRef.current);
        }
      }, delay);
    }
  }, [clearRetryTimer]);

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      activeSessionRef.current = initialSession;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user?.email && wasAdminRef.current) {
        lastAdminEmailRef.current = initialSession.user.email;
      }
      verifyRole(initialSession);
    });

    // Synchronous auth state listener (must not be async)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      logger.debug('Auth', `onAuthStateChange: ${event}`);
      activeSessionRef.current = newSession;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_OUT') {
        if (intentionalSignOutRef.current) {
          // Intentional logout: skip session expired, clear admin memory
          wasAdminRef.current = false;
          lastAdminEmailRef.current = '';
          intentionalSignOutRef.current = false;
          setIsSessionExpired(false);
          setRole('none');
          setRoleStatus('verified');
        } else {
          // Unexpected SIGNED_OUT while admin (token revocation / expiry):
          // Surface expired modal, do not call refreshSession() here
          if (wasAdminRef.current) {
            setIsSessionExpired(true);
          }
          setRole('none');
          setRoleStatus('verified');
        }
        clearRetryTimer();
        setLoading(false);
        return;
      }

      if (newSession?.user) {
        if (newSession.user.email) {
          lastAdminEmailRef.current = newSession.user.email;
        }
        // Defer role verification to next tick
        setTimeout(() => {
          verifyRole(newSession);
        }, 0);
      } else {
        setRole('none');
        setRoleStatus('verified');
        setLoading(false);
      }
    });

    return () => {
      clearRetryTimer();
      subscription.unsubscribe();
    };
  }, [verifyRole, clearRetryTimer]);

  const promptReAuth = useCallback(() => {
    setIsSessionExpired(true);
  }, []);

  const loginAsAdmin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    clearRetryTimer();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw mapSupabaseAuthError(error);
      }

      if (!data.session || !data.user) {
        throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
      }

      activeSessionRef.current = data.session;

      // Verify PostgreSQL admin membership
      const roleResult = await resolveRole(data.session);

      if (!roleResult.verified) {
        await supabase.auth.signOut();
        throw new AuthError('NETWORK', "Can't reach the server. Check your connection.");
      }

      if (roleResult.role !== 'admin') {
        await supabase.auth.signOut();
        throw new AuthError('NOT_ADMIN', 'This account is not authorized for admin access.');
      }

      setUser(data.user);
      setSession(data.session);
      setRole('admin');
      setRoleStatus('verified');
      wasAdminRef.current = true;
      lastAdminEmailRef.current = data.user.email || email.trim();
      setIsSessionExpired(false);
      retryAttemptRef.current = 0;
    } catch (err: any) {
      if (err instanceof AuthError) {
        throw err;
      }
      throw mapSupabaseAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [clearRetryTimer]);

  const logout = useCallback(async () => {
    setLoading(true);
    clearRetryTimer();
    intentionalSignOutRef.current = true;
    try {
      await supabase.auth.signOut();
      activeSessionRef.current = null;
      setUser(null);
      setSession(null);
      setRole('none');
      setRoleStatus('verified');
      wasAdminRef.current = false;
      lastAdminEmailRef.current = '';
      setIsSessionExpired(false);
    } finally {
      setLoading(false);
      intentionalSignOutRef.current = false;
    }
  }, [clearRetryTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        roleStatus,
        loading,
        isLoading: loading || roleStatus === 'checking',
        isSessionExpired,
        lastAdminEmail: lastAdminEmailRef.current,
        promptReAuth,
        loginAsAdmin,
        login: loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
