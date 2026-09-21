import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../data/auth';

export interface RequireAdminProps {
  children?: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nes-sky flex items-center justify-center p-4">
        <div className="bg-nes-card border-4 border-nes-navy shadow-pixel-lg p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-nes-gold border-3 border-nes-navy mx-auto mb-4 flex items-center justify-center font-pixel text-lg animate-spin">
            ★
          </div>
          <h2 className="font-pixel text-xs uppercase tracking-wider text-nes-navy mb-2">
            VERIFYING CREDENTIALS...
          </h2>
          <p className="font-mono text-xs text-nes-muted">Checking admin status with server</p>
        </div>
      </div>
    );
  }

  // Redirect to login for any non-admin role, regardless of how we got here.
  // This covers two distinct cases:
  //   1. "Never logged in" — role is 'none' from the very first render.
  //   2. "Session expired mid-session" — role transitions from 'admin' to 'none'
  //      after the onAuthStateChange SIGNED_OUT path settles (e.g. refresh token
  //      revoked while the admin was viewing a protected page).
  // In both cases the user is sent to /admin/login with state={{ from: location }}
  // so the login page can redirect back after successful re-authentication.
  if (role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
