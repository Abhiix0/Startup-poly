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
    loading: false,
    isLoading: false,
    isSessionExpired: false,
    promptReAuth: vi.fn(),
    loginAsAdmin: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  };

  it('renders loading state when authentication is checking', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
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

  it('renders children when role is admin', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
      user: { id: 'admin-1', email: 'admin@startupoly.com' } as any,
      session: {} as any,
      role: 'admin',
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
  });
});
