import React, { useEffect } from 'react';
import { TeamCard } from './TeamCard';
import { AdminRoomSnapshot } from '../../../data/rpc';

export interface TeamGridProps {
  teams: AdminRoomSnapshot['teams'];
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  flashes?: Record<string, 'up' | 'down' | null>;
}

export const TeamGrid: React.FC<TeamGridProps> = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  flashes = {},
}) => {
  // Global keyboard shortcuts: 1-6 and arrow keys to navigate teams
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      // Do not intercept if user is typing in an input/textarea
      if (isInput) return;

      // 1-6 keys for selecting slots
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= teams.length) {
        const targetTeam = teams.find((t) => t.slot === keyNum);
        if (targetTeam) {
          e.preventDefault();
          onSelectTeam(targetTeam.id);
          return;
        }
      }

      // Arrow keys navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = teams.findIndex((t) => t.id === selectedTeamId);
        const nextIndex = (currentIndex + 1) % teams.length;
        onSelectTeam(teams[nextIndex].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = teams.findIndex((t) => t.id === selectedTeamId);
        const prevIndex = (currentIndex - 1 + teams.length) % teams.length;
        onSelectTeam(teams[prevIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, selectedTeamId, onSelectTeam]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="bg-brand-navy text-white px-3.5 py-2 border-3 sm:border-4 border-brand-navy shadow-pixel-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛡️</span>
          <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wider text-brand-gold font-bold">
            TEAM LEDGER ({teams.length})
          </h2>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="hidden sm:inline font-mono text-[10px] text-neutral-300 mr-1">
            Quick select:
          </span>
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTeam(t.id)}
              className={`
                font-pixel text-[10px] px-2 py-0.5 border cursor-pointer transition-all
                ${selectedTeamId === t.id
                  ? 'bg-brand-gold text-brand-navy border-white font-bold scale-105'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-600 hover:text-white hover:bg-neutral-700'
                }
              `}
              title={`Select Team #${t.slot}: ${t.name}`}
            >
              #{t.slot}
            </button>
          ))}
        </div>
      </div>

      <div className="border-4 border-brand-navy shadow-pixel bg-brand-white flex flex-col divide-y-2 divide-brand-navy/15 overflow-hidden">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            isSelected={selectedTeamId === team.id}
            onClick={() => onSelectTeam(team.id)}
            flash={flashes[team.id]}
          />
        ))}
      </div>
    </div>
  );
};
