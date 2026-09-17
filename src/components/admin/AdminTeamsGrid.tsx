import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, TEAM_METAS } from '../../constants/theme';

interface AdminTeamsGridProps {
  onSelectTeam: (teamIndex: number) => void;
}

export const AdminTeamsGrid: React.FC<AdminTeamsGridProps> = ({ onSelectTeam }) => {
  const { state } = useGame();
  const activeTeams = state.teams.slice(0, state.settings.teamCount);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
          ALL TEAMS OVERVIEW (CLICK TO OVERRIDE / TWEAK)
        </span>
        <span className="text-xs font-mono text-[#7484FE]">
          {activeTeams.length} Active Teams
        </span>
      </div>

      {/* 3x2 Clean Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {activeTeams.map((team, idx) => {
          const isTurn = state.activeTeamIndex === idx;
          const meta = TEAM_METAS[team.number] || TEAM_METAS[1];

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(idx)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                team.isBankrupt
                  ? 'bg-[#141416] border-white/5 opacity-40'
                  : isTurn
                  ? 'bg-[#202024] border-[#7484FE] shadow-lg shadow-[#7484FE]/20 ring-1 ring-[#7484FE]'
                  : 'bg-[#19191C] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Team Name + Color Dot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <h4 className="font-bold text-xs text-white truncate">
                    {team.name}
                  </h4>
                </div>

                {isTurn && (
                  <span className="w-2 h-2 rounded-full bg-[#7484FE] animate-ping flex-shrink-0" />
                )}
              </div>

              {/* Numbers: Cash & CV */}
              <div className="my-2 space-y-0.5 font-mono">
                <div className="text-sm font-bold text-[#33FF67] leading-tight">
                  {formatCurrency(team.cash)}
                </div>
                <div className="text-xs font-semibold text-[#7484FE] leading-tight">
                  {formatNumber(team.cv)} CV
                </div>
              </div>

              {/* Bottom tag: Ventures count & Space */}
              <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[11px] text-white/50">
                <span>{team.businesses.length}/3 Ventures</span>
                <span className="font-mono">Sp. #{team.position + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
