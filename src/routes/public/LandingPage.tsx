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
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-end justify-items-center ${isFirstVisit ? 'anim-entrance-ctas' : ''}`}
          >
            {/* ================================================================= */}
            {/* TEAM PHONE: Wooden Checkpoint Signboard                           */}
            {/* ================================================================= */}
            <div className="flex flex-col items-center w-full max-w-[340px]">
              <div
                onPointerEnter={() => setActiveCta('join')}
                onPointerLeave={() => setActiveCta(null)}
                className="group relative w-full bg-[#D78B30] border-[4px] border-[#181512] shadow-[6px_6px_0px_#102040] hover:shadow-[8px_8px_0px_#102040] hover:-translate-y-1 transition-all duration-100 ease-out p-2.5 sm:p-3 flex flex-col justify-between items-center text-center rounded-sm select-none"
              >
                {/* Left edge wood grain shadow */}
                <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-[#B86B1E] border-r-2 border-[#8A4810] pointer-events-none" />
                {/* Right edge wood grain shadow */}
                <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-[#8A4810] border-l-2 border-[#5C2E0A] pointer-events-none" />
                {/* Bottom wood shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-[#8A4810] border-t-2 border-[#5C2E0A] pointer-events-none" />
                {/* Top wood highlight */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#F3B05A] pointer-events-none" />

                {/* Top-Left Green Ivy / Leaves Cluster */}
                <div className="absolute -top-3.5 -left-3.5 pointer-events-none z-20 flex flex-col">
                  <div className="flex">
                    <div className="w-3.5 h-3.5 bg-[#22C55E] border-2 border-[#181512] rounded-sm -rotate-12" />
                    <div className="w-3 h-3 bg-[#16A34A] border-2 border-[#181512] rounded-sm -ml-1.5 mt-1" />
                  </div>
                  <div className="flex -mt-1 ml-1">
                    <div className="w-3.5 h-3.5 bg-[#15803D] border-2 border-[#181512] rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-[#22C55E] border border-[#181512] rounded-sm -ml-1" />
                  </div>
                </div>

                {/* Inner Cream/Parchment Face */}
                <div className="relative w-full bg-[#FFF5D6] border-[3px] border-[#9E5D1D] shadow-inner pt-3 pb-3 px-3 sm:px-4 flex flex-col items-center justify-between gap-3 rounded-none z-10">
                  {/* 4 Corner Silver Rivets with Screws */}
                  <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181512] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181512]" />
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181512] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181512]" />
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181512] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181512]" />
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181512] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181512]" />
                  </div>

                  {/* Icon & Title */}
                  <div className="flex flex-col items-center text-center gap-1.5 pt-0.5">
                    <div className="shrink-0 group-hover:scale-110 transition-transform duration-100">
                      <PixelPhoneIcon size={40} />
                    </div>
                    <h2 className="font-pixel text-xs sm:text-sm text-[#181512] uppercase tracking-wider font-extrabold">
                      TEAM PHONE
                    </h2>
                  </div>

                  {/* Action Button: JOIN MATCH */}
                  <ArcadeLink
                    to="/join"
                    variant="secondary"
                    size="md"
                    fullWidth
                    ctaType="join"
                    onFocus={() => setActiveCta('join')}
                    onBlur={() => setActiveCta(null)}
                    className="!bg-[#FFCC00] hover:!bg-[#FFB800] !border-[#181512] !text-[#181512] shadow-[3px_3px_0px_#181512]"
                  >
                    JOIN MATCH
                  </ArcadeLink>
                </div>
              </div>

              {/* Sturdy Wooden Timber Support Posts (Planted into ground) */}
              <div className="hidden sm:flex justify-between w-4/5 px-4 -mt-1 pointer-events-none z-0">
                <div className="w-8 h-8 bg-[#A1551E] border-x-[3px] border-b-[3px] border-[#181512] flex flex-col justify-around py-1">
                  <div className="w-full h-0.5 bg-[#6E3811]" />
                  <div className="w-full h-0.5 bg-[#6E3811]" />
                </div>
                <div className="w-8 h-8 bg-[#A1551E] border-x-[3px] border-b-[3px] border-[#181512] flex flex-col justify-around py-1">
                  <div className="w-full h-0.5 bg-[#6E3811]" />
                  <div className="w-full h-0.5 bg-[#6E3811]" />
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* EVENT ADMIN: Stone Castle Battlement Signboard                    */}
            {/* ================================================================= */}
            <div className="flex flex-col items-center w-full max-w-[340px]">
              {/* Castle Battlements & Red Waving Flag Header */}
              <div className="hidden sm:flex justify-between items-end w-full px-1 -mb-1.5 z-10 pointer-events-none">
                {/* 6 Castle Merlons / Teeth */}
                <div className="flex gap-1">
                  <div className="w-4 h-3.5 bg-[#94A3B8] border-t-[3px] border-x-[3px] border-[#181E28]" />
                  <div className="w-4 h-3.5 bg-[#94A3B8] border-t-[3px] border-x-[3px] border-[#181E28]" />
                  <div className="w-4 h-3.5 bg-[#94A3B8] border-t-[3px] border-x-[3px] border-[#181E28]" />
                  <div className="w-4 h-3.5 bg-[#94A3B8] border-t-[3px] border-x-[3px] border-[#181E28]" />
                  <div className="w-4 h-3.5 bg-[#94A3B8] border-t-[3px] border-x-[3px] border-[#181E28]" />
                  <div className="w-4 h-3.5 bg-[#94A3B8] border-t-[3px] border-x-[3px] border-[#181E28]" />
                </div>
                {/* Waving Castle Flag on Pole */}
                <div className="flex items-end -mb-1 mr-0.5">
                  <div className="w-6 h-4 bg-[#E11D48] border-2 border-[#181E28] anim-flag-flutter flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-[#FFCC00]" />
                  </div>
                  <div className="w-1.5 h-7 bg-[#181E28]" />
                </div>
              </div>

              <div
                onPointerEnter={() => setActiveCta('admin')}
                onPointerLeave={() => setActiveCta(null)}
                className="group relative w-full bg-[#64748B] border-[4px] border-[#181E28] shadow-[6px_6px_0px_#102040] hover:shadow-[8px_8px_0px_#102040] hover:-translate-y-1 transition-all duration-100 ease-out p-2.5 sm:p-3 flex flex-col justify-between items-center text-center rounded-sm select-none"
              >
                {/* Left stone highlight */}
                <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-[#94A3B8] border-r-2 border-[#475569] pointer-events-none" />
                {/* Right stone shadow */}
                <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-[#475569] border-l-2 border-[#334155] pointer-events-none" />
                {/* Top stone highlight */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#CBD5E1] pointer-events-none" />
                {/* Bottom Stone Corbel Bracket Blocks */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#334155] border-t-2 border-[#1E293B] pointer-events-none" />

                {/* Inner Light Grey/Stone Face */}
                <div className="relative w-full bg-[#F1F5F9] border-[3px] border-[#64748B] shadow-inner pt-3 pb-3 px-3 sm:px-4 flex flex-col items-center justify-between gap-3 rounded-none z-10">
                  {/* 4 Corner Silver Rivets with Screws */}
                  <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181E28] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181E28]" />
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181E28] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181E28]" />
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181E28] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181E28]" />
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border border-[#181E28] shadow-[1px_1px_0px_#475569] flex items-center justify-center">
                    <div className="w-1 h-0.5 bg-[#181E28]" />
                  </div>

                  {/* Icon & Title */}
                  <div className="flex flex-col items-center text-center gap-1.5 pt-0.5">
                    <div className="shrink-0 group-hover:scale-110 transition-transform duration-100">
                      <PixelTerminalIcon size={40} />
                    </div>
                    <h2 className="font-pixel text-xs sm:text-sm text-[#181E28] uppercase tracking-wider font-extrabold">
                      EVENT ADMIN
                    </h2>
                  </div>

                  {/* Action Button: ADMIN CONSOLE */}
                  <ArcadeLink
                    to="/admin"
                    variant="primary"
                    size="md"
                    fullWidth
                    ctaType="admin"
                    onFocus={() => setActiveCta('admin')}
                    onBlur={() => setActiveCta(null)}
                    className="!bg-[#16A34A] hover:!bg-[#15803D] !border-[#181E28] !text-white shadow-[3px_3px_0px_#181E28]"
                  >
                    ADMIN CONSOLE
                  </ArcadeLink>
                </div>
              </div>

              {/* Sturdy Stone Pillar Support Posts (Planted into ground) */}
              <div className="hidden sm:flex justify-between w-4/5 px-4 -mt-1 pointer-events-none z-0">
                <div className="w-8 h-8 bg-[#64748B] border-x-[3px] border-b-[3px] border-[#181E28] flex flex-col justify-around py-1">
                  <div className="w-full h-0.5 bg-[#334155]" />
                  <div className="w-full h-0.5 bg-[#334155]" />
                </div>
                <div className="w-8 h-8 bg-[#64748B] border-x-[3px] border-b-[3px] border-[#181E28] flex flex-col justify-around py-1">
                  <div className="w-full h-0.5 bg-[#334155]" />
                  <div className="w-full h-0.5 bg-[#334155]" />
                </div>
              </div>
            </div>
          </div>

          {/* Raised Grassy Stage Platform with Daisies (Underneath the Posts) */}
          <div className="hidden sm:flex flex-col items-center w-full -mt-0.5 pointer-events-none">
            {/* Top Grass Strip with Wildflowers & Earthy Base */}
            <div className="w-full h-4 bg-[#22C55E] border-3 border-[#181512] relative flex items-center justify-around px-8 shadow-sm">
              <span className="text-[12px] select-none -mt-1">🌼</span>
              <span className="text-[12px] select-none -mt-1">🌸</span>
              <span className="text-[12px] select-none -mt-1">🌼</span>
              <span className="text-[12px] select-none -mt-1">🌸</span>
              <span className="text-[12px] select-none -mt-1">🌼</span>
            </div>
            <div className="w-full h-2 bg-[#B84418] border-x-3 border-b-3 border-[#181512]" />
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
