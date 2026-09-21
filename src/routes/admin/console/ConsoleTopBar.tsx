import React from 'react';
import { Link } from 'react-router-dom';
import { Countdown, StatusPill, ConnectionPill, PixelButton } from '../../../ui';
import { ConnectionStatus } from '../../../ui/ConnectionPill';

export interface ConsoleTopBarProps {
  roomCode: string;
  status: string;
  endsAt: string | null;
  serverNow?: string | null;
  connection: ConnectionStatus;
  lastUpdated: string;
  onRefetch?: () => void;
  isRefetching?: boolean;
  onAbortGame?: () => void;
}

export const ConsoleTopBar: React.FC<ConsoleTopBarProps> = ({
  roomCode,
  status,
  endsAt,
  serverNow,
  connection,
  lastUpdated,
  onRefetch,
  isRefetching = false,
  onAbortGame,
}) => {
  return (
    <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-[0_4px_0px_#102040]">
      {/* Left section: Back navigation & Room status */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="font-pixel text-xs text-[#FFCC00] hover:underline flex items-center gap-1"
        >
          ◄ CONSOLE
        </Link>
        <div className="border-l-2 border-white/20 pl-3 flex items-center gap-2">
          <span className="font-pixel text-xs text-white">ROOM {roomCode}</span>
          <StatusPill status={status} size="sm" />
        </div>
        {onAbortGame && (
          <div className="border-l-2 border-white/20 pl-3">
            <button
              onClick={onAbortGame}
              className="font-pixel text-[10px] bg-[#D32F2F] text-white px-3 py-1.5 border-2 border-white/30 hover:bg-[#B71C1C] active:translate-y-0.5 transition-colors cursor-pointer uppercase tracking-wider"
              title="Abort game and return to lobby"
            >
              ✕ ABORT GAME
            </button>
          </div>
        )}
      </div>

      {/* Center section: Authoritative Server-Clock Countdown */}
      <div className="flex items-center justify-center">
        <Countdown
          endsAt={endsAt}
          status={status}
          serverNow={serverNow}
          size="lg"
          showLabel={false}
          className="scale-90 sm:scale-100"
        />
      </div>

      {/* Right section: Connection & sync status */}
      <div className="flex items-center gap-3">
        <span className="hidden lg:inline font-mono text-[11px] text-[#94A3B8]">
          Updated: {lastUpdated}
        </span>
        <ConnectionPill status={connection} lastUpdated={lastUpdated} />
        {onRefetch && (
          <button
            onClick={onRefetch}
            disabled={isRefetching}
            title="Refresh snapshot now"
            className="w-8 h-8 flex items-center justify-center bg-[#FAF8F5] text-[#102040] border-2 border-[#102040] font-pixel text-xs hover:bg-[#FFCC00] transition-colors cursor-pointer disabled:opacity-50 active:translate-y-0.5"
          >
            {isRefetching ? '…' : '↻'}
          </button>
        )}
      </div>
    </header>
  );
};

