import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { AuthError } from '../../data/authErrors';
import {
  CastleBackground,
  WoodenSignboard,
  WoodenActionButton,
  RoamingCharacter,
} from '../../ui/pixel';
import { ErrorBanner } from '../../ui';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      setErrorMsg('Please enter both operator email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await login(email, password);
      // Success triggers role update & animation
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
    <CastleBackground isGateOpen={isSuccess}>
      {/* Top Navbar / Arrow Signpost */}
      <header className="p-3 sm:p-4 flex items-center justify-between z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-pixel text-xs bg-[#102040] text-[#FFCC00] px-3 py-1.5 border-2 border-[#102040] shadow-[3px_3px_0px_#102040] hover:bg-[#22B14C] hover:text-white transition-transform active:translate-x-0.5 active:translate-y-0.5"
        >
          <span>◄</span>
          <span>START</span>
        </Link>
        <span className="font-pixel text-[10px] text-white bg-[#102040] px-3 py-1 border-2 border-[#FFCC00] shadow-[2px_2px_0px_#102040]">
          🏰 EVENT CASTLE
        </span>
      </header>

      {/* Main Single-Column Game World Scene */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 z-10 relative">
        {/* Responsive Laptop Advisory Styled as Royal Decree Scroll (< 1024px) */}
        <div className="lg:hidden w-full max-w-md mb-3 bg-[#FFFBEB] border-3 border-[#102040] p-2.5 shadow-[4px_4px_0px_#102040] text-center">
          <p className="font-pixel text-[10px] sm:text-[11px] text-[#102040] leading-relaxed">
            💻 Use a laptop for the admin console (≥ 1024px)
          </p>
        </div>

        {/* Central Castle Notice Board / Signboard */}
        <WoodenSignboard
          title="🏰 EVENT CASTLE"
          subtitle="ADMIN ACCESS"
          instruction="AUTHORIZED EVENT STAFF ONLY"
          variant="castle"
          state={errorMsg ? 'shake' : isSuccess ? 'bounce' : 'idle'}
          maxWidth="max-w-md"
        >
          {errorMsg && (
            <div className="mb-2">
              <ErrorBanner message={errorMsg} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Operator / Username (Email) */}
            <div>
              <label
                htmlFor="admin-email"
                className="block font-pixel text-[11px] uppercase tracking-wider text-[#FFCC00] drop-shadow-[1px_1px_0px_#102040] mb-1.5"
              >
                OPERATOR / USERNAME
              </label>
              <input
                id="admin-email"
                aria-label="Admin Email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@startupoly.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full bg-[#1E293B] border-3 sm:border-4 border-[#102040] px-3.5 py-2.5 font-mono text-xs sm:text-sm text-[#FFFBEB] placeholder:text-slate-400 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>

            {/* Secret Key / Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block font-pixel text-[11px] uppercase tracking-wider text-[#FFCC00] drop-shadow-[1px_1px_0px_#102040] mb-1.5"
              >
                PASSWORD
              </label>
              <input
                id="admin-password"
                aria-label="Password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full bg-[#1E293B] border-3 sm:border-4 border-[#102040] px-3.5 py-2.5 font-mono text-xs sm:text-sm text-[#FFFBEB] placeholder:text-slate-400 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>

            {/* Wooden Plank Action Button */}
            <div className="pt-2">
              <WoodenActionButton
                type="submit"
                variant="gold"
                isLoading={isSubmitting}
                disabled={isSubmitting || isSuccess}
              >
                ENTER CASTLE →
              </WoodenActionButton>
            </div>
          </form>
        </WoodenSignboard>

        {/* Pixel Mascot Poly Patrols The Ground (Mobile & Desktop) */}
        <div className="absolute bottom-0 right-4 sm:right-16 md:right-28 pointer-events-none">
          <RoamingCharacter
            size={52}
            bubbleText={isSuccess ? 'Open Sesame!' : 'Admin Area'}
            isCheering={isSuccess}
          />
        </div>
      </main>
    </CastleBackground>
  );
};
