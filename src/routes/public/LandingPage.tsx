import React, { useState, useEffect } from 'react';
import {
  ArcadeLink,
  PixelCloudFluffy,
  PixelPipe,
  PixelBrickTile,
} from '../../ui';
import {
  PixelCoin,
  PixelPhoneIcon,
  PixelTerminalIcon,
  PixelHill,
  PixelQuestionBlock,
  PixelPoly,
  PixelBug,
  PixelGrassTuft,
  PixelSparkle,
} from '../../ui/pixel';
import { usePageVisibility } from '../../lib/usePageVisibility';
import { useFirstVisit } from '../../lib/useFirstVisit';

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
      {/* NES Sky & Clouds Header */}
      <header className="relative pt-4 sm:pt-6 pb-2 sm:pb-3 px-4 text-center">
        {/* Decorative Floating Clouds */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-8 opacity-90 select-none pointer-events-none" aria-hidden="true">
          <PixelCloudFluffy size={64} />
        </div>
        <div className="absolute top-4 sm:top-6 right-2 sm:right-10 opacity-90 select-none pointer-events-none" aria-hidden="true">
          <PixelCloudFluffy size={76} />
        </div>
        <div className="hidden sm:block absolute top-20 left-12 lg:left-20 opacity-60 select-none pointer-events-none" aria-hidden="true">
          <PixelCloudFluffy size={52} />
        </div>
        <div className="hidden sm:block absolute top-24 right-12 lg:right-24 opacity-75 select-none pointer-events-none" aria-hidden="true">
          <PixelCloudFluffy size={60} />
        </div>

        {/* Level 1: Wordmark Logo */}
        <div className={`flex flex-col items-center select-none text-center mt-1 mb-1 sm:mb-2 ${isFirstVisit ? 'anim-entrance-logo' : ''}`}>
          <div className="relative inline-flex items-center gap-2 sm:gap-3 md:gap-4">
            <PixelCoin size={26} className="anim-coin-idle shrink-0" ariaHidden={true} />
            <h1
              className="font-pixel tracking-wider font-extrabold text-[#FFCC00] uppercase text-2xl sm:text-4xl md:text-5xl lg:text-6xl"
              style={{
                textShadow: `
                  3px 3px 0 #B84418,
                  6px 6px 0 #102040,
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
            <PixelCoin size={26} className="anim-coin-idle shrink-0" ariaHidden={true} />
          </div>

          {/* Level 2: Subtitle Badge */}
          <div className="mt-1 sm:mt-2 inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1 bg-[#102040] border-2 border-[#FFCC00] rounded-sm shadow-[2px_2px_0px_#B84418]">
            <span className="font-pixel text-[9px] sm:text-[10px] md:text-xs text-[#FFFBEB] tracking-widest font-bold">
              ★{' '}
              <span className={isFirstVisit ? 'anim-entrance-word-1' : ''}>DREAM</span>{' '}
              ·{' '}
              <span className={isFirstVisit ? 'anim-entrance-word-2' : ''}>BUILD</span>{' '}
              ·{' '}
              <span className={isFirstVisit ? 'anim-entrance-word-3' : ''}>GROW</span>{' '}
              ★
            </span>
          </div>
        </div>

        {/* Level 3: Tagline & Supporting Text */}
        <div className={`mt-2 sm:mt-3 text-center max-w-xl mx-auto px-2 ${isFirstVisit ? 'anim-entrance-tagline' : ''}`}>
          <p className="font-pixel text-[11px] sm:text-xs md:text-sm text-[#FFFBEB] uppercase tracking-wider drop-shadow-[2px_2px_0px_#102040] leading-snug mb-1">
            THE BOARD IS PHYSICAL.
            <br className="sm:hidden" /> THE SCORE IS LIVE.
          </p>
          <p className="font-mono text-[11px] sm:text-xs md:text-sm text-[#FFFBEB]/90 font-medium tracking-wide">
            The live digital scoreboard for the STARTUPOLY physical startup game.
          </p>
        </div>
      </header>

      {/* Main Portals Grid (Level 4 CTAs & Cards) */}
      <main className="max-w-4xl w-full mx-auto px-4 py-2 sm:py-4 flex-1 flex flex-col justify-center gap-3 sm:gap-6">
        <div
          onAnimationEnd={handleEntranceEnd}
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch ${isFirstVisit ? 'anim-entrance-ctas' : ''}`}
        >
          {/* Team Portal Card */}
          <div className="relative bg-white border-4 border-[#102040] shadow-[6px_6px_0px_#102040] pt-1 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-between rounded-sm">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFCC00]" />

            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-3 my-2.5 sm:mb-5">
              <div className="shrink-0">
                <PixelPhoneIcon size={48} />
              </div>
              <div className="flex-1 sm:flex-initial">
                <h2 className="font-pixel text-xs sm:text-sm md:text-base text-[#102040] uppercase tracking-wider mb-1">
                  TEAM PHONE SCOREBOARD
                </h2>
                <p className="font-mono text-xs text-[#334155] leading-snug">
                  See your cash, company value and businesses live.
                </p>
              </div>
            </div>

            <ArcadeLink
              to="/join"
              variant="secondary"
              size="lg"
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
          <div className="relative bg-white border-4 border-[#102040] shadow-[6px_6px_0px_#102040] pt-1 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-between rounded-sm">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#22B14C]" />

            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-3 my-2.5 sm:mb-5">
              <div className="shrink-0">
                <PixelTerminalIcon size={48} />
              </div>
              <div className="flex-1 sm:flex-initial">
                <h2 className="font-pixel text-xs sm:text-sm md:text-base text-[#102040] uppercase tracking-wider mb-1">
                  EVENT ADMIN CONSOLE
                </h2>
                <p className="font-mono text-xs text-[#334155] leading-snug">
                  Run the match: teams, clock, cash, businesses.
                </p>
              </div>
            </div>

            <ArcadeLink
              to="/admin"
              variant="primary"
              size="lg"
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

        {/* Level 5: HUD Placeholder Container */}
        <div data-slot="hud" className="w-full" />
      </main>

      {/* Level 6: NES Platformer Ground Footer */}
      <footer className="w-full relative select-none">
        {/* Decorative Ground Platform Scene */}
        <div className="relative w-full h-20 sm:h-24 pointer-events-none" aria-hidden="true">
          {/* Left Hill */}
          <div className="hidden md:block absolute bottom-0 left-2 lg:left-6 pointer-events-none select-none">
            <PixelHill size={96} />
          </div>

          {/* Left Hill Sparkles */}
          <div className="hidden md:block absolute bottom-18 left-14 lg:left-20 pointer-events-none select-none anim-sparkle">
            <PixelSparkle size={14} />
          </div>
          <div className="hidden md:block absolute bottom-12 left-2 pointer-events-none select-none anim-sparkle delay-150">
            <PixelSparkle size={12} />
          </div>

          {/* Left Pipe with Popping Coins */}
          <div className="hidden md:flex absolute bottom-0 left-24 lg:left-32 pointer-events-none select-none flex-col items-center">
            <div className="flex gap-1 -mb-1 anim-coin-idle">
              <PixelCoin size={16} />
              <PixelCoin size={18} />
            </div>
            <PixelPipe />
          </div>

          {/* Left Question Block + Original PixelBug on Brick Platform */}
          <div className="hidden lg:block absolute bottom-16 left-48 pointer-events-none select-none">
            <PixelQuestionBlock size={24} />
          </div>
          <div className="hidden lg:flex absolute bottom-0 left-52 pointer-events-none select-none flex-col items-center">
            <PixelBug size={20} className="mb-0.5" />
            <div className="flex">
              <div className="w-6 h-6 bg-[#B84418] border-2 border-[#102040]" />
              <div className="w-6 h-6 bg-[#B84418] border-2 border-[#102040]" />
            </div>
          </div>

          {/* Right Hill */}
          <div className="hidden md:block absolute bottom-0 right-2 lg:right-6 pointer-events-none select-none">
            <PixelHill size={96} />
          </div>

          {/* Right Hill Sparkles */}
          <div className="hidden md:block absolute bottom-18 right-16 lg:right-22 pointer-events-none select-none anim-sparkle">
            <PixelSparkle size={14} />
          </div>
          <div className="hidden md:block absolute bottom-10 right-2 pointer-events-none select-none anim-sparkle delay-200">
            <PixelSparkle size={12} />
          </div>

          {/* Right Floating Question Block */}
          <div className="hidden md:block absolute bottom-16 right-28 lg:right-36 pointer-events-none select-none">
            <PixelQuestionBlock size={24} />
          </div>

          {/* Right Grass Tuft */}
          <div className="hidden lg:block absolute bottom-0 right-48 pointer-events-none select-none">
            <PixelGrassTuft size={18} variant={1} />
          </div>

          {/* Founder Poly with Speech Bubble on Right */}
          <div className="hidden sm:flex absolute bottom-0 right-10 lg:right-20 pointer-events-none select-none items-end gap-2">
            <div className="font-pixel text-[10px] bg-white text-[#102040] px-2.5 py-1.5 border-2 border-[#102040] shadow-[2px_2px_0px_#102040] mb-4">
              Let's Build!
            </div>
            <PixelPoly size={36} animation="static" />
          </div>
        </div>

        {/* Full-width Brick Ground Tile */}
        <PixelBrickTile hasGrass={true} className="h-8 sm:h-10 w-full" />

        {/* Bottom Bar with Metadata */}
        <div className="bg-[#102040] py-2.5 sm:py-3 px-4 text-center border-t-2 border-[#FFCC00]">
          <p className="font-pixel text-[8px] sm:text-[10px] text-[#FFCC00] tracking-wider">
            STARTUPOLY © 2026 • 8-BIT LIVE SCOREBOARD & EVENT MANAGEMENT SYSTEM
          </p>
        </div>
      </footer>
    </div>
  );
};
