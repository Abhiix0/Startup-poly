import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { AuthError } from '../../data/authErrors';
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
      // Navigation is triggered by the role === 'admin' effect above
    } catch (err: any) {
      if (err instanceof AuthError) {
        if (err.code === 'INVALID_CREDENTIALS') {
          setErrorMsg('Invalid email or password.');
        } else if (err.code === 'RATE_LIMITED') {
          setErrorMsg('Too many attempts. Wait a minute and try again.');
        } else if (err.code === 'NETWORK') {
          setErrorMsg("Can't reach the server. Check your connection.");
        } else if (err.code === 'NOT_ADMIN') {
          setErrorMsg('This account is not authorized for admin access.');
        } else {
          setErrorMsg('Sign-in failed. Try again.');
        }
      } else {
        setErrorMsg('Sign-in failed. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-nes-sky flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="p-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-pixel text-xs text-white drop-shadow-[2px_2px_0px_#102040] hover:text-nes-gold transition-colors"
        >
          ◄ BACK TO START
        </Link>
        <span className="font-pixel text-[10px] text-white/90 bg-nes-navy px-3 py-1 border-2 border-white">
          EVENT ADMIN CONSOLE
        </span>
      </header>

      {/* Responsive width notice for small devices (< 1024px) */}
      <div className="lg:hidden bg-nes-gold text-nes-navy px-4 py-2.5 text-center border-b-4 border-nes-navy shadow-[0_2px_0px_#102040]">
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
              <div className="w-12 h-12 bg-nes-gold border-3 border-nes-navy shadow-pixel-sm flex items-center justify-center mx-auto mb-3 font-pixel text-xl text-nes-navy">
                🔑
              </div>
              <h1 className="font-pixel text-sm uppercase text-nes-navy mb-1">
                EVENT ORGANIZER LOGIN
              </h1>
              <p className="font-mono text-xs text-nes-muted">
                Authorized organisers only.
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
                  disabled={isSubmitting}
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
