import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PixelCard, PixelButton } from '../../ui';

export const AdminRoomHistoryPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <Link to="/admin/history" className="font-pixel text-xs text-[#FFCC00] hover:underline">
            ◄ HISTORY
          </Link>
          <span className="font-pixel text-xs text-white">MATCH {roomId?.slice(0, 8)}</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <PixelCard title={`ARCHIVED MATCH DETAILS: ${roomId}`} headerBg="navy" padding="lg">
          <p className="font-mono text-xs text-[#64748B] mb-4">
            Immutable podium standings, audit log replay, and final team metrics will be rendered here.
          </p>
          <Link to="/admin/history">
            <PixelButton variant="ghost">BACK TO ARCHIVE</PixelButton>
          </Link>
        </PixelCard>
      </main>

      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
