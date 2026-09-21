import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAdmin } from './RequireAdmin';
import * as authModule from '../../data/auth';

vi.mock('../../data/auth', () => ({
  useAuth: vi.fn(),
}));

describe('RequireAdmin', () => {
  const baseAuthMock: authModule.AuthContextType = {
    user: null,
    session: null,
    role: 'none',
    roleStatus: 'verified',
    loading: false,
    isLoading: false,
    isSessionExpired: false,
    lastAdminEmail: '',
    promptReAuth: vi.fn(),
    loginAsAdmin: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  };

  it('renders loading state when authentication is checking', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
      roleStatus: 'checking',
      loading: true,
      isLoading: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<RequireAdmin />}>
            <Route index element={<div>PROTECTED ADMIN DASHBOARD</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/VERIFYING CREDENTIALS/i)).toBeInTheDocument();
    expect(screen.queryByText(/PROTECTED ADMIN DASHBOARD/i)).not.toBeInTheDocument();
  });

  it('redirects to /admin/login when user role is not admin', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
      role: 'none',
      roleStatus: 'verified',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin/login" element={<div>ADMIN LOGIN FORM</div>} />
          <Route path="/admin" element={<RequireAdmin />}>
            <Route index element={<div>PROTECTED ADMIN DASHBOARD</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/ADMIN LOGIN FORM/i)).toBeInTheDocument();
    expect(screen.queryByText(/PROTECTED ADMIN DASHBOARD/i)).not.toBeInTheDocument();
  });

  it('renders children when role is admin and roleStatus is verified', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
      user: { id: 'admin-1', email: 'admin@startupoly.com' } as any,
      session: {} as any,
      role: 'admin',
      roleStatus: 'verified',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<RequireAdmin />}>
            <Route index element={<div>PROTECTED ADMIN DASHBOARD</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/PROTECTED ADMIN DASHBOARD/i)).toBeInTheDocument();
    expect(screen.queryByText(/Reconnecting… verifying admin session/i)).not.toBeInTheDocument();
  });

  it('renders children and reconnecting banner when role is admin and roleStatus is unverified', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
      user: { id: 'admin-1', email: 'admin@startupoly.com' } as any,
      session: {} as any,
      role: 'admin',
      roleStatus: 'unverified',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<RequireAdmin />}>
            <Route index element={<div>PROTECTED ADMIN DASHBOARD</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/PROTECTED ADMIN DASHBOARD/i)).toBeInTheDocument();
    expect(screen.getByText(/Reconnecting… verifying admin session/i)).toBeInTheDocument();
  });

  it('keeps children mounted and renders SessionExpiredModal when isSessionExpired is true', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
      user: null,
      role: 'none',
      roleStatus: 'verified',
      isSessionExpired: true,
      lastAdminEmail: 'admin@startupoly.com',
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin/login" element={<div>ADMIN LOGIN FORM</div>} />
          <Route path="/admin" element={<RequireAdmin />}>
            <Route index element={<div>PROTECTED ADMIN DASHBOARD (DRAFT FORM)</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Form remains in DOM under modal
    expect(screen.getByText(/PROTECTED ADMIN DASHBOARD \(DRAFT FORM\)/i)).toBeInTheDocument();
    // Modal is visible
    expect(screen.getByText(/SESSION EXPIRED/i)).toBeInTheDocument();
    // Did not redirect to login page
    expect(screen.queryByText(/ADMIN LOGIN FORM/i)).not.toBeInTheDocument();
  });
});
