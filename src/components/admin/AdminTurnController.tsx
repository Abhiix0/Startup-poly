import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCoins, formatStars, MARIO_CHARACTERS } from '../../constants/theme';
import { BOARD_SPACES } from '../../constants/board';
import { MapPin, Dices } from 'lucide-react';

export const AdminTurnController: React.FC = () => {
  const { state, rollDie, themeMode } = useGame();
  const activeTeam = state.teams[state.activeTeamIndex];
  const pendingLanding = state.pendingLanding;
  const pendingSale = state.pendingSale;
  const isLight = themeMode === 'light';

  const currentSpace = BOARD_SPACES[activeTeam?.position || 0];
  const isPending = !!pendingLanding || !!pendingSale;
  const char = MARIO_CHARACTERS[activeTeam?.number || 1] || MARIO_CHARACTERS[1];

  return (
    <div className={`p-6 rounded-3xl nes-box shadow-[6px_6px_0px_#000] space-y-5 ${
      isLight ? 'bg-white' : 'bg-[#181820]'
    }`}>
      {/* Turn Header & Identity */}
      <div className="flex items-center justify-between">
        <div>
          <span className={`font-pixel text-[9px] uppercase tracking-wider block font-bold ${
            isLight ? 'text-amber-800' : 'text-[#FBD000]'
          }`}>
            ⭐ CURRENT ACTIVE PLAYER
          </span>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="text-3xl animate-bounce">{char.icon}</span>
            <div>
              <h2 className={`font-pixel text-xl sm:text-2xl tracking-wide ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {char.characterName.toUpperCase()}
              </h2>
              <span className={`font-arcade text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                Team 0{activeTeam?.number} · {char.powerUp}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className={`font-pixel text-[8px] block font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            ROLL STATUS
          </span>
          {state.turnRolls > 0 ? (
            <span className="font-pixel text-[9px] text-[#22C55E] bg-[#22C55E]/15 border-2 border-[#22C55E] px-2.5 py-1 rounded-md inline-block mt-1 font-bold">
              ROLL #{state.turnRolls} {state.turnRolls > 1 ? '(1-UP ROLL!)' : ''}
            </span>
          ) : (
            <span className="font-pixel text-[9px] text-[#EAB308] bg-[#EAB308]/15 border-2 border-[#EAB308] px-2.5 py-1 rounded-md inline-block mt-1 font-bold">
              READY
            </span>
          )}
        </div>
      </div>

      {/* Team Summary Metrics Strip */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl nes-box text-xs ${
        isLight ? 'bg-slate-50' : 'bg-[#101014]'
      }`}>
        <div>
          <span className={`font-pixel text-[8px] block mb-1 font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>POSITION</span>
          <span className="font-pixel text-xs text-[#3B82F6] flex items-center gap-1 font-bold">
            <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
            SPACE {activeTeam.position + 1}
          </span>
        </div>
        <div>
          <span className={`font-pixel text-[8px] block mb-1 font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>COIN WALLET</span>
          <span className="font-pixel text-xs text-[#EAB308] font-bold">{formatCoins(activeTeam.cash)}</span>
        </div>
        <div>
          <span className={`font-pixel text-[8px] block mb-1 font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>STAR POINTS</span>
          <span className="font-pixel text-xs text-[#3B82F6] font-bold">{formatStars(activeTeam.cv)}</span>
        </div>
        <div>
          <span className={`font-pixel text-[8px] block mb-1 font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>WARP PIPES</span>
          <span className="font-pixel text-xs text-[#22C55E] font-bold">
            {activeTeam.businesses.length} / 3
          </span>
        </div>
      </div>

      {/* Large 3x2 Die Input Buttons: Question Mark Blocks */}
      {!isPending && (
        <div className="space-y-3 pt-1">
          <span className={`font-pixel text-[10px] uppercase tracking-wider flex items-center gap-2 font-bold ${
            isLight ? 'text-amber-900' : 'text-[#FBD000]'
          }`}>
            <Dices className="w-4 h-4 text-[#EAB308]" /> HIT DIE BLOCK (ENTER PHYSICAL ROLL)
          </span>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(val => (
              <button
                key={val}
                onClick={() => rollDie(val)}
                className={`h-16 rounded-xl flex items-center justify-center font-pixel text-xl transition cursor-pointer ${
                  val === 6
                    ? 'question-block text-black shadow-[4px_4px_0px_#8B3A00] animate-pulse'
                    : 'mario-btn-dark'
                }`}
              >
                <span>{val}</span>
                {val === 6 && (
                  <span className="font-pixel text-[8px] uppercase text-black ml-1.5 bg-white/60 px-1 py-0.5 rounded font-black">
                    +EXTRA
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

