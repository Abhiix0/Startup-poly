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
import { FloatingPlatforms } from './FloatingPlatforms';
import { DistantHillsAndCastle } from './DistantHillsAndCastle';

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
      className="min-h-screen nes-sky-gradient flex flex-col justify-between relative overflow-x-hidden selection:bg-[#FFCC00] selection:text-[#102040]"
    >
      {/* ======================================================================= */}
      {/* LAYER 1: Distant Hills & Castle Silhouette Layer                         */}
      {/* ======================================================================= */}
      <DistantHillsAndCastle />

      {/* ======================================================================= */}
      {/* LAYER 2: Upper Floating Platforms (Question block, coins, critter)       */}
      {/* ======================================================================= */}
      <FloatingPlatforms />

      {/* ======================================================================= */}
      {/* LAYER 3: Main Title Screen UI (Logo, Status, Headline, Signboards)       */}
      {/* ======================================================================= */}
      <div className="flex-1 flex flex-col justify-center pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-8 relative z-10">
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
        <main className="max-w-3xl w-full mx-auto px-4 py-1 flex flex-col justify-center z-10">
          <div
            onAnimationEnd={handleEntranceEnd}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-end ${isFirstVisit ? 'anim-entrance-ctas' : ''}`}
          >
            {/* ================================================================= */}
            {/* TEAM PHONE: Wooden Checkpoint Signboard                           */}
            {/* ================================================================= */}
            <div className="flex flex-col items-center">
              <div
                onPointerEnter={() => setActiveCta('join')}
                onPointerLeave={() => setActiveCta(null)}
                className="group relative w-full bg-[#FFFDF0] border-[5px] border-[#102040] shadow-[7px_7px_0px_#102040] hover:shadow-[9px_9px_0px_#102040] hover:-translate-y-1.5 transition-all duration-100 ease-out pt-4 px-5 sm:px-7 pb-5 sm:pb-7 flex flex-col justify-between items-center text-center gap-4 rounded-none select-none"
                style={{
                  outline: '3px solid #C88A4A',
                  outlineOffset: '-7px',
                }}
              >
                {/* Moss / Leaf tuft on top-left corner */}
                <div className="absolute -top-3 -left-3 pointer-events-none flex">
                  <div className="w-4 h-4 bg-[#22B14C] border-2 border-[#102040] rounded-sm -rotate-12" />
                  <div className="w-3 h-3 bg-[#16A34A] border-2 border-[#102040] rounded-sm -ml-1 mt-1" />
                </div>

                {/* 4 Corner Iron Rivet Bolts */}
                <div className="absolute top-2 left-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />

                {/* Top Wooden Plank Header Bar */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-[#D4A373] border-b-2 border-[#102040]" />

                <div className="flex flex-col items-center text-center gap-2.5 pt-2">
                  <div className="shrink-0 group-hover:scale-110 transition-transform duration-100">
                    <PixelPhoneIcon size={44} />
                  </div>
                  <h2 className="font-pixel text-sm sm:text-base text-[#102040] uppercase tracking-wider font-extrabold">
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

              {/* Sturdy Wooden Log Support Posts (Planted into ground) */}
              <div className="hidden sm:flex justify-between w-4/5 px-4 -mt-1 pointer-events-none">
                <div className="w-7 h-6 bg-[#8C5320] border-x-[3px] border-b-[3px] border-[#102040]" />
                <div className="w-7 h-6 bg-[#8C5320] border-x-[3px] border-b-[3px] border-[#102040]" />
              </div>
            </div>

            {/* ================================================================= */}
            {/* EVENT ADMIN: Stone Castle Battlement Signboard                    */}
            {/* ================================================================= */}
            <div className="flex flex-col items-center">
              {/* Castle Battlements & Red Waving Flag Header */}
              <div className="hidden sm:flex justify-between w-full px-2 -mb-1 z-10 pointer-events-none">
                <div className="flex gap-1.5">
                  <div className="w-5 h-4 bg-[#64748B] border-t-[3px] border-x-[3px] border-[#102040]" />
                  <div className="w-5 h-4 bg-[#64748B] border-t-[3px] border-x-[3px] border-[#102040]" />
                  <div className="w-5 h-4 bg-[#64748B] border-t-[3px] border-x-[3px] border-[#102040]" />
                </div>
                {/* Waving Castle Flag */}
                <div className="flex items-end -mb-1 mr-1">
                  <div className="w-5 h-4 bg-[#D32F2F] border-2 border-[#102040] anim-flag-flutter flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-[#FFCC00]" />
                  </div>
                  <div className="w-1.5 h-6 bg-[#102040]" />
                </div>
              </div>

              <div
                onPointerEnter={() => setActiveCta('admin')}
                onPointerLeave={() => setActiveCta(null)}
                className="group relative w-full bg-[#F8FAFC] border-[5px] border-[#102040] shadow-[7px_7px_0px_#102040] hover:shadow-[9px_9px_0px_#102040] hover:-translate-y-1.5 transition-all duration-100 ease-out pt-4 px-5 sm:px-7 pb-5 sm:pb-7 flex flex-col justify-between items-center text-center gap-4 rounded-none select-none"
                style={{
                  outline: '3px solid #94A3B8',
                  outlineOffset: '-7px',
                }}
              >
                {/* 4 Corner Iron Rivet Bolts */}
                <div className="absolute top-2 left-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-[#102040] pointer-events-none" />

                {/* Top Stone Wall Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-[#64748B] border-b-2 border-[#102040]" />

                <div className="flex flex-col items-center text-center gap-2.5 pt-2">
                  <div className="shrink-0 group-hover:scale-110 transition-transform duration-100">
                    <PixelTerminalIcon size={44} />
                  </div>
                  <h2 className="font-pixel text-sm sm:text-base text-[#102040] uppercase tracking-wider font-extrabold">
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

              {/* Sturdy Stone Pillar Support Posts (Planted into ground) */}
              <div className="hidden sm:flex justify-between w-4/5 px-4 -mt-1 pointer-events-none">
                <div className="w-7 h-6 bg-[#64748B] border-x-[3px] border-b-[3px] border-[#102040]" />
                <div className="w-7 h-6 bg-[#64748B] border-x-[3px] border-b-[3px] border-[#102040]" />
              </div>
            </div>
          </div>

          {/* Raised Grassy Stage Platform with Daisies (Underneath the Posts) */}
          <div className="hidden sm:flex flex-col items-center w-full -mt-0.5 pointer-events-none">
            {/* Top Grass Strip with Wildflowers & Earthy Base */}
            <div className="w-full h-4 bg-[#22B14C] border-3 border-[#102040] relative flex items-center justify-around px-6">
              <span className="text-[12px] select-none -mt-1">🌼</span>
              <span className="text-[12px] select-none -mt-1">🌸</span>
              <span className="text-[12px] select-none -mt-1">🌼</span>
              <span className="text-[12px] select-none -mt-1">🌸</span>
              <span className="text-[12px] select-none -mt-1">🌼</span>
            </div>
            <div className="w-full h-2 bg-[#B84418] border-x-3 border-b-3 border-[#102040]" />
          </div>
        </main>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 4: Living Pixel World Ground & Scene                              */}
      {/* ======================================================================= */}
      <PixelWorld />
    </div>
  );
};
