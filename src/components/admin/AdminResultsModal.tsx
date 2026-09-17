import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCoins, formatStars, formatNumber } from '../../constants/theme';
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

  const handleReset = () => {
    resetMatch();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] nes-box bg-[#181820] border-4 border-black flex flex-col shadow-[6px_6px_0px_#000] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div className="p-6 bg-[#22222E] border-b-4 border-black text-center relative">
          <div className="w-14 h-14 nes-box bg-[#FBD000] text-black border-2 border-black mx-auto flex items-center justify-center mb-2 shadow-[2px_2px_0px_#000] animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <span className="text-[9px] font-pixel uppercase tracking-wider text-[#FBD000] bg-[#101014] px-3 py-1 nes-box border border-black inline-block">
            🏁 STAGE CLEAR · MATCH COMPLETE
          </span>
          <h2 className="text-xl sm:text-2xl font-pixel text-white tracking-tight mt-2">
            MUSHROOM KINGDOM CHAMPION
          </h2>
          <p className="text-xs font-arcade text-gray-300 mt-1">
            Ranked by Star Value → Coins → Warp Pipes Owned
          </p>
        </div>

        {/* Body Leaderboard */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Winner Hero Card */}
          {winner && (
            <div className="p-5 nes-box bg-[#101014] border-4 border-[#FBD000] shadow-[4px_4px_0px_#000] text-center space-y-3">
              <span className="text-3xl block">👑 ⭐ 🍄</span>
              <div className="flex items-center justify-center gap-2">
                <span 
                  className="w-4 h-4 nes-box border border-black"
                  style={{ backgroundColor: winner.color }}
                />
                <h3 className="text-xl font-pixel text-[#FBD000]">
                  {winner.name}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-2.5 nes-box bg-[#181820] border-2 border-black">
                  <span className="text-[8px] font-pixel text-gray-400 block">⭐ STAR VAL</span>
                  <span className="text-sm font-pixel text-[#5C94FC]">{formatStars(winner.cv)}</span>
                </div>
                <div className="p-2.5 nes-box bg-[#181820] border-2 border-black">
                  <span className="text-[8px] font-pixel text-gray-400 block">🪙 COINS</span>
                  <span className="text-sm font-pixel text-[#FBD000]">{formatCoins(winner.cash)}</span>
                </div>
                <div className="p-2.5 nes-box bg-[#181820] border-2 border-black">
                  <span className="text-[8px] font-pixel text-gray-400 block">🏭 PIPES</span>
                  <span className="text-sm font-pixel text-white">{winner.businesses.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Standings List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-pixel uppercase tracking-wider text-[#FBD000] px-1">
              FINAL STANDINGS
            </h4>
            {rankedTeams.map((team, idx) => (
              <div
                key={team.id}
                className="p-3 nes-box bg-[#101014] border-2 border-black flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-pixel text-xs w-6 text-center ${
                    idx === 0 ? 'text-[#FBD000]' : idx === 1 ? 'text-white' : idx === 2 ? 'text-[#5C94FC]' : 'text-gray-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span 
                    className="w-3.5 h-3.5 nes-box border border-black flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <div>
                    <strong className="text-sm font-arcade font-bold text-white block">
                      {team.name}
                    </strong>
                    <span className="text-[10px] font-arcade text-gray-400">
                      {team.isBankrupt ? '💀 GAME OVER (BANKRUPT)' : `🏭 ${team.businesses.length} pipes`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-pixel text-[#5C94FC] block">
                    ⭐ {team.cv}
                  </span>
                  <span className="text-[10px] font-pixel text-[#FBD000]">
                    🪙 {team.cash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer & Reset Controls */}
        <div className="p-4 border-t-4 border-black bg-[#22222E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 mario-btn-dark text-white font-pixel text-[9px]"
          >
            REVIEW BOARD
          </button>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-5 py-2.5 mario-btn-red text-white font-pixel text-[9px] flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RESET FOR NEXT MATCH
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-arcade text-[#E52521] font-bold">Archive & Reset?</span>
              <button
                onClick={handleReset}
                className="px-4 py-2 mario-btn-red text-white font-pixel text-[9px]"
              >
                CONFIRM RESET
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 mario-btn-dark text-gray-300 font-pixel text-[9px]"
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
