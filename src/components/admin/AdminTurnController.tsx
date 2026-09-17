import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, TEAM_METAS } from '../../constants/theme';
import { BOARD_SPACES } from '../../constants/board';
import { MapPin, Dices, Sparkles, AlertTriangle } from 'lucide-react';

export const AdminTurnController: React.FC = () => {
  const { state, rollDie } = useGame();
  const activeTeam = state.teams[state.activeTeamIndex];
  const pendingLanding = state.pendingLanding;
  const pendingSale = state.pendingSale;

  const currentSpace = BOARD_SPACES[activeTeam?.position || 0];
  const isPending = !!pendingLanding || !!pendingSale;
  const meta = TEAM_METAS[activeTeam?.number || 1] || TEAM_METAS[1];

  return (
    <div className="p-6 rounded-3xl eqx-card-elevated space-y-5">
      {/* Turn Header & Team Identity */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7484FE] block mb-1">
            CURRENT ACTIVE TURN
          </span>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border shadow-md"
              style={{ 
                backgroundColor: meta.badgeBg, 
                color: meta.color,
                borderColor: `${meta.color}40`
              }}
            >
              T0{activeTeam.number}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeTeam.name ? activeTeam.name.toUpperCase() : `TEAM 0${activeTeam.number}`}
              </h2>
              <span className="text-xs text-white/50">
                Position: Space {activeTeam.position + 1} ({currentSpace.name})
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
            TURN STATE
          </span>
          {state.turnRolls > 0 ? (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block mt-1 ${
              state.turnRolls >= 2 
                ? 'bg-[#FFBD59]/15 border-[#FFBD59]/40 text-[#FFBD59]'
                : 'bg-[#33FF67]/15 border-[#33FF67]/40 text-[#33FF67]'
            }`}>
              ROLL #{state.turnRolls} {state.turnRolls > 1 ? '(BONUS TURN)' : ''}
            </span>
          ) : (
            <span className="text-xs font-semibold text-white/80 bg-white/5 border border-white/10 px-3 py-1 rounded-full inline-block mt-1">
              READY TO ROLL
            </span>
          )}
        </div>
      </div>

      {/* Team Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-[#141416] border border-white/5 text-xs">
        <div>
          <span className="text-[10px] uppercase text-white/40 block mb-1 font-medium">BOARD SPACE</span>
          <span className="text-sm font-bold text-[#7484FE] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#7484FE]" />
            #{activeTeam.position + 1}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-white/40 block mb-1 font-medium">CASH WALLET</span>
          <span className="text-sm font-bold text-[#33FF67] font-mono">{formatCurrency(activeTeam.cash)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-white/40 block mb-1 font-medium">VALUATION</span>
          <span className="text-sm font-bold text-[#7484FE] font-mono">{formatNumber(activeTeam.cv)} CV</span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-white/40 block mb-1 font-medium">VENTURES</span>
          <span className="text-sm font-bold text-white font-mono">
            {activeTeam.businesses.length} / 3
          </span>
        </div>
      </div>

      {/* Dominant Physical Die Input (1 2 3 4 5 6) */}
      {!isPending && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-white/70 flex items-center gap-2">
              <Dices className="w-4 h-4 text-[#7484FE]" />
              <span>RECORD PHYSICAL DIE ROLL</span>
            </span>
            {state.turnRolls === 2 && (
              <span className="text-[10px] text-[#FF5C7A] font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Roll of 6 triggers 3x rollback penalty
              </span>
            )}
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6].map(val => (
              <button
                key={val}
                onClick={() => rollDie(val)}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer border ${
                  val === 6
                    ? 'bg-[#7484FE] hover:bg-[#8594FE] text-white border-[#7484FE] shadow-lg shadow-[#7484FE]/30'
                    : 'bg-[#202024] hover:bg-[#28282E] text-white border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-xl font-bold font-mono">{val}</span>
                {val === 6 && (
                  <span className="text-[9px] uppercase font-bold text-white/90">
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
