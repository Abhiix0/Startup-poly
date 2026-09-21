import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './data/auth';
import { ToastProvider, ErrorBoundary } from './ui';

// Routes
import { LandingPage } from './routes/public/LandingPage';
import { NotFoundPage } from './routes/public/NotFoundPage';
import { TeamJoinPage } from './routes/team/TeamJoinPage';
import { TeamDashboardPage } from './routes/team/TeamDashboardPage';
import { AdminLoginPage } from './routes/admin/AdminLoginPage';
import { RequireAdmin } from './routes/admin/RequireAdmin';
import { AdminDashboardPage } from './routes/admin/AdminDashboardPage';
import { AdminRoomPage } from './routes/admin/AdminRoomPage';
import { AdminHistoryPage } from './routes/admin/AdminHistoryPage';
import { AdminRoomHistoryPage } from './routes/admin/AdminRoomHistoryPage';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Root */}
              <Route path="/" element={<LandingPage />} />

              {/* Team Routes (Mobile-first) */}
              <Route path="/join" element={<TeamJoinPage />} />
              <Route path="/team" element={<TeamDashboardPage />} />

              {/* Admin Auth */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<RequireAdmin />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="room/:roomId" element={<AdminRoomPage />} />
                <Route path="history" element={<AdminHistoryPage />} />
                <Route path="history/:roomId" element={<AdminRoomHistoryPage />} />
              </Route>

              {/* Catch-all Not Found */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
