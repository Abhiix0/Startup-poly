import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton, PixelCard } from '../../ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      <header className="p-4">
        <Link to="/" className="font-pixel text-xs text-white drop-shadow-[2px_2px_0px_#102040]">
          ◄ STARTUPOLY
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <PixelCard title="404: WARP ZONE ERROR" headerBg="brick" padding="lg">
            <div className="w-16 h-16 bg-[#D32F2F] text-white border-3 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center mx-auto mb-4 font-pixel text-2xl">
              !
            </div>
            <h1 className="font-pixel text-sm sm:text-base text-[#102040] mb-2 uppercase">
              PAGE NOT FOUND
            </h1>
            <p className="font-mono text-xs text-[#64748B] mb-6">
              Our princess is in another castle. The requested scoreboard path does not exist.
            </p>
            <Link to="/">
              <PixelButton variant="primary" fullWidth>
                RETURN TO SAFETY
              </PixelButton>
            </Link>
          </PixelCard>
        </div>
      </main>

      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
