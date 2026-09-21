import React from 'react';
import { Link } from 'react-router-dom';
import { PixelCard, PixelButton, EmptyState } from '../../ui';

export const AdminHistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="font-pixel text-xs text-[#FFCC00] hover:underline">
            ◄ CONSOLE
          </Link>
          <span className="font-pixel text-xs text-white">MATCH HISTORY</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <PixelCard title="COMPLETED TOURNAMENT ARCHIVE" headerBg="navy" padding="lg">
          <EmptyState
            title="NO FINALIZED MATCHES YET"
            description="When matches reach TIME_EXPIRED and are finalized with tiebreaks, immutable results appear here."
            actionLabel="BACK TO DASHBOARD"
            onAction={() => window.history.back()}
          />
        </PixelCard>
      </main>

      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
