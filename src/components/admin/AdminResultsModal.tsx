import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, TEAM_METAS } from '../../constants/theme';
import { Trophy, RefreshCw, X } from 'lucide-react';

interface AdminResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminResultsModal: React.FC<AdminResultsModalProps> = ({ isOpen, onClose }) => {
  const { state, rankedTeams, resetMatch } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen && state.status !== 'finished') return null;

  const winner = rankedTeams[0];
  const winnerMeta = winner ? (TEAM_METAS[winner.number] || TEAM_METAS[1]) : null;

  const handleReset = () => {
    resetMatch();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] eqx-card-elevated flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div className="p-6 bg-[#141416] border-b border-white/10 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-[#FFBD59]/15 text-[#FFBD59] border border-[#FFBD59]/30 mx-auto flex items-center justify-center mb-2 shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#FFBD59] bg-[#FFBD59]/10 px-3 py-1 rounded-full border border-[#FFBD59]/30 inline-block">
            MATCH CONCLUDED · FINAL VALUATIONS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2">
            STARTUPOLY TOURNAMENT CHAMPION
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Tie-breaker priority: Company Value (CV) → Cash Balance → Ventures Owned
          </p>
        </div>

        {/* Body Leaderboard */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Winner Hero Card */}
          {winner && (
            <div className="p-6 rounded-3xl bg-[#141416] border border-[#FFBD59]/40 shadow-xl text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFBD59]">👑 FIRST PLACE VICTORY 👑</span>
              <div className="flex items-center justify-center gap-2.5">
                <div 
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: winnerMeta?.color }}
                />
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {winner.name}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-3 rounded-2xl bg-[#19191C] border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">VALUATION</span>
                  <span className="text-base font-bold text-[#7484FE] font-mono">{formatNumber(winner.cv)} CV</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#19191C] border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">CASH</span>
                  <span className="text-base font-bold text-[#33FF67] font-mono">{formatCurrency(winner.cash)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#19191C] border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">VENTURES</span>
                  <span className="text-base font-bold text-white font-mono">{winner.businesses.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Standings List */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-white/40 px-1">
              OFFICIAL FINAL STANDINGS
            </h4>
            {rankedTeams.map((team, idx) => {
              const meta = TEAM_METAS[team.number] || TEAM_METAS[1];
              return (
                <div
                  key={team.id}
                  className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm w-6 text-center ${
                      idx === 0 ? 'text-[#FFBD59]' : idx === 1 ? 'text-white' : idx === 2 ? 'text-[#7484FE]' : 'text-white/40'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div>
                      <strong className="text-sm font-bold text-white block">
                        {team.name}
                      </strong>
                      <span className="text-[11px] text-white/40">
                        {team.isBankrupt ? 'Bankrupt' : `${team.businesses.length} ventures`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-[#7484FE] block">
                      {formatNumber(team.cv)} CV
                    </span>
                    <span className="text-xs text-[#33FF67]">
                      {formatCurrency(team.cash)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer & Reset Controls */}
        <div className="p-4 border-t border-white/10 bg-[#141416] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-eqx-secondary px-5 py-2.5 text-xs font-semibold"
          >
            REVIEW MATCH BOARD
          </button>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="btn-eqx-danger px-5 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESET FOR NEXT MATCH</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#FF5C7A] font-semibold">Confirm Reset?</span>
              <button
                onClick={handleReset}
                className="btn-eqx-danger px-4 py-2 text-xs font-semibold"
              >
                CONFIRM RESET
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="btn-eqx-secondary px-3 py-2 text-xs"
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
