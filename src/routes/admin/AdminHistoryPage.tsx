import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rpcListHistory, HistoryRoomSummary } from '../../data/rpc';
import { PixelCard, EmptyState, ErrorBanner, Skeleton } from '../../ui';

export const AdminHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryRoomSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await rpcListHistory();
      setHistory(data || []);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to load match history.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="font-pixel text-xs text-[#FFCC00] hover:underline flex items-center gap-1">
            ◄ CONSOLE
          </Link>
          <span className="font-pixel text-xs text-white border-l-2 border-white/20 pl-3">
            MATCH ARCHIVE
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <PixelCard title="FINALIZED TOURNAMENT ROOMS" headerBg="navy" padding="lg">
          {isLoading && (
            <div className="flex flex-col gap-3 py-4">
              <Skeleton height={60} />
              <Skeleton height={60} />
              <Skeleton height={60} />
            </div>
          )}

          {error && (
            <div className="py-4">
              <ErrorBanner message={error.message} onRetry={loadHistory} />
            </div>
          )}

          {!isLoading && !error && history.length === 0 && (
            <EmptyState
              title="NO FINALIZED MATCHES YET"
              description="When matches reach TIME_EXPIRED and are finalized by an admin, immutable final standings will appear here."
              actionLabel="BACK TO CONSOLE"
              onAction={() => window.location.assign('/admin')}
            />
          )}

          {!isLoading && !error && history.length > 0 && (
            <div className="flex flex-col gap-3">
              {history.map((room) => {
                const dateStr = room.finalized_at
                  ? new Date(room.finalized_at).toLocaleString()
                  : new Date(room.created_at).toLocaleString();

                return (
                  <Link
                    key={room.room_id}
                    to={`/admin/history/${room.room_id}`}
                    className="
                      bg-white border-3 border-[#102040] p-3.5 sm:p-4
                      shadow-[3px_3px_0px_#102040] hover:shadow-[1px_1px_0px_#102040] hover:translate-x-0.5 hover:translate-y-0.5
                      transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FFCC00] border-2 border-[#102040] flex items-center justify-center font-pixel text-xs text-[#102040] shadow-[1px_1px_0px_#102040] flex-shrink-0">
                        🏆
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-sm text-[#102040]">
                            ROOM {room.code}
                          </span>
                          <span className="font-mono text-[11px] text-[#64748B] bg-[#FAF8F5] px-1.5 py-0.5 border border-[#CBD5E1]">
                            {room.team_count} Teams
                          </span>
                        </div>

                        <span className="font-mono text-xs text-[#64748B]">
                          Finalized: {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#CBD5E1]">
                      {room.winner_name ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-pixel text-[10px] text-[#92400E] uppercase">Winner:</span>
                          <span
                            className="w-3 h-3 border border-[#102040]"
                            style={{ backgroundColor: room.winner_color || '#22B14C' }}
                          />
                          <span className="font-sans font-bold text-xs text-[#102040]">
                            {room.winner_name}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-[#64748B] italic">No winner declared</span>
                      )}

                      <span className="font-pixel text-xs text-[#5C94FC] ml-2">
                        VIEW ►
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </PixelCard>
      </main>

      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
