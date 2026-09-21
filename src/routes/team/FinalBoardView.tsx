import React from 'react';
import { TeamStateResponse } from '../../data/rpc';
import { LeaderboardView, LeaderboardEntry } from '../../ui/Leaderboard';

export interface FinalBoardViewProps {
  state: TeamStateResponse;
}

export const FinalBoardView: React.FC<FinalBoardViewProps> = ({ state }) => {
  const { team, leaderboard } = state;

  const entries: LeaderboardEntry[] = (leaderboard || []).map((entry) => ({
    rank: entry.rank,
    name: entry.name,
    color: entry.color,
    cv: entry.cv,
    cash: entry.cash,
    business_count: entry.business_count,
    is_bankrupt: entry.is_bankrupt,
  }));

  return (
    <div className="flex flex-col gap-4 pb-6">
      <LeaderboardView
        standings={entries}
        highlightTeamName={team.name}
        allowPresentationMode={false}
      />
    </div>
  );
};
