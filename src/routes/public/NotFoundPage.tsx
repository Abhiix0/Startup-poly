import React from 'react';
import { ArcadeLink, PixelBrickTile } from '../../ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between selection:bg-[#FFCC00] selection:text-[#102040]">
      {/* Top bar link */}
      <header className="p-4">
        <ArcadeLink
          to="/"
          variant="ghost"
          size="sm"
          className="inline-flex"
        >
          ◄ STARTUPOLY
        </ArcadeLink>
      </header>

      {/* Main 404 Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#FAF8F5] border-4 border-[#102040] shadow-[6px_6px_0px_#102040] overflow-hidden">
            {/* Header Strip */}
            <div className="bg-[#B84418] border-b-4 border-[#102040] px-4 py-2 flex items-center justify-between">
              <span className="font-pixel text-xs text-white uppercase tracking-wider">
                ★ 404 ERROR ★
              </span>
              <span className="font-pixel text-xs text-[#FFCC00]">
                ?
              </span>
            </div>

            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-[#B84418] text-white border-3 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center mx-auto mb-4 font-pixel text-2xl">
                ?
              </div>

              <h1 className="font-pixel text-sm sm:text-base uppercase text-[#102040] mb-2">
                LEVEL NOT FOUND
              </h1>

              <p className="font-mono text-xs sm:text-sm text-[#475569] mb-6 leading-relaxed">
                The requested scoreboard path does not exist in the system.
              </p>

              <ArcadeLink
                to="/"
                variant="primary"
                size="lg"
                fullWidth
              >
                ◄ BACK TO START
              </ArcadeLink>
            </div>
          </div>
        </div>
      </main>

      {/* Brick footer ground */}
      <footer className="w-full">
        <PixelBrickTile hasGrass={true} className="h-8 w-full" />
      </footer>
    </div>
  );
};
