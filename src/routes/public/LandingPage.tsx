import React, { useState, useEffect } from 'react';
import {
  ArcadeLink,
} from '../../ui';
import {
  PixelCoin,
  PixelPhoneIcon,
  PixelTerminalIcon,
} from '../../ui/pixel';
import { usePageVisibility } from '../../lib/usePageVisibility';
import { useFirstVisit } from '../../lib/useFirstVisit';
import { PixelWorld } from './PixelWorld';
import { LiveIndicator } from './LiveIndicator';

export const LandingPage: React.FC = () => {
  const { isFirstVisit, markSeen } = useFirstVisit();
  const [activeCta, setActiveCta] = useState<'join' | 'admin' | null>(null);

  // Synchronize document pause state with tab visibility
  usePageVisibility();

  // Safety fallback to mark entrance animation seen
  useEffect(() => {
    if (isFirstVisit) {
      const timer = setTimeout(() => {
        markSeen();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit, markSeen]);

  const handleEntranceEnd = () => {
    if (isFirstVisit) {
      markSeen();
    }
  };

  return (
    <div
      data-cta={activeCta || undefined}
      className="min-h-screen nes-sky-gradient flex flex-col justify-between overflow-x-hidden selection:bg-[#FFCC00] selection:text-[#102040]"
    >
      {/* Centered Hero Content Block (Title Screen Main Frame) */}
      <div className="flex-1 flex flex-col justify-center pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-8">
        {/* NES Sky Header */}
        <header className="relative pb-4 sm:pb-6 px-4 text-center z-10">
          {/* Level 1: Wordmark Logo */}
          <div className={`flex flex-col items-center select-none text-center mb-2 ${isFirstVisit ? 'anim-entrance-logo' : ''}`}>
            <div className="relative inline-flex items-center gap-2 sm:gap-3 md:gap-4">
              <PixelCoin size={22} className="anim-coin-idle shrink-0" ariaHidden={true} />
              <h1
                className="font-pixel tracking-wider font-extrabold text-[#FFCC00] uppercase text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                style={{
                  textShadow: `
                    3px 3px 0 #B84418,
                    5px 5px 0 #102040,
                    -2px -2px 0 #102040,
                    2px -2px 0 #102040,
                    -2px 2px 0 #102040,
                    2px 2px 0 #102040
                  `,
                  letterSpacing: '0.08em',
                }}
              >
                STARTUPOLY
              </h1>
              <PixelCoin size={22} className="anim-coin-idle shrink-0" ariaHidden={true} />
            </div>

            {/* Level 2: Subtitle Badge */}
            <div className="mt-1.5 inline-flex items-center gap-1 sm:gap-2 px-2.5 py-0.5 bg-[#102040] border-2 border-[#FFCC00] rounded-sm shadow-[2px_2px_0px_#B84418]">
              <span className="font-pixel text-[8px] sm:text-[9px] md:text-[10px] text-[#FFFBEB] tracking-widest font-bold">
                ★{' '}
                <span className={isFirstVisit ? 'anim-entrance-word-1' : ''}>DREAM</span>{' '}
                ·{' '}
                <span className={isFirstVisit ? 'anim-entrance-word-2' : ''}>BUILD</span>{' '}
                ·{' '}
                <span className={isFirstVisit ? 'anim-entrance-word-3' : ''}>GROW</span>{' '}
                ★
              </span>
            </div>

            {/* Live Indicator (Compact Game HUD status) */}
            <div className="mt-2">
              <LiveIndicator />
            </div>
          </div>

          {/* Level 3: Hero Headline */}
          <div className={`mt-2 sm:mt-3 text-center max-w-lg mx-auto px-2 ${isFirstVisit ? 'anim-entrance-tagline' : ''}`}>
            <p className="font-pixel text-[11px] sm:text-xs md:text-sm text-[#FFFBEB] uppercase tracking-wider drop-shadow-[2px_2px_0px_#102040] leading-snug">
              THE BOARD IS PHYSICAL.
              <br className="sm:hidden" /> THE SCORE IS LIVE.
            </p>
          </div>
        </header>

        {/* Main Portals Grid (Level 4 Primary Checkpoints) */}
        <main className="max-w-2xl w-full mx-auto px-4 py-2 flex flex-col justify-center z-10">
          <div
            onAnimationEnd={handleEntranceEnd}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-stretch ${isFirstVisit ? 'anim-entrance-ctas' : ''}`}
          >
            {/* Team Portal Checkpoint Card */}
            <div
              onPointerEnter={() => setActiveCta('join')}
              onPointerLeave={() => setActiveCta(null)}
              className="group relative bg-[#FFFDF5] border-4 border-[#102040] shadow-[5px_5px_0px_#102040] hover:shadow-[8px_8px_0px_#102040] hover:-translate-y-1.5 transition-all duration-100 ease-out pt-3 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-between items-center text-center gap-3 sm:gap-4 rounded-none select-none"
            >
              {/* Corner Iron Rivets */}
              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />

              {/* Top Gold Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFCC00] border-b-2 border-[#102040]" />

              <div className="flex flex-col items-center text-center gap-2 pt-1">
                <div className="shrink-0 group-hover:scale-110 transition-transform duration-100">
                  <PixelPhoneIcon size={36} />
                </div>
                <h2 className="font-pixel text-xs sm:text-sm text-[#102040] uppercase tracking-wider">
                  TEAM PHONE
                </h2>
              </div>

              <ArcadeLink
                to="/join"
                variant="secondary"
                size="md"
                fullWidth
                ctaType="join"
                onFocus={() => setActiveCta('join')}
                onBlur={() => setActiveCta(null)}
              >
                JOIN MATCH
              </ArcadeLink>
            </div>

            {/* Admin Portal Checkpoint Card */}
            <div
              onPointerEnter={() => setActiveCta('admin')}
              onPointerLeave={() => setActiveCta(null)}
              className="group relative bg-[#FFFDF5] border-4 border-[#102040] shadow-[5px_5px_0px_#102040] hover:shadow-[8px_8px_0px_#102040] hover:-translate-y-1.5 transition-all duration-100 ease-out pt-3 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-between items-center text-center gap-3 sm:gap-4 rounded-none select-none"
            >
              {/* Corner Iron Rivets */}
              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />

              {/* Top Emerald Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#22B14C] border-b-2 border-[#102040]" />

              <div className="flex flex-col items-center text-center gap-2 pt-1">
                <div className="shrink-0 group-hover:scale-110 transition-transform duration-100">
                  <PixelTerminalIcon size={36} />
                </div>
                <h2 className="font-pixel text-xs sm:text-sm text-[#102040] uppercase tracking-wider">
                  EVENT ADMIN
                </h2>
              </div>

              <ArcadeLink
                to="/admin"
                variant="primary"
                size="md"
                fullWidth
                ctaType="admin"
                onFocus={() => setActiveCta('admin')}
                onBlur={() => setActiveCta(null)}
              >
                ADMIN CONSOLE
              </ArcadeLink>
            </div>
          </div>
        </main>
      </div>

      {/* Level 5: Living Pixel World Scene */}
      <PixelWorld />
    </div>
  );
};
