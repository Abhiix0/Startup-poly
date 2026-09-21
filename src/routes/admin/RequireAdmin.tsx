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
      <div className="min-h-screen bg-[#5C94FC] flex items-center justify-center p-4">
        <div className="bg-[#FAF8F5] border-4 border-[#102040] shadow-[6px_6px_0px_#102040] p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-[#FFCC00] border-3 border-[#102040] mx-auto mb-4 flex items-center justify-center font-pixel text-lg animate-spin">
            ★
          </div>
          <h2 className="font-pixel text-xs uppercase tracking-wider text-[#102040] mb-2">
            VERIFYING CREDENTIALS...
          </h2>
          <p className="font-mono text-xs text-[#64748B]">Checking admin status with server</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
