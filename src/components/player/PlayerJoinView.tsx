import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TEAM_METAS } from '../../constants/theme';
import { Shield, ArrowRight, Gamepad2, Radio } from 'lucide-react';

interface PlayerJoinViewProps {
  onGoToAdminLogin?: () => void;
}

export const PlayerJoinView: React.FC<PlayerJoinViewProps> = ({ onGoToAdminLogin }) => {
  const { state, loginPlayer } = useGame();
  const [roomCode, setRoomCode] = useState<string>(state.matchCode);
  const [teamNumber, setTeamNumber] = useState<number>(1);
  const [pin, setPin] = useState<string>('1101');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = loginPlayer(roomCode, teamNumber, pin);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to join match');
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
    <div className="w-screen min-h-[100dvh] bg-[#0D0D0F] text-[#F7F2F6] flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7484FE]/10 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-[420px] flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7484FE] flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-[#7484FE]/30">
            S
          </div>
          <div>
            <span className="font-bold text-sm tracking-wider text-white block leading-none">
              STARTUPOLY
            </span>
            <span className="text-[10px] text-white/50 tracking-widest uppercase font-mono">
              THE EQUINOX 2K26
            </span>
          </div>
        </div>

        {onGoToAdminLogin && (
          <button
            onClick={onGoToAdminLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#19191C] border border-white/10 text-xs font-medium text-white/70 hover:text-white hover:bg-[#202024] transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#7484FE]" />
            <span>GM LOGIN</span>
          </button>
        )}
      </header>

      {/* Main Form Box */}
      <main className="w-full max-w-[420px] my-auto space-y-4 z-10">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19191C] border border-white/10 text-xs text-white/80">
            <Radio className="w-3 h-3 text-[#33FF67] animate-pulse" />
            <span>LIVE MATCH TERMINAL</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight pt-1">
            Join Startup Match
          </h1>
          <p className="text-xs text-white/50">
            Select your squad number and enter your team PIN
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 text-xs text-[#FF5C7A] font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="eqx-card-elevated p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1.5">
              ROOM CODE
            </label>
            <input
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="EQX-4821"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 font-mono text-sm text-white focus:outline-none focus:border-[#7484FE]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1.5">
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
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#202024] border-[#7484FE] shadow-md shadow-[#7484FE]/20'
                        : 'bg-[#141416] border-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: meta.color }} 
                    />
                    <span className="text-xs font-bold text-white">Team 0{t.number}</span>
                    <span className="text-[10px] text-white/40 font-mono">PIN: {t.pin}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-1.5">
              TEAM 4-DIGIT PIN
            </label>
            <input
              type="password"
              required
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 font-mono text-sm text-white focus:outline-none focus:border-[#7484FE]"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-eqx-primary text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>ENTER TEAM CONSOLE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-2 z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
          THE EQUINOX E-SUMMIT 2K26 · STARTUPOLY PHYSICAL SIMULATION
        </span>
      </footer>
    </div>
  );
};
