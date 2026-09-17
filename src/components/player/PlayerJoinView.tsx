import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { MARIO_CHARACTERS } from '../../constants/theme';
import { Shield, Sparkles, Gamepad2, ArrowRight } from 'lucide-react';

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

  const selectedChar = MARIO_CHARACTERS[teamNumber] || MARIO_CHARACTERS[1];

  return (
    <div className="w-screen min-h-[100dvh] bg-[#3B82F6] text-black flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Pixel Dots & Mario Accents */}
      <div className="absolute top-6 left-8 bg-white/90 rounded-full w-24 h-8 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] pointer-events-none" />
      <div className="absolute top-12 right-10 bg-white/90 rounded-full w-32 h-10 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] pointer-events-none" />
      <div className="absolute top-28 left-4 text-3xl opacity-80 pointer-events-none animate-block-jump">❓</div>
      <div className="absolute top-20 right-6 text-3xl opacity-80 pointer-events-none animate-star-pulse">⭐</div>

      {/* Top Header */}
      <header className="w-full max-w-[390px] flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E52521] border-2 border-black flex items-center justify-center font-pixel text-sm text-white shadow-[2px_2px_0px_#000]">
            M
          </div>
          <div>
            <span className="font-pixel text-[11px] tracking-wider text-[#FBD000] drop-shadow-[2px_2px_0px_#000] block leading-none">
              STARTUPOLY
            </span>
            <span className="font-arcade text-[10px] text-white tracking-widest uppercase font-bold drop-shadow-[1px_1px_0px_#000]">
              WORLD 1-1 · 2K26
            </span>
          </div>
        </div>

        {onGoToAdminLogin && (
          <button
            onClick={onGoToAdminLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-black text-[9px] font-pixel text-black hover:bg-slate-100 shadow-[2px_2px_0px_#000] transition cursor-pointer"
          >
            <Shield className="w-3 h-3 text-[#22C55E]" /> GM LOGIN
          </button>
        )}
      </header>

      {/* Main 390px Mobile Box */}
      <main className="w-full max-w-[390px] my-auto space-y-4 z-10">
        {/* Title Badge */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-black text-[9px] font-pixel text-black shadow-[2px_2px_0px_#000]">
            <Gamepad2 className="w-3.5 h-3.5 text-[#3B82F6]" /> PLAYER SELECT
          </div>
          <h1 className="text-2xl font-pixel tracking-wider text-[#FBD000] drop-shadow-[3px_3px_0px_#000000]">
            JOIN MATCH
          </h1>
          <p className="font-arcade text-xs text-white font-bold drop-shadow-[1px_1px_0px_#000]">
            Choose your character & enter team PIN
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-100 border-2 border-black text-xs font-arcade text-rose-700 font-bold text-center shadow-[3px_3px_0px_#000]">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mario-card p-5 space-y-4">
          <div>
            <label className="font-pixel text-[8px] text-slate-700 block mb-1.5 uppercase">
              ROOM CODE
            </label>
            <input
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="EQX-4821"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-black font-pixel text-xs text-[#3B82F6] focus:outline-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div>
            <label className="font-pixel text-[8px] text-slate-700 block mb-1.5 uppercase flex items-center justify-between">
              <span>SELECT CHARACTER</span>
              <span className="text-[9px] text-slate-500 font-arcade">{selectedChar.powerUp}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {state.teams.slice(0, state.settings.teamCount).map(t => {
                const char = MARIO_CHARACTERS[t.number] || MARIO_CHARACTERS[1];
                const isSelected = teamNumber === t.number;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTeam(t.number)}
                    className={`py-2 px-1.5 rounded-xl border-2 border-black text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FBD000] text-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl leading-none">{char.icon}</span>
                    <span className="font-pixel text-[7px] text-black">{char.characterName}</span>
                    <span className="text-[8px] font-arcade text-slate-500 font-bold">T{t.number}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-pixel text-[8px] text-slate-700 block mb-1.5 uppercase">
              TEAM PIN
            </label>
            <input
              type="text"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4-digit PIN"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-black font-pixel text-xs text-black focus:outline-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-mario-yellow text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>PRESS START</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full mario-ground-footer flex items-center justify-center z-10">
        <span className="font-pixel text-[8px] text-white tracking-wider drop-shadow-[1px_1px_0px_#000]">
          THE EQUINOX E-SUMMIT 2K26 · SUPER MARIO CONSOLE
        </span>
      </footer>
    </div>
  );
};


