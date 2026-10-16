import React from 'react';
import { ArcadeLink, PixelBrickTile } from '../../ui';
import { PixelCoin, PixelMushroom, PixelPipe, StartupolyLogo } from '../../ui/pixel';
import { DistantHillsAndCastle } from './DistantHillsAndCastle';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-nes-sky flex flex-col selection:bg-nes-gold selection:text-nes-navy">
      {/* Distant hills + castle, sitting on the brick ground */}
      <div className="absolute inset-x-0 bottom-8 h-80 pointer-events-none" aria-hidden="true">
        <DistantHillsAndCastle />
      </div>

      {/* Warp pipes flanking the card */}
      <div className="hidden md:block absolute bottom-8 left-8 lg:left-24 pointer-events-none" aria-hidden="true">
        <PixelPipe size={96} />
      </div>
      <div className="hidden md:block absolute bottom-8 right-8 lg:right-24 pointer-events-none" aria-hidden="true">
        <PixelPipe size={72} />
      </div>

      <header className="relative z-10 flex justify-center pt-6 px-4">
        <ArcadeLink to="/" variant="ghost" size="sm" aria-label="STARTUPOLY home">
          <StartupolyLogo size="sm" />
        </ArcadeLink>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-50 border-4 border-nes-navy shadow-[6px_6px_0px_var(--color-nes-navy)] text-center p-6 sm:p-8">
          <p
            className="font-pixel text-7xl sm:text-8xl font-black text-nes-brick leading-none flex items-center justify-center gap-2"
            aria-label="Error 404"
          >
            <span aria-hidden="true">4</span>
            <PixelMushroom size={64} className="sm:w-20 sm:h-20" />
            <span aria-hidden="true">4</span>
          </p>

          <h1 className="font-pixel text-xl sm:text-2xl font-extrabold text-nes-navy mt-4 mb-2">
            Lost in the Kingdom?
          </h1>

          <p className="text-sm sm:text-base text-neutral-700 mb-6 leading-relaxed">
            Looks like this path doesn't exist. Let's get you back on the map.
          </p>

          <ArcadeLink to="/" variant="primary" size="lg" fullWidth>
            BACK TO HOME
          </ArcadeLink>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-600">
            <PixelCoin size={16} />
            Your game is safe. You just took a wrong turn.
          </p>
        </div>
      </main>

      <footer className="relative z-10 w-full" aria-hidden="true">
        <PixelBrickTile hasGrass={true} className="h-8 w-full" />
      </footer>
    </div>
  );
};
