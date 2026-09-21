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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-xs uppercase tracking-wider text-[#102040]">
          TOURNAMENT TEAMS ({teams.length})
        </h2>
        <span className="hidden sm:inline font-mono text-[10px] text-[#64748B]">
          Press 1–{teams.length} or Arrow keys to select
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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
