import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Shield, ArrowLeft, Crown, Radio, Lock } from 'lucide-react';

interface AdminLoginProps {
  onBackToPlay?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPlay }) => {
  const { loginAdmin } = useGame();
  const [passcode, setPasscode] = useState<string>('2026');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const ok = loginAdmin(passcode);
    if (!ok) {
      setErrorMsg('Invalid Game Master passcode (try "2026" or "admin")');
    }
  };

  return (
    <div className="w-screen min-h-[100dvh] bg-[#0D0D0F] text-[#F7F2F6] flex flex-col justify-between p-6 sm:p-12 select-none relative overflow-hidden">
      {/* Subtle Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7484FE]/10 blur-[150px] pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between z-10 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7484FE] flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-[#7484FE]/30">
            GM
          </div>
          <div>
            <span className="font-bold text-sm tracking-wider text-white block leading-none">
              STARTUPOLY
            </span>
            <span className="text-[10px] text-white/50 tracking-widest uppercase font-mono">
              GAME MASTER CONTROL CONSOLE · 2K26
            </span>
          </div>
        </div>

        {onBackToPlay && (
          <button
            onClick={onBackToPlay}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#19191C] hover:bg-[#202024] border border-white/10 text-xs font-semibold text-white/70 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>PLAYER APP</span>
          </button>
        )}
      </header>

      {/* Main Split Layout */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 py-8">
        {/* Left Hero (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7484FE]/10 border border-[#7484FE]/30 text-xs font-bold text-[#7484FE]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#33FF67]" />
            <span>TOURNAMENT COMMAND DECK</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.2]">
            Authoritative Event Control Center
          </h1>

          <p className="text-sm text-white/60 max-w-lg leading-relaxed">
            Full digital control center for the physical STARTUPOLY live outdoor simulation. Validate dice rolls, resolve business acquisitions, manage crisis hazards, and calculate real-time startup valuations.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
            <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">MATCH DURATION</span>
              <span className="text-sm font-bold text-white font-mono">50 MINS</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">SQUAD CAPACITY</span>
              <span className="text-sm font-bold text-[#33FF67] font-mono">5–6 TEAMS</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">TRACK SPACES</span>
              <span className="text-sm font-bold text-[#7484FE] font-mono">24 SPACES</span>
            </div>
          </div>
        </div>

        {/* Right Login Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-8 rounded-3xl eqx-card-elevated space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#7484FE] mb-1">
                <Shield className="w-4 h-4" />
                <span>REFEREE AUTHENTICATION</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Enter Control Room
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Authorized Equinox event organizers and game masters only.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 text-xs text-[#FF5C7A] font-medium text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1.5">
                  GAME MASTER PASSCODE
                </label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (2026)"
                  className="w-full px-4 py-3 rounded-xl bg-[#141416] border border-white/10 font-mono text-sm text-white focus:outline-none focus:border-[#7484FE]"
                />
                <span className="text-[11px] text-white/40 mt-1.5 block">
                  Default event passcodes: <code className="text-[#33FF67] font-semibold">2026</code> or <code className="text-[#33FF67] font-semibold">admin</code>
                </span>
              </div>

              <button
                type="submit"
                className="w-full btn-eqx-primary py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                OPEN CONTROL ROOM ▶
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-center text-[11px] text-white/40 font-mono">
              THE EQUINOX E-SUMMIT 2K26 · STARTUPOLY
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between text-xs text-white/40 z-10 pt-4 border-t border-white/5 max-w-6xl w-full mx-auto font-mono">
        <span>THE EQUINOX E-SUMMIT 2K26</span>
        <span>STARTUPOLY DIGITAL CONTROL CONSOLE</span>
      </footer>
    </div>
  );
};
