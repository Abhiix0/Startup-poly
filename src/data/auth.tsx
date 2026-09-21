import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getSessionRole, UserRole } from './client';
import { SessionExpiredModal } from '../routes/admin/SessionExpiredModal';
import { logger } from '../lib/logger';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  promptReAuth: () => void;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('none');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const wasAdminRef = useRef<boolean>(false);

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userRole = await getSessionRole();
        setRole(userRole);
        if (userRole === 'admin') {
          wasAdminRef.current = true;
        }
      } else {
        setRole('none');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      logger.debug('Auth', `onAuthStateChange: ${event}`);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const userRole = await getSessionRole();
        setRole(userRole);
        if (userRole === 'admin') {
          wasAdminRef.current = true;
          setIsSessionExpired(false);
        }
      } else {
        // If an admin lost session mid-game
        if (wasAdminRef.current) {
          logger.warn('Auth', 'Admin session was lost/expired. Attempting token refresh...');
          const { data, error } = await supabase.auth.refreshSession();
          if (error || !data.session) {
            setIsSessionExpired(true);
          }
        }
        setRole('none');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const promptReAuth = () => {
    setIsSessionExpired(true);
  };

  const loginAsAdmin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Sign in failed: no user returned');
      }

      // Verify admin membership in Postgres
      const verifiedRole = await getSessionRole();
      if (verifiedRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Not an admin account. Only authorized Tech Runners and Game Masters may sign in.');
      }

      setUser(data.user);
      setSession(data.session);
      setRole('admin');
      wasAdminRef.current = true;
      setIsSessionExpired(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole('none');
      wasAdminRef.current = false;
      setIsSessionExpired(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        isLoading: loading,
        isSessionExpired,
        promptReAuth,
        loginAsAdmin,
        login: loginAsAdmin,
        logout,
      }}
    >
      {children}
      <SessionExpiredModal
        isOpen={isSessionExpired}
        userEmail={user?.email || ''}
        onSuccess={() => setIsSessionExpired(false)}
      />
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
