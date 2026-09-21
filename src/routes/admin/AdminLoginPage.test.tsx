import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminLoginPage } from './AdminLoginPage';
import * as authModule from '../../data/auth';
import { AuthError } from '../../data/authErrors';

vi.mock('../../data/auth', () => ({
  useAuth: vi.fn(),
}));

describe('AdminLoginPage', () => {
  const mockLogin = vi.fn();
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
    loginAsAdmin: mockLogin,
    login: mockLogin,
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authModule.useAuth).mockReturnValue(baseAuthMock);
  });

  it('renders login form with exact subtitle copy', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLoginPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/EVENT CASTLE/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ADMIN ACCESS')).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin Email|Operator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ENTER CASTLE|ENTER CONSOLE/i })).toBeInTheDocument();
  });

  it('displays INVALID_CREDENTIALS error message on wrong password', async () => {
    mockLogin.mockRejectedValue(new AuthError('INVALID_CREDENTIALS', 'Invalid email or password.'));

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Admin Email|Operator/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /ENTER CASTLE|ENTER CONSOLE/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    });
  });

  it('displays NOT_ADMIN error message when account is not in public.admins', async () => {
    mockLogin.mockRejectedValue(new AuthError('NOT_ADMIN', 'This account is not authorized for admin access.'));

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Admin Email|Operator/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'validpass12345' } });
    fireEvent.click(screen.getByRole('button', { name: /ENTER CASTLE|ENTER CONSOLE/i }));

    await waitFor(() => {
      expect(screen.getByText('This account is not authorized for admin access.')).toBeInTheDocument();
    });
  });

  it('displays RATE_LIMITED error message when throttled', async () => {
    mockLogin.mockRejectedValue(new AuthError('RATE_LIMITED', 'Too many attempts. Wait a minute and try again.'));

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Admin Email|Operator/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass12345678' } });
    fireEvent.click(screen.getByRole('button', { name: /ENTER CASTLE|ENTER CONSOLE/i }));

    await waitFor(() => {
      expect(screen.getByText('Too many attempts. Wait a minute and try again.')).toBeInTheDocument();
    });
  });

  it('displays NETWORK error message on connection failure', async () => {
    mockLogin.mockRejectedValue(new AuthError('NETWORK', "Can't reach the server. Check your connection."));

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Admin Email|Operator/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass12345678' } });
    fireEvent.click(screen.getByRole('button', { name: /ENTER CASTLE|ENTER CONSOLE/i }));

    await waitFor(() => {
      expect(screen.getByText("Can't reach the server. Check your connection.")).toBeInTheDocument();
    });
  });

  it('navigates to return path when role becomes admin', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      ...baseAuthMock,
      role: 'admin',
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/login', state: { from: { pathname: '/admin/rooms/123' } } }]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/rooms/123" element={<div>TARGET ROOM PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('TARGET ROOM PAGE')).toBeInTheDocument();
  });
});
