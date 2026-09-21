import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMyTeam } from '../../data/useMyTeam';
import { ConnectionPill, StatusPill, Skeleton, PixelCard } from '../../ui';
import { LobbyWaitView } from './LobbyWaitView';
import { ActiveDashboardView } from './ActiveDashboardView';
import { GameOverView } from './GameOverView';
import { FinalBoardView } from './FinalBoardView';

export const TeamDashboardPage: React.FC = () => {
  const {
    state,
    status,
    refetch,
    connection,
    lastUpdatedAt,
    isStale,
    staleAgeSeconds,
    cashFlash,
    cvFlash,
    wasClaimReleased,
    isSessionLost,
  } = useMyTeam();

  // If anonymous session was lost, redirect to /join with notice
  if (isSessionLost) {
    return (
      <Navigate
        to="/join"
        state={{ notice: 'Session expired. Please rejoin with your room code and PIN.' }}
        replace
      />
    );
  }

  // If claim was released by admin, redirect to /join with notice
  if (wasClaimReleased) {
    return (
      <Navigate
        to="/join"
        state={{ notice: 'Ask the organiser to rejoin you' }}
        replace
      />
    );
  }

  // If initial load in progress, show skeleton (never flash join screen)
  if (status === 'loading' && !state) {
    return (
      <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between p-4">
        <header className="bg-[#102040] p-3 border-4 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-between">
          <Skeleton height={20} width={120} />
          <Skeleton height={20} width={60} />
        </header>

        <main className="max-w-md w-full mx-auto my-auto flex flex-col gap-4">
          <PixelCard title="SYNCING TEAM DATA..." headerBg="navy">
            <div className="flex flex-col gap-3 py-4">
              <Skeleton height={60} />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton height={80} />
                <Skeleton height={80} />
              </div>
              <Skeleton height={120} />
            </div>
          </PixelCard>
        </main>

        <div className="h-6 nes-brick-pattern border-t-4 border-[#102040]" />
      </div>
    );
  }

  // If ready and no team claim exists on this session, redirect to /join
  if (!state && status === 'ready') {
    return <Navigate to="/join" replace />;
  }

  if (!state) {
    return <Navigate to="/join" replace />;
  }

  const { team, room } = state;

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between selection:bg-[#FFCC00] selection:text-[#102040]">
      {/* Mobile Top Navigation */}
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] p-3 shadow-[0_3px_0px_#102040] flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 truncate">
          <span
            className="w-4 h-4 border-2 border-white shadow-[1px_1px_0px_#102040] flex-shrink-0"
            style={{ backgroundColor: team.color }}
          />
          <div className="truncate">
            <span className="font-pixel text-xs text-[#FFCC00] block truncate">
              {team.name}
            </span>
            <span className="font-mono text-[10px] text-[#94A3B8]">
              SLOT #{team.slot}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ConnectionPill status={connection} lastUpdated={lastUpdatedAt} showLabel={false} />
          <StatusPill status={room.status} size="sm" />
        </div>
      </header>

      {/* Offline / Reconnecting Banner (> 20s stale) */}
      {isStale && (
        <div className="bg-[#FEF9C3] text-[#854D0E] border-b-3 border-[#102040] px-3 py-1.5 text-center font-mono text-xs font-bold animate-pulse">
          ⚠ Reconnecting… last update {staleAgeSeconds}s ago (values preserved)
        </div>
      )}

      {/* Main Single-Column Content (Mobile First 360-430px) */}
      <main className="flex-1 w-full max-w-md mx-auto p-3 sm:p-4 flex flex-col gap-4">
        {room.status === 'LOBBY' && <LobbyWaitView state={state} />}

        {room.status === 'ACTIVE' && (
          <ActiveDashboardView
            state={state}
            onExpire={() => refetch()}
            cashFlash={cashFlash}
            cvFlash={cvFlash}
          />
        )}

        {room.status === 'TIME_EXPIRED' && <GameOverView state={state} />}

        {room.status === 'FINALIZED' && <FinalBoardView state={state} />}
      </main>

      {/* Brick Ground Base Strip */}
      <div className="h-6 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
