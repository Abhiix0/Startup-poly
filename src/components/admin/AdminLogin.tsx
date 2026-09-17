import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Shield, Sparkles, ArrowLeft, Crown, Castle } from 'lucide-react';

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
    <div className="w-screen min-h-[100dvh] bg-[#101014] text-[#FDF6E2] flex flex-col justify-between p-6 sm:p-12 select-none relative overflow-hidden">
      {/* Background Pixel Accents */}
      <div className="absolute top-10 right-10 text-5xl opacity-15 pointer-events-none animate-star-pulse">⭐</div>
      <div className="absolute bottom-10 left-10 text-5xl opacity-15 pointer-events-none animate-block-jump">🏰</div>

      {/* Top Header */}
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E52521] border-2 border-black flex items-center justify-center font-pixel text-base text-white shadow-[3px_3px_0px_#000]">
            GM
          </div>
          <div>
            <span className="font-pixel text-sm tracking-wider text-[#FBD000] block leading-none">
              STARTUPOLY
            </span>
            <span className="font-arcade text-[11px] text-[#A89F91] tracking-widest uppercase">
              GAME MASTER CASTLE · 2K26
            </span>
          </div>
        </div>

        {onBackToPlay && (
          <button
            onClick={onBackToPlay}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#262022] hover:bg-[#332A2D] border-2 border-black text-xs font-pixel text-[#A89F91] hover:text-[#FDF6E2] shadow-[2px_2px_0px_#000] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> PLAYER APP
          </button>
        )}
      </header>

      {/* Main Split Body (Desktop >= 1024px) */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 py-8">
        {/* Left Hero (55%) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E52521]/20 border-2 border-[#E52521] text-xs font-pixel text-[#E52521]">
            <Crown className="w-4 h-4 text-[#FBD000]" />
            GAME MASTER COMMAND DECK
          </div>

          <h1 className="text-3xl sm:text-5xl font-pixel tracking-wide text-[#FDF6E2] leading-[1.25] drop-shadow-[3px_3px_0px_#E52521]">
            RULE THE STARTUP WORLD!
          </h1>

          <p className="font-arcade text-base text-[#A89F91] max-w-lg leading-relaxed">
            Full digital control center for the physical STARTUPOLY live event. Orchestrate dice rolls, power-up cards, business upgrades, and star valuations in real-time.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
            <div className="p-3.5 rounded-xl bg-[#1B1718] border-2 border-[#3D3234] shadow-[3px_3px_0px_#000]">
              <span className="font-pixel text-[9px] uppercase text-[#A89F91] block mb-1">TIMER</span>
              <span className="font-pixel text-xs text-[#FBD000]">50 MIN</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1B1718] border-2 border-[#3D3234] shadow-[3px_3px_0px_#000]">
              <span className="font-pixel text-[9px] uppercase text-[#A89F91] block mb-1">PLAYERS</span>
              <span className="font-pixel text-xs text-[#43B047]">5–6 TEAMS</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1B1718] border-2 border-[#3D3234] shadow-[3px_3px_0px_#000]">
              <span className="font-pixel text-[9px] uppercase text-[#A89F91] block mb-1">WORLD</span>
              <span className="font-pixel text-xs text-[#5C94FC]">24 SPACES</span>
            </div>
          </div>
        </div>

        {/* Right Login Card (45%) */}
        <div className="lg:col-span-5">
          <div className="p-8 rounded-3xl bg-[#1B1718] border-3 border-[#FDF6E2] shadow-[8px_8px_0px_#000000] space-y-6">
            <div>
              <div className="flex items-center gap-2 font-pixel text-xs text-[#43B047] mb-1">
                <Shield className="w-4 h-4" /> AUTHENTICATION
              </div>
              <h2 className="text-xl font-pixel text-[#FDF6E2]">
                ENTER CASTLE
              </h2>
              <p className="font-arcade text-xs text-[#A89F91] mt-1">
                Authorized Equinox event organizers and referees only.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#E52521]/20 border-2 border-[#E52521] text-xs font-pixel text-[#E52521] text-center shadow-[3px_3px_0px_#000]">
                ⚠ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-pixel text-[10px] uppercase text-[#FBD000] block mb-1.5">
                  GAME MASTER PASSCODE
                </label>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (2026)"
                  className="w-full px-4 py-3 rounded-xl bg-[#101014] border-2 border-[#3D3234] font-pixel text-sm text-[#43B047] focus:outline-none focus:border-[#43B047] shadow-inner"
                />
                <span className="font-arcade text-xs text-[#A89F91] mt-1.5 block">
                  Default passcodes: <code className="text-[#43B047] font-bold">2026</code> or <code className="text-[#43B047] font-bold">admin</code>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl mario-btn-green font-pixel text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                OPEN CONTROL ROOM ▶
              </button>
            </form>

            <div className="pt-4 border-t-2 border-[#3D3234] text-center font-pixel text-[9px] text-[#A89F91]">
              THE EQUINOX E-SUMMIT 2K26 · SUPER MARIO EDITION
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between font-pixel text-[9px] text-[#A89F91]/70 z-10 pt-4 border-t-2 border-[#3D3234]">
        <span>THE EQUINOX E-SUMMIT 2K26</span>
        <span>STARTUPOLY CONSOLE</span>
      </footer>
    </div>
  );
};

