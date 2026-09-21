import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rpcGetHistoryDetail, HistoryDetailResponse } from '../../data/rpc';
import { LeaderboardView, formatStandingsAsText, exportStandingsToCsv, LeaderboardEntry } from '../../ui/Leaderboard';
import { ActivityLog } from './console/ActivityLog';
import { PixelCard, ErrorBanner, Skeleton, useToast } from '../../ui';

export const AdminRoomHistoryPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [data, setData] = useState<HistoryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const { successToast } = useToast();

  const loadDetail = async () => {
    if (!roomId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await rpcGetHistoryDetail(roomId);
      setData(res);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to load match record.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [roomId]);

  const leaderboardEntries: LeaderboardEntry[] = (data?.results || []).map((r) => ({
    rank: r.rank,
    name: r.name,
    color: r.color,
    cv: r.cv,
    cash: r.cash,
    business_count: r.business_count,
    is_bankrupt: r.is_bankrupt,
  }));

  const handleCopyText = async () => {
    if (!data) return;
    const text = formatStandingsAsText(
      data.room.code,
      leaderboardEntries,
      data.room.finalized_at
    );
    await navigator.clipboard.writeText(text);
    setCopied(true);
    successToast('Results copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!data) return;
    exportStandingsToCsv(data.room.code, leaderboardEntries);
    successToast('CSV export downloaded!');
  };

  const teamsForLog = (data?.results || []).map((r) => ({
    id: r.team_id,
    slot: r.rank,
    name: r.name,
    color: r.color,
    cash: r.cash,
    cv: r.cv,
    is_bankrupt: r.is_bankrupt,
    version: 1,
    tiebreak_order: null,
    claimed: true,
    businesses: [],
  }));

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <Link to="/admin/history" className="font-pixel text-xs text-[#FFCC00] hover:underline flex items-center gap-1">
            ◄ ARCHIVE
          </Link>
          <span className="font-pixel text-xs text-white border-l-2 border-white/20 pl-3">
            ROOM {data?.room.code || roomId?.slice(0, 6).toUpperCase()} • IMMUTABLE RECORD
          </span>
        </div>

        {data && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="font-pixel text-[10px] uppercase px-2.5 py-1 bg-white text-[#102040] border border-[#102040] hover:bg-[#FAF8F5] cursor-pointer shadow-[1px_1px_0px_#102040]"
            >
              {copied ? '✓ COPIED!' : '📋 COPY TEXT'}
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="font-pixel text-[10px] uppercase px-2.5 py-1 bg-[#22B14C] text-white border border-[#102040] hover:bg-[#1fa145] cursor-pointer shadow-[1px_1px_0px_#102040]"
            >
              📥 CSV
            </button>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col gap-6">
        {isLoading && (
          <PixelCard title="LOADING TOURNAMENT ARCHIVE..." headerBg="navy">
            <div className="flex flex-col gap-4 py-6">
              <Skeleton height={60} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton height={140} />
                <Skeleton height={140} />
                <Skeleton height={140} />
              </div>
            </div>
          </PixelCard>
        )}

        {error && (
          <div className="my-auto max-w-xl mx-auto w-full">
            <ErrorBanner message={error.message} onRetry={loadDetail} />
          </div>
        )}

        {!isLoading && !error && data && (
          <div className="flex flex-col xl:flex-row gap-5">
            {/* Left & Center: Final Leaderboard & Podium */}
            <div className="flex-1 min-w-0">
              <LeaderboardView
                standings={leaderboardEntries}
                roomCode={data.room.code}
                finalizedAt={data.room.finalized_at}
                allowPresentationMode={true}
              />
            </div>

            {/* Right Column: Complete Match Audit Log */}
            <div className="w-full xl:w-[380px] 2xl:w-[440px] flex-shrink-0">
              <ActivityLog events={data.events} teams={teamsForLog} />
            </div>
          </div>
        )}
      </main>

      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
