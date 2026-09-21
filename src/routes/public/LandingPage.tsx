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
import { LandingHud } from './LandingHud';
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
      {/* NES Sky Header */}
      <header className="relative pt-2.5 sm:pt-4 pb-1 sm:pb-2 px-4 text-center z-10">
        {/* Level 1: Wordmark Logo */}
        <div className={`flex flex-col items-center select-none text-center mt-0.5 mb-1 ${isFirstVisit ? 'anim-entrance-logo' : ''}`}>
          <div className="relative inline-flex items-center gap-2 sm:gap-3 md:gap-4">
            <PixelCoin size={22} className="anim-coin-idle shrink-0" ariaHidden={true} />
            <h1
              className="font-pixel tracking-wider font-extrabold text-[#FFCC00] uppercase text-xl sm:text-3xl md:text-4xl lg:text-5xl"
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
          <div className="mt-1 inline-flex items-center gap-1 sm:gap-2 px-2.5 py-0.5 bg-[#102040] border-2 border-[#FFCC00] rounded-sm shadow-[2px_2px_0px_#B84418]">
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

          {/* Live Indicator */}
          <div className="mt-1">
            <LiveIndicator />
          </div>
        </div>

        {/* Level 3: Tagline & Supporting Text */}
        <div className={`mt-1 sm:mt-1.5 text-center max-w-lg mx-auto px-2 ${isFirstVisit ? 'anim-entrance-tagline' : ''}`}>
          <p className="font-pixel text-[10px] sm:text-[11px] md:text-xs text-[#FFFBEB] uppercase tracking-wider drop-shadow-[2px_2px_0px_#102040] leading-snug mb-0.5">
            THE BOARD IS PHYSICAL.
            <br className="sm:hidden" /> THE SCORE IS LIVE.
          </p>
          <p className="font-mono text-[10px] sm:text-[11px] md:text-xs text-[#FFFBEB]/90 font-medium tracking-wide drop-shadow-[1px_1px_0px_#102040]">
            The live digital scoreboard for the STARTUPOLY physical startup game.
          </p>
        </div>
      </header>

      {/* Main Portals Grid (Level 4 CTAs & Cards) */}
      <main className="max-w-3xl w-full mx-auto px-4 py-1 sm:py-2 flex-1 flex flex-col justify-center gap-2 sm:gap-4 z-10">
        <div
          onAnimationEnd={handleEntranceEnd}
          className={`grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch ${isFirstVisit ? 'anim-entrance-ctas' : ''}`}
        >
          {/* Team Portal Card */}
          <div className="relative bg-white border-3 sm:border-4 border-[#102040] shadow-[5px_5px_0px_#102040] pt-1 px-3 sm:px-5 pb-3 sm:pb-4 flex flex-col justify-between rounded-sm">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFCC00]" />

            <div className="flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-2 my-2 sm:mb-3">
              <div className="shrink-0">
                <PixelPhoneIcon size={38} />
              </div>
              <div className="flex-1 sm:flex-initial">
                <h2 className="font-pixel text-xs sm:text-sm text-[#102040] uppercase tracking-wider mb-0.5">
                  TEAM PHONE SCOREBOARD
                </h2>
                <p className="font-mono text-[11px] text-[#334155] leading-snug">
                  See your cash, company value and businesses live.
                </p>
              </div>
            </div>

            <ArcadeLink
              to="/join"
              variant="secondary"
              size="md"
              fullWidth
              ctaType="join"
              onPointerEnter={() => setActiveCta('join')}
              onPointerLeave={() => setActiveCta(null)}
              onPointerDown={() => setActiveCta('join')}
              onFocus={() => setActiveCta('join')}
              onBlur={() => setActiveCta(null)}
            >
              JOIN MATCH
            </ArcadeLink>
          </div>

          {/* Admin Portal Card */}
          <div className="relative bg-white border-3 sm:border-4 border-[#102040] shadow-[5px_5px_0px_#102040] pt-1 px-3 sm:px-5 pb-3 sm:pb-4 flex flex-col justify-between rounded-sm">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#22B14C]" />

            <div className="flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-2 my-2 sm:mb-3">
              <div className="shrink-0">
                <PixelTerminalIcon size={38} />
              </div>
              <div className="flex-1 sm:flex-initial">
                <h2 className="font-pixel text-xs sm:text-sm text-[#102040] uppercase tracking-wider mb-0.5">
                  EVENT ADMIN CONSOLE
                </h2>
                <p className="font-mono text-[11px] text-[#334155] leading-snug">
                  Run the match: teams, clock, cash, businesses.
                </p>
              </div>
            </div>

            <ArcadeLink
              to="/admin"
              variant="primary"
              size="md"
              fullWidth
              ctaType="admin"
              onPointerEnter={() => setActiveCta('admin')}
              onPointerLeave={() => setActiveCta(null)}
              onPointerDown={() => setActiveCta('admin')}
              onFocus={() => setActiveCta('admin')}
              onBlur={() => setActiveCta(null)}
            >
              ADMIN CONSOLE
            </ArcadeLink>
          </div>
        </div>

        {/* Level 5: HUD Slot */}
        <div data-slot="hud" className="w-full">
          <LandingHud />
        </div>
      </main>

      {/* Level 6: Living Pixel World Scene */}
      <PixelWorld />
    </div>
  );
};
