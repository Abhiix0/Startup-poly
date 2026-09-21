import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminRoom } from '../../data/useAdminRoom';
import { PixelCard, PixelButton, StatusPill, ConnectionPill, ErrorBanner, Skeleton, PixelBrickTile } from '../../ui';
import { SetupView } from './SetupView';
import { LobbyView } from './LobbyView';
import { ActiveSummaryView } from './ActiveSummaryView';
import { AdminConsoleView } from './console';

export const AdminRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { snapshot, status, error, refetch, connection, lastUpdated, isStale, staleAgeSeconds } = useAdminRoom(roomId);

  if (
    status === 'ready' &&
    snapshot &&
    (snapshot.room.status === 'ACTIVE' ||
      snapshot.room.status === 'TIME_EXPIRED' ||
      snapshot.room.status === 'FINALIZED')
  ) {
    return (
      <AdminConsoleView
        snapshot={snapshot}
        onRefetch={refetch}
        connection={connection}
        lastUpdated={lastUpdated}
        isStale={isStale}
        staleAgeSeconds={staleAgeSeconds}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="font-pixel text-xs text-[#FFCC00] hover:underline flex items-center gap-1"
          >
            ◄ CONSOLE
          </Link>
          <span className="font-pixel text-xs text-white border-l-2 border-white/20 pl-3">
            ROOM {snapshot?.room.code || roomId?.slice(0, 6).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-mono text-[11px] text-[#94A3B8]">
            Updated: {lastUpdated}
          </span>
          <ConnectionPill status={connection} />
          {snapshot && <StatusPill status={snapshot.room.status} size="sm" />}
        </div>
      </header>

      {/* Responsive width notice for small devices (< 1024px) */}
      <div className="lg:hidden bg-[#FFCC00] text-[#102040] px-4 py-2 text-center border-b-4 border-[#102040] shadow-[0_2px_0px_#102040]">
        <p className="font-pixel text-[11px] leading-relaxed">
          💻 Use a laptop for the admin console. Full operations grid is optimized for screens ≥ 1024px.
        </p>
      </div>

      {/* Main Room Lifecycle Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {status === 'loading' && (
          <div className="flex flex-col gap-4">
            <PixelCard title="LOADING TOURNAMENT ROOM..." headerBg="navy">
              <div className="flex flex-col gap-4 py-6">
                <Skeleton height={60} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton height={140} />
                  <Skeleton height={140} />
                  <Skeleton height={140} />
                </div>
              </div>
            </PixelCard>
          </div>
        )}

        {status === 'error' && (
          <div className="my-auto">
            <ErrorBanner
              message={error?.message || 'Failed to connect to tournament room.'}
              onRetry={() => refetch()}
            />
          </div>
        )}

        {status === 'ready' && snapshot && (
          <>
            {snapshot.room.status === 'CREATED' && (
              <SetupView snapshot={snapshot} onRefetch={refetch} />
            )}

            {snapshot.room.status === 'LOBBY' && (
              <LobbyView snapshot={snapshot} onRefetch={refetch} />
            )}

            {(snapshot.room.status === 'ACTIVE' ||
              snapshot.room.status === 'TIME_EXPIRED' ||
              snapshot.room.status === 'FINALIZED') && (
              <ActiveSummaryView snapshot={snapshot} />
            )}
          </>
        )}
      </main>

      {/* Brick Ground Base */}
      <PixelBrickTile hasGrass={true} className="h-8" />
    </div>
  );
};
