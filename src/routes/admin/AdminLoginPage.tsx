import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { PixelButton, PixelCard, TextField, ErrorBanner, PixelBrickTile } from '../../ui';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  useEffect(() => {
    if (role === 'admin') {
      navigate(from, { replace: true });
    }
  }, [role, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your admin credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="p-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-pixel text-xs text-white drop-shadow-[2px_2px_0px_#102040] hover:text-[#FFCC00] transition-colors"
        >
          ◄ BACK TO START
        </Link>
        <span className="font-pixel text-[10px] text-white/90 bg-[#102040] px-3 py-1 border-2 border-white">
          EVENT ADMIN CONSOLE
        </span>
      </header>

      {/* Responsive width notice for small devices (< 1024px) */}
      <div className="lg:hidden bg-[#FFCC00] text-[#102040] px-4 py-2.5 text-center border-b-4 border-[#102040] shadow-[0_2px_0px_#102040]">
        <p className="font-pixel text-[11px] leading-relaxed">
          💻 Use a laptop for the admin console. Full operations grid is optimized for screens ≥ 1024px.
        </p>
      </div>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <PixelCard
            title="ADMIN AUTHENTICATION"
            headerBg="navy"
            variant="cream"
            padding="lg"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#FFCC00] border-3 border-[#102040] shadow-[2px_2px_0px_#102040] flex items-center justify-center mx-auto mb-3 font-pixel text-xl text-[#102040]">
                🔑
              </div>
              <h1 className="font-pixel text-sm uppercase text-[#102040] mb-1">
                EVENT ORGANIZER LOGIN
              </h1>
              <p className="font-mono text-xs text-[#64748B]">
                Supabase email & password for the verified admins table
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4">
                <ErrorBanner message={errorMsg} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextField
                label="Admin Email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@startupoly.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />

              <TextField
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />

              <div className="pt-2">
                <PixelButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  ENTER CONSOLE
                </PixelButton>
              </div>
            </form>
          </PixelCard>
        </div>
      </main>

      {/* Brick Ground Base */}
      <PixelBrickTile hasGrass={true} className="h-8" />
    </div>
  );
};
