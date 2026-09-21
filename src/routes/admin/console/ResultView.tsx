import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { useStandings } from '../../../data/useStandings';
import { LeaderboardView, formatStandingsAsText, exportStandingsToCsv, LeaderboardEntry } from '../../../ui/Leaderboard';
import { ActivityLog } from './ActivityLog';
import { ConsoleTopBar } from './ConsoleTopBar';
import { ConnectionStatus } from '../../../ui/ConnectionPill';
import { PixelButton, useToast } from '../../../ui';

export interface ResultViewProps {
  snapshot: AdminRoomSnapshot;
  connection: ConnectionStatus;
  lastUpdated: string;
  onRefetch: () => Promise<void>;
}

export const ResultView: React.FC<ResultViewProps> = ({
  snapshot,
  connection,
  lastUpdated,
  onRefetch,
}) => {
  const { standings, isLoading } = useStandings(snapshot.room.id, true);
  const [copied, setCopied] = useState<boolean>(false);
  const { successToast } = useToast();

  const teamColorMap = new Map(snapshot.teams.map((t) => [t.id, t.color]));

  const leaderboardEntries: LeaderboardEntry[] = standings.map((s) => ({
    rank: s.rank,
    name: s.name,
    color: teamColorMap.get(s.team_id) || '#64748B',
    cv: s.cv,
    cash: s.cash,
    business_count: s.business_count,
    is_bankrupt: s.is_bankrupt,
    tiebreak_order: s.tiebreak_order,
  }));

  const handleCopyText = async () => {
    const text = formatStandingsAsText(
      snapshot.room.code,
      leaderboardEntries,
      snapshot.room.finalized_at
    );
    await navigator.clipboard.writeText(text);
    setCopied(true);
    successToast('Results copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    exportStandingsToCsv(snapshot.room.code, leaderboardEntries);
    successToast('CSV export downloaded!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#5C94FC] text-[#102040]">
      {/* 1. TOP BAR */}
      <ConsoleTopBar
        roomCode={snapshot.room.code}
        status="FINALIZED"
        endsAt={snapshot.room.ends_at}
        serverNow={snapshot.server_now}
        connection={connection}
        lastUpdated={lastUpdated}
        onRefetch={onRefetch}
        isRefetching={isLoading}
      />

      {/* 2. MATCH FINALIZED STATUS BANNER */}
      <div className="bg-[#FFCC00] text-[#102040] px-4 py-2 text-center font-pixel text-xs border-b-4 border-[#102040] shadow-[0_2px_0px_#102040] flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>★ MATCH FINALIZED — Results are permanent and immutable.</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="font-pixel text-[10px] uppercase px-2.5 py-1 bg-white text-[#102040] border border-[#102040] hover:bg-[#FAF8F5] cursor-pointer shadow-[1px_1px_0px_#102040]"
          >
            {copied ? '✓ COPIED!' : '📋 COPY RESULTS'}
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="font-pixel text-[10px] uppercase px-2.5 py-1 bg-white text-[#102040] border border-[#102040] hover:bg-[#FAF8F5] cursor-pointer shadow-[1px_1px_0px_#102040]"
          >
            📥 CSV EXPORT
          </button>
          <Link to="/admin">
            <PixelButton variant="primary" size="sm">
              + START NEW MATCH
            </PixelButton>
          </Link>
        </div>
      </div>

      {/* 3. MAIN FINALIZED BODY */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col xl:flex-row gap-5">
        {/* Left & Center: Official Leaderboard & Podium */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          <LeaderboardView
            standings={leaderboardEntries}
            roomCode={snapshot.room.code}
            finalizedAt={snapshot.room.finalized_at}
            allowPresentationMode={true}
          />
        </div>

        {/* Right Column: Read-only Live Activity Log */}
        <div className="w-full xl:w-[380px] 2xl:w-[440px] flex-shrink-0">
          <ActivityLog events={snapshot.events} teams={snapshot.teams} />
        </div>
      </main>

      {/* 4. NES Ground Pattern */}
      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
