import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PixelCard, PixelButton, Countdown, StatusPill } from '../../ui';

export const AdminRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="font-pixel text-xs text-[#FFCC00] hover:underline">
            ◄ CONSOLE
          </Link>
          <span className="font-pixel text-xs text-white">ROOM {roomId?.slice(0, 8)}</span>
        </div>
        <StatusPill status="LOBBY" />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <PixelCard title={`ADMIN ROOM CONTROL: ${roomId}`} headerBg="navy" padding="lg">
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <Countdown endsAt={null} status="LOBBY" size="lg" />
            <p className="font-mono text-xs text-[#64748B] text-center max-w-md">
              Room control operations (team setup, start match, live record transactions, forced sale,
              tiebreak order, and finalize) will be wired in Phase 6.
            </p>
            <Link to="/admin">
              <PixelButton variant="ghost">RETURN TO DASHBOARD</PixelButton>
            </Link>
          </div>
        </PixelCard>
      </main>

      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
