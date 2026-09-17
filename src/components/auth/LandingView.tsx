import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Shield, ArrowRight, X, Play, Radio, Users } from 'lucide-react';
import { TEAM_METAS } from '../../constants/theme';

export const LandingView: React.FC = () => {
  const { state, loginPlayer, loginAdmin, setSimulatorMode } = useGame();

  const [activeModal, setActiveModal] = useState<'player' | 'admin' | null>(null);
  const [roomCode, setRoomCode] = useState<string>(state.matchCode);
  const [teamNumber, setTeamNumber] = useState<number>(1);
  const [pin, setPin] = useState<string>('1101');
  const [adminPass, setAdminPass] = useState<string>('2026');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = loginPlayer(roomCode, teamNumber, pin);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to join match');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const ok = loginAdmin(adminPass);
    if (!ok) {
      setErrorMsg('Invalid Game Master passcode (try "2026" or "admin")');
    }
  };

  const handleSelectTeam = (num: number) => {
    setTeamNumber(num);
    const team = state.teams.find(t => t.number === num);
    if (team) {
      setPin(team.pin);
    }
  };

  return (
    <div className="w-screen min-h-[100dvh] bg-[#0D0D0F] flex flex-col justify-between items-center relative overflow-hidden select-none text-[#F7F2F6]">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#7484FE]/10 blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-[420px] flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-2 px-3 py-1 bg-[#19191C] border border-white/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#33FF67] animate-ping" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">THE EQUINOX 2K26</span>
        </div>

        <button
          onClick={() => setSimulatorMode(true)}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-mono text-white/60 hover:text-white transition cursor-pointer"
        >
          SIMULATOR
        </button>
      </header>

      {/* Main Hero Card */}
      <main className="w-full max-w-[420px] flex flex-col items-center text-center px-4 my-auto z-10 space-y-6">
        {/* Startupoly Emblem */}
        <div className="w-20 h-20 rounded-3xl bg-[#7484FE] flex items-center justify-center shadow-xl shadow-[#7484FE]/30 relative border border-[#7484FE]">
          <span className="text-3xl font-black text-white">S</span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            STARTUPOLY
          </h1>
          <div className="inline-block px-3 py-0.5 bg-[#19191C] rounded-full border border-white/10">
            <span className="text-[10px] text-white/60 tracking-widest uppercase font-mono">
              THE EQUINOX E-SUMMIT 2K26
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-white/60 max-w-xs leading-relaxed">
          The physical outdoor startup simulation. Orchestrate business acquisitions, upgrades, and rival tolls in real time.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          {/* JOIN GAME Button (Player) */}
          <button
            onClick={() => { setErrorMsg(null); setActiveModal('player'); }}
            className="w-full btn-eqx-primary text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>JOIN MATCH AS TEAM</span>
          </button>

          {/* LOGIN Button (Game Master) */}
          <button
            onClick={() => { setErrorMsg(null); setActiveModal('admin'); }}
            className="w-full btn-eqx-secondary text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-[#7484FE]" />
            <span>GAME MASTER LOGIN</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 z-10 font-mono text-[10px] text-white/30 tracking-widest uppercase">
        THE EQUINOX E-SUMMIT 2K26 · STARTUPOLY
      </footer>

      {/* Modal: JOIN GAME (Player) */}
      {activeModal === 'player' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[420px] eqx-card-elevated p-6 space-y-4 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Join Match</h3>
                <span className="text-xs text-white/50">Select Team & Enter 4-digit PIN</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-[#19191C] border border-white/10 rounded-lg text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 rounded-xl text-xs text-[#FF5C7A] font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePlayerSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1">
                  ROOM CODE
                </label>
                <input
                  type="text"
                  required
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="EQX-4821"
                  className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-[#7484FE]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1">
                  SELECT YOUR TEAM
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {state.teams.slice(0, state.settings.teamCount).map(t => {
                    const meta = TEAM_METAS[t.number] || TEAM_METAS[1];
                    const isSelected = teamNumber === t.number;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTeam(t.number)}
                        className={`p-2.5 rounded-xl border transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#202024] border-[#7484FE] shadow-md'
                            : 'bg-[#141416] border-white/5 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        <span className="text-xs font-bold text-white">Team 0{t.number}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1">
                  TEAM PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-[#7484FE]"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-eqx-primary text-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>ENTER TEAM CONSOLE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: LOGIN (Admin) */}
      {activeModal === 'admin' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[420px] eqx-card-elevated p-6 space-y-4 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Game Master Login</h3>
                <span className="text-xs text-white/50">Authorized Referee Access</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-[#19191C] border border-white/10 rounded-lg text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 rounded-xl text-xs text-[#FF5C7A] font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1">
                  GAME MASTER PASSCODE
                </label>
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Enter passcode (2026)"
                  className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-[#7484FE]"
                />
                <span className="text-[11px] text-white/40 mt-1 block font-mono">
                  Default passcodes: <strong>2026</strong> or <strong>admin</strong>
                </span>
              </div>

              <button
                type="submit"
                className="w-full btn-eqx-primary text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>OPEN ADMIN CONSOLE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
