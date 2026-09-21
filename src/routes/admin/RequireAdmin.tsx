import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { PixelLoader } from '../../ui';
import { SessionExpiredModal } from './SessionExpiredModal';

export interface RequireAdminProps {
  children?: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { role, roleStatus, isSessionExpired, lastAdminEmail, user } = useAuth();
  const location = useLocation();

  // 1. Initial or state transition checking state
  if (roleStatus === 'checking') {
    return <PixelLoader label="VERIFYING CREDENTIALS…" />;
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
