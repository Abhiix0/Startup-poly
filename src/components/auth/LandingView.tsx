import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Shield, Sparkles, Gamepad2, ArrowRight, X, Play } from 'lucide-react';
import { MARIO_CHARACTERS } from '../../constants/theme';

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

  const selectedChar = MARIO_CHARACTERS[teamNumber] || MARIO_CHARACTERS[1];

  return (
    <div className="w-screen min-h-[100dvh] bg-[#3B82F6] flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* Background Pixel Clouds */}
      <div className="absolute top-6 left-8 bg-white/90 rounded-full w-24 h-8 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] pointer-events-none" />
      <div className="absolute top-12 right-10 bg-white/90 rounded-full w-32 h-10 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] pointer-events-none" />
      <div className="absolute top-28 left-4 text-3xl opacity-80 pointer-events-none animate-block-jump">❓</div>
      <div className="absolute top-20 right-6 text-3xl opacity-80 pointer-events-none animate-star-pulse">⭐</div>

      {/* Top Header / Arena Dev Link */}
      <header className="w-full max-w-[400px] flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 border-2 border-black rounded-full shadow-[2px_2px_0px_#000]">
          <span className="text-xs">🍄</span>
          <span className="font-pixel text-[9px] text-black">THE EQUINOX 2K26</span>
        </div>

        <button
          onClick={() => setSimulatorMode(true)}
          className="px-3 py-1 bg-[#FBD000] border-2 border-black rounded-full font-pixel text-[8px] text-black shadow-[2px_2px_0px_#000] hover:bg-[#FCE150] transition cursor-pointer"
        >
          ARENA TEST
        </button>
      </header>

      {/* Main Splash Content (Screen 1) */}
      <main className="w-full max-w-[390px] flex flex-col items-center text-center px-4 my-auto z-10 space-y-4">
        {/* Mario Star Emblem */}
        <div className="w-20 h-20 bg-[#FBD000] border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] relative animate-star-pulse">
          <span className="text-4xl">⭐</span>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#E52521] border-2 border-black rounded-full flex items-center justify-center text-[10px] font-pixel text-white">
            M
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="font-pixel text-3xl sm:text-4xl text-[#FBD000] drop-shadow-[3px_3px_0px_#000000] tracking-wider">
            STARTUPOLY
          </h1>
          <div className="inline-block px-3 py-0.5 bg-black/80 rounded border border-white/20">
            <span className="font-pixel text-[9px] text-white tracking-widest uppercase">
              E-SUMMIT 2K26
            </span>
          </div>
        </div>

        {/* Tagline Ribbon */}
        <div className="px-4 py-1.5 bg-[#FFF8E7] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <span className="font-arcade text-xs font-black text-black tracking-widest">
            ★ DREAM · BUILD · GROW ★
          </span>
        </div>

        {/* 8-bit Mario on Brick Ground */}
        <div className="py-2 flex flex-col items-center">
          <div className="text-5xl animate-bounce">
            🍄
          </div>
          <div className="w-36 h-3 bg-[#D97706] border-2 border-black rounded shadow-[2px_2px_0px_#000] mt-1" />
        </div>

        {/* Two Big 3D Arcade Buttons */}
        <div className="w-full space-y-3 pt-2">
          {/* Green LOGIN Button (Game Master) */}
          <button
            onClick={() => { setErrorMsg(null); setActiveModal('admin'); }}
            className="w-full btn-mario-green text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>LOGIN</span>
          </button>

          {/* Yellow JOIN GAME Button (Player) */}
          <button
            onClick={() => { setErrorMsg(null); setActiveModal('player'); }}
            className="w-full btn-mario-yellow text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>JOIN GAME</span>
          </button>
        </div>
      </main>

      {/* Ground Footer */}
      <footer className="w-full mario-ground-footer flex items-center justify-center z-10">
        <span className="font-pixel text-[8px] text-white tracking-wider drop-shadow-[1px_1px_0px_#000]">
          THE EQUINOX E-SUMMIT 2K26 · WORLD 1-1
        </span>
      </footer>

      {/* Modal / Dialog for JOIN GAME (Player) */}
      {activeModal === 'player' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[390px] mario-card p-5 space-y-4 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍄</span>
                <div>
                  <h3 className="font-pixel text-xs text-black">JOIN MATCH</h3>
                  <span className="font-arcade text-[10px] text-slate-600 font-bold">Select Team & Enter PIN</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-black hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-100 border-2 border-black rounded-xl font-arcade text-xs text-rose-700 font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handlePlayerSubmit} className="space-y-3">
              <div>
                <label className="font-pixel text-[8px] text-slate-700 block mb-1">
                  ROOM CODE
                </label>
                <input
                  type="text"
                  required
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="EQX-4821"
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-pixel text-xs text-[#3B82F6] focus:outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div>
                <label className="font-pixel text-[8px] text-slate-700 block mb-1">
                  SELECT TEAM
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {state.teams.slice(0, state.settings.teamCount).map(t => {
                    const char = MARIO_CHARACTERS[t.number] || MARIO_CHARACTERS[1];
                    const isSelected = teamNumber === t.number;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTeam(t.number)}
                        className={`p-2 rounded-xl border-2 border-black transition flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#FBD000] text-black shadow-[2px_2px_0px_#000]'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-lg leading-none">{char.icon}</span>
                        <span className="font-pixel text-[7px]">{char.characterName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-pixel text-[8px] text-slate-700 block mb-1">
                  TEAM PIN
                </label>
                <input
                  type="text"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="4-digit PIN"
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-pixel text-xs text-black focus:outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-mario-yellow text-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>ENTER TEAM CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Dialog for LOGIN (Admin) */}
      {activeModal === 'admin' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[390px] mario-card p-5 space-y-4 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="font-pixel text-xs text-black">GAME MASTER LOGIN</h3>
                  <span className="font-arcade text-[10px] text-slate-600 font-bold">Admin Console Access</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-black hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-100 border-2 border-black rounded-xl font-arcade text-xs text-rose-700 font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="font-pixel text-[8px] text-slate-700 block mb-1">
                  GAME MASTER PASSCODE
                </label>
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Enter passcode (2026)"
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-pixel text-xs text-[#22C55E] focus:outline-none shadow-[2px_2px_0px_#000]"
                />
                <span className="font-arcade text-[10px] text-slate-500 mt-1 block">
                  Event passcode: <strong>2026</strong> or <strong>admin</strong>
                </span>
              </div>

              <button
                type="submit"
                className="w-full btn-mario-green text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>OPEN ADMIN CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

