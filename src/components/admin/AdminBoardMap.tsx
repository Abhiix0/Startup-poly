import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOARD_SPACES } from '../../constants/board';
import { formatCurrency, TEAM_METAS } from '../../constants/theme';
import { StartupolyBoard } from '../common/StartupolyBoard';
import { X, MapPin } from 'lucide-react';

export const AdminBoardMap: React.FC = () => {
  const { state } = useGame();
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const activeSpaceDetail = selectedSpace !== null ? BOARD_SPACES[selectedSpace] : null;

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            PHYSICAL 24-SPACE OUTDOOR TRACK MAP
          </h2>
          <p className="text-xs text-white/50">
            Realtime pawn positions and enterprise ownership status across the board.
          </p>
        </div>
      </div>

      {/* Unified Interactive StartupolyBoard Component */}
      <div className="eqx-card-elevated p-4">
        <StartupolyBoard 
          mode="admin"
          onSpaceClick={(spaceIdx) => setSelectedSpace(spaceIdx)}
        />
      </div>

      {/* Space Detail Modal */}
      {activeSpaceDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md eqx-card-elevated rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#7484FE]/15 text-[#7484FE] font-mono text-xs flex items-center justify-center border border-[#7484FE]/30 font-bold">
                  #{activeSpaceDetail.index + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeSpaceDetail.name}
                  </h3>
                  <span className="text-[11px] text-white/50 uppercase font-mono">
                    Space Type: {activeSpaceDetail.type}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSpace(null)}
                className="p-1.5 rounded-lg bg-[#19191C] text-white/50 hover:text-white border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              {activeSpaceDetail.description}
            </p>

            <button
              onClick={() => setSelectedSpace(null)}
              className="w-full btn-eqx-primary py-3 rounded-xl text-xs font-semibold cursor-pointer"
            >
              CLOSE SPACE DETAILS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
