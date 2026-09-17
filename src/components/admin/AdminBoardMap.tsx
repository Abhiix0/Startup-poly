import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOARD_SPACES } from '../../constants/board';
import { formatCurrency, MARIO_CHARACTERS } from '../../constants/theme';
import { X } from 'lucide-react';

export const AdminBoardMap: React.FC = () => {
  const { state } = useGame();
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const activeTeams = state.teams.slice(0, state.settings.teamCount);

  const getSpaceEmoji = (type: string) => {
    switch (type) {
      case 'start': return '🏁';
      case 'bonus': return '🍄';
      case 'crisis': return '💣';
      case 'action_b': return '🎤';
      case 'action_c': return '🐢';
      case 'action_d': return '👻';
      case 'wildcard': return '❓';
      default: return '🏭';
    }
  };

  const activeSpaceDetail = selectedSpace !== null ? BOARD_SPACES[selectedSpace] : null;

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-pixel text-sm text-[#FBD000]">
            SUPER MARIO WORLD 24-SPACE TRACK
          </h2>
          <p className="font-arcade text-xs text-[#A89F91]">
            Physical token positions in actual World 1-1 sequence.
          </p>
        </div>
      </div>

      {/* 24-space grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {BOARD_SPACES.map((space) => {
          const teamsOnSpace = activeTeams.filter(t => t.position === space.index && !t.isBankrupt);
          const business = space.businessId !== undefined ? state.businesses[space.businessId] : null;
          const ownerTeam = business && business.owner !== null ? state.teams[business.owner] : null;
          const ownerChar = ownerTeam ? (MARIO_CHARACTERS[ownerTeam.number] || MARIO_CHARACTERS[1]) : null;

          return (
            <div
              key={space.index}
              onClick={() => setSelectedSpace(space.index)}
              className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between min-h-[105px] shadow-[3px_3px_0px_#000] ${
                teamsOnSpace.length > 0
                  ? 'bg-[#262022] border-[#FBD000] shadow-[0_0_8px_#FBD000]'
                  : 'bg-[#1B1718] border-[#3D3234] hover:border-[#FDF6E2]'
              }`}
            >
              {/* Space Number & Emoji */}
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[8px] text-[#A89F91]">
                  #{space.index + 1}
                </span>
                <span className="text-base">{getSpaceEmoji(space.type)}</span>
              </div>

              {/* Space Name & Ownership */}
              <div className="my-1">
                <h4 className="font-pixel text-[9px] text-[#FDF6E2] truncate">
                  {space.name}
                </h4>
                {business && (
                  <span className="font-arcade text-[10px] text-[#A89F91] block">
                    {ownerTeam && ownerChar ? (
                      <span className="text-[#5C94FC] font-bold">
                        {ownerChar.characterName} (★{business.level + 1})
                      </span>
                    ) : (
                      <span className="text-[#FBD000]">{formatCurrency(business.cost)}</span>
                    )}
                  </span>
                )}
              </div>

              {/* Team Character Icons on Space */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-[#3D3234] min-h-[22px]">
                {teamsOnSpace.map(t => {
                  const char = MARIO_CHARACTERS[t.number] || MARIO_CHARACTERS[1];
                  return (
                    <span
                      key={t.id}
                      title={`${t.name} (${char.characterName})`}
                      className="text-sm"
                    >
                      {char.icon}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Space Detail Modal */}
      {activeSpaceDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B1718] border-3 border-[#FDF6E2] rounded-3xl p-6 space-y-4 shadow-[8px_8px_0px_#000] animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#3D3234]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#262022] text-[#5C94FC] font-pixel text-xs flex items-center justify-center border border-[#5C94FC]">
                  #{activeSpaceDetail.index + 1}
                </span>
                <div>
                  <h3 className="font-pixel text-sm text-[#FDF6E2]">
                    {activeSpaceDetail.name}
                  </h3>
                  <span className="font-arcade text-xs text-[#A89F91] uppercase">
                    Space Type: {activeSpaceDetail.type}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSpace(null)}
                className="p-1 rounded-lg bg-[#262022] text-[#A89F91] hover:text-[#FDF6E2] border border-[#3D3234] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-arcade text-xs text-[#FDF6E2] leading-relaxed">
              {activeSpaceDetail.description}
            </p>

            <button
              onClick={() => setSelectedSpace(null)}
              className="w-full py-3 rounded-xl mario-btn-gold font-pixel text-xs cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
