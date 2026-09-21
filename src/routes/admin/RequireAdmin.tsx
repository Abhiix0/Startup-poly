import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { SessionExpiredModal } from './SessionExpiredModal';

export interface RequireAdminProps {
  children?: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { role, roleStatus, isSessionExpired, lastAdminEmail, user } = useAuth();
  const location = useLocation();

  // 1. Initial or state transition checking state
  if (roleStatus === 'checking') {
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

  const content = children ? <>{children}</> : <Outlet />;

  // 2. Session expired mid-match (token revocation or timeout): keep drafts mounted and overlay modal
  if (isSessionExpired) {
    return (
      <>
        {content}
        <SessionExpiredModal
          isOpen={true}
          userEmail={lastAdminEmail || user?.email || ''}
          onSuccess={() => {}}
        />
      </>
    );
  }

  // 3. Not an admin and not expired: redirect to login with return path
  if (role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 4. Admin role active: show reconnecting banner if network check is currently unverified
  return (
    <>
      {roleStatus === 'unverified' && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-[#FEF9C3] text-[#854D0E] border-2 border-[#102040] shadow-pixel-sm px-4 py-2 flex items-center gap-2 font-pixel text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
          <span>Reconnecting… verifying admin session</span>
        </div>
      )}
      {content}
    </>
  );
};
