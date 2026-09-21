import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './auth';
import { supabase, resolveRole } from './client';
import { AuthError } from './authErrors';

vi.mock('./client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    rpc: vi.fn(),
  },
  resolveRole: vi.fn(),
}));

describe('AuthProvider and useAuth', () => {
  let authStateCallback: ((event: string, session: any) => void) | null = null;
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    authStateCallback = null;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb: any) => {
      authStateCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } } as any;
    });

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('initializes with null session and role none', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.role).toBe('none');
    expect(result.current.roleStatus).toBe('verified');
    expect(result.current.loading).toBe(false);
    expect(result.current.isSessionExpired).toBe(false);
  });

  it('ensures onAuthStateChange handler is synchronous and not a Promise', () => {
    renderHook(() => useAuth(), { wrapper });

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
    const registeredCallback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0];

    // The callback must not return a Promise
    const returnVal = registeredCallback('SIGNED_IN', null);
    expect(returnVal).not.toBeInstanceOf(Promise);
    expect(returnVal).toBeUndefined();
  });

  it('initializes with anonymous session resolving directly to team role', async () => {
    const anonSession = {
      user: { id: 'anon-123', is_anonymous: true },
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: anonSession as any },
      error: null,
    } as any);

    vi.mocked(resolveRole).mockResolvedValue({
      role: 'team',
      verified: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(resolveRole).toHaveBeenCalledWith(anonSession);
    expect(result.current.role).toBe('team');
    expect(result.current.roleStatus).toBe('verified');
  });

  it('successfully logs in admin and updates auth state', async () => {
    const adminSession = {
      user: { id: 'admin-1', email: 'admin@startupoly.com', is_anonymous: false },
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: adminSession as any, user: adminSession.user as any },
      error: null,
    } as any);

    vi.mocked(resolveRole).mockResolvedValue({
      role: 'admin',
      verified: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.loginAsAdmin('admin@startupoly.com', 'SuperSecretPass123!');
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.roleStatus).toBe('verified');
    expect(result.current.user?.email).toBe('admin@startupoly.com');
    expect(result.current.isSessionExpired).toBe(false);
    expect(result.current.lastAdminEmail).toBe('admin@startupoly.com');
  });

  it('rejects login with NOT_ADMIN error and signs out if user is not in public.admins', async () => {
    const nonAdminSession = {
      user: { id: 'user-2', email: 'user@startupoly.com', is_anonymous: false },
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: nonAdminSession as any, user: nonAdminSession.user as any },
      error: null,
    } as any);

    vi.mocked(resolveRole).mockResolvedValue({
      role: 'none',
      verified: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let caughtError: any;
    await act(async () => {
      try {
        await result.current.loginAsAdmin('user@startupoly.com', 'Pass123456789!');
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(AuthError);
    expect(caughtError.code).toBe('NOT_ADMIN');
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.role).toBe('none');
  });

  it('rejects login with INVALID_CREDENTIALS on bad credentials', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials', status: 400 } as any,
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let caughtError: any;
    await act(async () => {
      try {
        await result.current.loginAsAdmin('admin@startupoly.com', 'wrongpassword');
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(AuthError);
    expect(caughtError.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects login with RATE_LIMITED on HTTP 429 response', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Too many requests', status: 429 } as any,
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let caughtError: any;
    await act(async () => {
      try {
        await result.current.loginAsAdmin('admin@startupoly.com', 'password');
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(AuthError);
    expect(caughtError.code).toBe('RATE_LIMITED');
  });

  it('handles intentional logout cleanly without triggering session expired modal', async () => {
    const adminSession = {
      user: { id: 'admin-1', email: 'admin@startupoly.com' },
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: adminSession as any, user: adminSession.user as any },
      error: null,
    } as any);

    vi.mocked(resolveRole).mockResolvedValue({
      role: 'admin',
      verified: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.loginAsAdmin('admin@startupoly.com', 'Pass123456789!');
    });

    expect(result.current.role).toBe('admin');

    await act(async () => {
      await result.current.logout();
      // Simulate SIGNED_OUT auth change triggered by logout
      if (authStateCallback) {
        authStateCallback('SIGNED_OUT', null);
      }
    });

    expect(result.current.role).toBe('none');
    expect(result.current.isSessionExpired).toBe(false);
  });

  it('surfaces session expired modal on unexpected SIGNED_OUT for active admin', async () => {
    const adminSession = {
      user: { id: 'admin-1', email: 'admin@startupoly.com' },
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: adminSession as any, user: adminSession.user as any },
      error: null,
    } as any);

    vi.mocked(resolveRole).mockResolvedValue({
      role: 'admin',
      verified: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.loginAsAdmin('admin@startupoly.com', 'Pass123456789!');
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.isSessionExpired).toBe(false);

    // Simulate unexpected SIGNED_OUT (e.g. token expired / remote revoke)
    await act(async () => {
      if (authStateCallback) {
        authStateCallback('SIGNED_OUT', null);
      }
    });

    expect(result.current.role).toBe('none');
    expect(result.current.isSessionExpired).toBe(true);
    expect(result.current.lastAdminEmail).toBe('admin@startupoly.com');
  });

  it('preserves existing role and schedules retry backoff on network failure during verification', async () => {
    const adminSession = {
      user: { id: 'admin-1', email: 'admin@startupoly.com' },
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: adminSession as any },
      error: null,
    } as any);

    // Initial role is admin
    vi.mocked(resolveRole).mockResolvedValueOnce({
      role: 'admin',
      verified: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.roleStatus).toBe('verified');

    // Next verification encounters network failure
    vi.mocked(resolveRole).mockResolvedValueOnce({
      role: null,
      verified: false,
      error: new Error('Network error'),
    });

    await act(async () => {
      if (authStateCallback) {
        authStateCallback('TOKEN_REFRESHED', adminSession);
      }
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });

    // Preserves 'admin' role, sets 'unverified'
    expect(result.current.role).toBe('admin');
    expect(result.current.roleStatus).toBe('unverified');

    // Verify retry succeeds after backoff delay
    vi.mocked(resolveRole).mockResolvedValueOnce({
      role: 'admin',
      verified: true,
    });

    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.roleStatus).toBe('verified');
  });
});
