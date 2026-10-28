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
    color: teamColorMap.get(s.team_id) || 'var(--color-neutral-500)',
    cash: s.cash,
    business_count: s.business_count,
    is_bankrupt: s.is_bankrupt,
  }));

  const maxCash = Math.max(0, ...leaderboardEntries.map((e) => e.cash));

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
    <div className="flex flex-col min-h-screen bg-brand-sky text-brand-navy">
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

      {/* 2. MATCH HEADER */}
      <section
        aria-labelledby="match-results-heading"
        className="bg-brand-gold text-brand-navy px-4 py-4 sm:px-6 border-b-4 border-brand-navy shadow-pixel-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <span className="font-pixel text-[10px] sm:text-xs uppercase tracking-widest block">
            ★ MATCH FINALIZED · ROOM {snapshot.room.code}
          </span>
          <h1 id="match-results-heading" className="font-pixel text-2xl sm:text-3xl font-extrabold uppercase">
            Match Results
          </h1>
          <p className="font-mono text-xs sm:text-sm mt-1">
            Results are permanent and immutable.
            {snapshot.room.finalized_at &&
              ` Finalized ${new Date(snapshot.room.finalized_at).toLocaleString()}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="font-pixel text-[10px] sm:text-xs uppercase px-3 py-2 bg-brand-white text-brand-navy border-2 border-brand-navy hover:bg-brand-cream cursor-pointer shadow-pixel-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {copied ? '✓ COPIED!' : '📋 COPY RESULTS'}
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="font-pixel text-[10px] sm:text-xs uppercase px-3 py-2 bg-brand-white text-brand-navy border-2 border-brand-navy hover:bg-brand-cream cursor-pointer shadow-pixel-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            📥 CSV EXPORT
          </button>
          <Link to={`/admin/history/${snapshot.room.id}`}>
            <PixelButton variant="secondary" size="sm">
              MATCH HISTORY
            </PixelButton>
          </Link>
          <Link to="/admin">
            <PixelButton variant="primary" size="sm">
              + START NEW MATCH
            </PixelButton>
          </Link>
        </div>
      </section>

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

          {/* Team performance: bars scale to the best team's cash balance. */}
          {leaderboardEntries.length > 0 && (
            <section aria-labelledby="team-performance-heading" className="w-full max-w-5xl mx-auto bg-brand-white border-4 border-brand-navy shadow-pixel p-4">
              <h2 id="team-performance-heading" className="font-pixel text-xs sm:text-sm uppercase tracking-wider mb-3">
                Team Performance
              </h2>
              <ul className="flex flex-col gap-4">
                {leaderboardEntries.map((e) => (
                  <li key={e.rank}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3.5 h-3.5 border-2 border-brand-navy" style={{ backgroundColor: e.color }} />
                      <span className="font-pixel text-xs font-bold truncate">#{e.rank} {e.name}</span>
                      <span className="font-mono text-[11px] ml-auto">{e.business_count}/3 businesses</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="w-24 shrink-0">Cash</span>
                      <div className="flex-1 h-2.5 bg-neutral-200 border border-brand-navy">
                        <div
                          className="h-full bg-brand-green"
                          style={{ width: `${maxCash > 0 ? Math.max(0, (e.cash / maxCash) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="w-28 text-right font-bold">₹{e.cash.toLocaleString('en-IN')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column: Read-only Live Activity Log */}
        <div className="w-full xl:w-[380px] 2xl:w-[440px] flex-shrink-0">
          <ActivityLog events={snapshot.events} teams={snapshot.teams} />
        </div>
      </main>

      {/* 4. NES Ground Pattern */}
      <div className="h-8 nes-brick-pattern border-t-4 border-brand-navy" />
    </div>
  );
};
