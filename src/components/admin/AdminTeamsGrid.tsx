import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, MARIO_CHARACTERS } from '../../constants/theme';

interface AdminTeamsGridProps {
  onSelectTeam: (teamIndex: number) => void;
}

export const AdminTeamsGrid: React.FC<AdminTeamsGridProps> = ({ onSelectTeam }) => {
  const { state } = useGame();
  const activeTeams = state.teams.slice(0, state.settings.teamCount);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-[#A89F91]">
          ALL PLAYERS OVERVIEW (CLICK TO OVERRIDE / TWEAK)
        </span>
        <span className="font-arcade text-xs text-[#5C94FC]">
          {activeTeams.length} Active Players
        </span>
      </div>

      {/* 3x2 Clean Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {activeTeams.map((team, idx) => {
          const isTurn = state.activeTeamIndex === idx;
          const char = MARIO_CHARACTERS[team.number] || MARIO_CHARACTERS[1];

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(idx)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[115px] shadow-[3px_3px_0px_#000] ${
                team.isBankrupt
                  ? 'bg-[#101014] border-[#E52521]/30 opacity-40'
                  : isTurn
                  ? 'bg-[#262022] border-[#FBD000] shadow-[0_0_10px_#FBD000]'
                  : 'bg-[#1B1718] border-[#3D3234] hover:border-[#FDF6E2]'
              }`}
            >
              {/* Team Name + Mario Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base flex-shrink-0">{char.icon}</span>
                  <h4 className="font-pixel text-[9px] text-[#FDF6E2] truncate">
                    {char.characterName}
                  </h4>
                </div>

                {isTurn && (
                  <span className="w-2 h-2 rounded-full bg-[#FBD000] animate-ping flex-shrink-0" />
                )}
              </div>

              {/* Numbers: Coins & Stars */}
              <div className="my-1 space-y-0.5">
                <div className="font-pixel text-[10px] text-[#FBD000] leading-tight">
                  {formatCurrency(team.cash)}
                </div>
                <div className="font-pixel text-[9px] text-[#5C94FC] leading-tight">
                  {formatNumber(team.cv)} CV
                </div>
              </div>

              {/* Bottom tag: Pipes count & Space */}
              <div className="flex items-center justify-between pt-1 border-t border-[#3D3234] font-arcade text-[10px] text-[#A89F91]">
                <span>{team.businesses.length}/3 Pipes</span>
                <span>Sp. {team.position + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

