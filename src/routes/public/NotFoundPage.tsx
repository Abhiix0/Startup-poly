import React from 'react';
import { ArcadeLink, PixelBrickTile } from '../../ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nes-sky flex flex-col justify-between selection:bg-nes-gold selection:text-nes-navy">
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
          <div className="bg-neutral-50 border-4 border-nes-navy shadow-[6px_6px_0px_var(--color-nes-navy)] overflow-hidden">
            {/* Header Strip */}
            <div className="bg-nes-brick border-b-4 border-nes-navy px-4 py-2 flex items-center justify-between">
              <span className="font-pixel text-xs text-white uppercase tracking-wider">
                ★ 404 ERROR ★
              </span>
              <span className="font-pixel text-xs text-nes-gold">
                ?
              </span>
            </div>

            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-nes-brick text-white border-3 border-nes-navy shadow-[3px_3px_0px_var(--color-nes-navy)] flex items-center justify-center mx-auto mb-4 font-pixel text-2xl">
                ?
              </div>

              <h1 className="font-pixel text-sm sm:text-base uppercase text-nes-navy mb-2">
                LEVEL NOT FOUND
              </h1>

              <p className="font-mono text-xs sm:text-sm text-neutral-500 mb-6 leading-relaxed">
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
