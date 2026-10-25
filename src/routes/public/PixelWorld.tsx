import React from 'react';
import {
  PixelCloudFluffy,
  PixelPipe,
} from '../../ui';
import {
  PixelCoin,
  PixelQuestionBlock,
  PixelGrassTuft,
  PixelFlower,
  PixelBug,
  PixelSparkle,
  PixelMonitor,
  PixelBrickTile,
} from '../../ui/pixel';
import { Founder } from './Founder';

export interface PixelWorldProps {
  isIntroActive?: boolean;
}

export const PixelWorld: React.FC<PixelWorldProps> = ({ isIntroActive = false }) => {
  const [worldWidth, setWorldWidth] = React.useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  React.useEffect(() => {
    const handleResize = () => {
      setWorldWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmall = worldWidth < 640;
  const isLarge = worldWidth >= 1024;
  const leftStart = isSmall ? 72 : isLarge ? 120 : 104;
  const rightEnd = isSmall ? 64 : isLarge ? 108 : 92;
  const maxDistance = Math.max(160, worldWidth - leftStart - rightEnd - 46);
  const platformOffset = Math.round(maxDistance * 0.45);

  return (
    <footer
      className="w-full relative select-none overflow-hidden shrink-0"
      aria-hidden="true"
    >
      {/* Dynamic World Viewport */}
      <div className="relative w-full h-24 sm:h-28 md:h-32 pointer-events-none">
        {/* ========================================================================= */}
        {/* LAYER 1: SKY (Background canvas layer)                                   */}
        {/* ========================================================================= */}
        <div data-layer="1-sky" className="absolute inset-0 pointer-events-none" />

        {/* ========================================================================= */}
        {/* LAYER 2: HORIZON CLOUDS ROW 1 (110s drift, top horizon lane)              */}
        {/* ========================================================================= */}
        <div
          data-layer="2-clouds-far"
          className="absolute inset-x-0 top-0 h-12 overflow-hidden pointer-events-none"
        >
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-far opacity-50"
            style={{ animationDelay: '-25s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-10 shrink-0">
              <div className="absolute top-1 left-[10%]">
                <PixelCloudFluffy size={42} />
              </div>
              <div className="absolute top-1.5 left-[46%]">
                <PixelCloudFluffy size={46} />
              </div>
              <div className="absolute top-1 left-[80%]">
                <PixelCloudFluffy size={40} />
              </div>
            </div>
            {/* Set 2 (Identical for seamless loop) */}
            <div className="w-1/2 relative h-10 shrink-0">
              <div className="absolute top-1 left-[10%]">
                <PixelCloudFluffy size={42} />
              </div>
              <div className="absolute top-1.5 left-[46%]">
                <PixelCloudFluffy size={46} />
              </div>
              <div className="absolute top-1 left-[80%]">
                <PixelCloudFluffy size={40} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 3: HORIZON CLOUDS ROW 2 (65s drift, lower horizon lane, clear of fort) */}
        {/* ========================================================================= */}
        <div
          data-layer="3-clouds-near"
          className="absolute left-0 right-44 sm:right-56 md:right-64 lg:right-76 top-11 sm:top-13 h-12 overflow-hidden pointer-events-none"
        >
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-near opacity-65"
            style={{ animationDelay: '-12s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-10 shrink-0">
              <div className="absolute top-1 left-[8%]">
                <PixelCloudFluffy size={38} />
              </div>
              <div className="absolute top-1.5 left-[30%]">
                <PixelCloudFluffy size={44} />
              </div>
              <div className="absolute top-1 left-[54%]">
                <PixelCloudFluffy size={40} />
              </div>
            </div>
            {/* Set 2 (Identical for seamless loop) */}
            <div className="w-1/2 relative h-10 shrink-0">
              <div className="absolute top-1 left-[8%]">
                <PixelCloudFluffy size={38} />
              </div>
              <div className="absolute top-1.5 left-[30%]">
                <PixelCloudFluffy size={44} />
              </div>
              <div className="absolute top-1 left-[54%]">
                <PixelCloudFluffy size={40} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 4: GROUND DECORATIONS (Hills, Grass Tufts, Sparkles, Flowers)     */}
        {/* ========================================================================= */}
        <div
          data-layer="4-ground-deco"
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
        >
          {/* Left Sparkles with desynchronized low-duty twinkle */}
          <div className="absolute bottom-12 sm:bottom-16 left-8 sm:left-14 lg:left-20 anim-sparkle-cycle">
            <PixelSparkle size={18} />
          </div>

          {/* Right Sparkles */}
          <div
            className="absolute bottom-12 sm:bottom-16 right-2 sm:right-16 lg:right-22 anim-sparkle-cycle"
            style={{ animationDelay: '-1.5s' }}
          >
            <PixelSparkle size={18} />
          </div>

          {/* Grass Tufts with subtle 2-frame alternate sway */}
          <div className="hidden lg:block absolute bottom-0 left-44 anim-grass-sway">
            <PixelGrassTuft size={26} variant={1} />
          </div>
          <div className="hidden lg:block absolute bottom-0 right-48 anim-grass-sway" style={{ animationDelay: '-1.5s' }}>
            <PixelGrassTuft size={26} variant={2} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 5: OBJECTS (Pipes, Blocks, Obstacles, Character, Monitor, Castle)    */}
        {/* ========================================================================= */}
        <div
          data-layer="5-objects"
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
        >

          {/* LEFT GROUND OBJECTS: Warp Pipe + Question Block + Brown Blocks + Critter + Flowers */}
          <div className="absolute bottom-0 left-2 sm:left-6 lg:left-10 flex items-end gap-1.5 sm:gap-2.5 z-10">
            {/* Daisy Wildflower & Grass to the left of the Warp pipe */}
            <div className="hidden sm:flex items-end gap-0.5 mb-0.5">
              <PixelFlower size={18} variant={1} />
              <PixelGrassTuft size={16} variant={2} />
            </div>

            {/* Classic Large Green Warp Pipe */}
            <div className="relative flex flex-col items-center">
              <div
                data-testid="ambient-pipe-coin"
                className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none anim-pipe-coin-peek"
                aria-hidden="true"
              >
                <PixelCoin size={15} />
              </div>
              <div className="anim-pipe-highlight">
                <PixelPipe className="w-[54px] h-[48px] sm:w-[68px] sm:h-[54px]" />
              </div>
            </div>

            {/* Grass tufts beside pipe */}
            <div className="hidden sm:block mb-0.5">
              <PixelGrassTuft size={16} variant={1} />
            </div>

            {/* Question block sitting on grass with 1 gold coin floating above it */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="anim-coin-idle mb-1">
                <PixelCoin size={16} />
              </div>
              <div className="anim-block-cycle world-block-highlight">
                <PixelQuestionBlock size={26} />
              </div>
            </div>

            {/* 2 Brown Brick Blocks sitting on the grass with Red Bug crawling on top */}
            <div className="hidden sm:flex flex-col items-center">
              {/* Red Bug crawling on top of the brown blocks */}
              <div className="-mb-0.5">
                <PixelBug size={18} className="anim-critter-crawl" />
              </div>
              {/* 2 Brown blocks side by side */}
              <div className="w-13 h-6 bg-[#B84418] border-2 border-[#102040] shadow-[1px_1px_0px_#102040] flex items-center justify-around px-0.5">
                <div className="w-5 h-full border-r border-[#102040] bg-[#D96836]/30" />
                <div className="w-5 h-full bg-[#D96836]/30" />
              </div>
            </div>

            {/* Wildflower beside brown blocks */}
            <div className="hidden sm:flex items-end mb-0.5">
              <PixelFlower size={16} variant={2} />
            </div>
          </div>

          {/* Running Character moving across the screen from corner to corner */}
          <div
            id="founder-ground-target"
            className={`absolute bottom-0 left-2 sm:left-6 lg:left-10 z-20 transition-opacity duration-150 ${
              isIntroActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <Founder
              size={44}
              initialPhase="idle"
              isPaused={isIntroActive}
              className="scale-95 sm:scale-100 origin-bottom"
              platformOffset={platformOffset}
              maxDistance={maxDistance}
            />
          </div>

          {/* MID-RIGHT GROUND OBJECT: Green Warp Pipe (Moved to the side away from the fort) */}
          <div className="absolute bottom-0 right-48 sm:right-60 md:right-72 lg:right-80 flex items-end gap-1 sm:gap-1.5 z-10 pointer-events-none">
            <div className="hidden sm:block mb-0.5">
              <PixelGrassTuft size={16} variant={1} />
            </div>
            <div className="flex flex-col items-center">
              <div className="anim-pipe-highlight">
                <PixelPipe className="w-[50px] h-[44px] sm:w-[60px] sm:h-[50px]" />
              </div>
            </div>
            <div className="hidden sm:flex items-end gap-0.5 mb-0.5">
              <PixelFlower size={16} variant={2} />
            </div>
          </div>

          {/* RIGHT GROUND OBJECTS: ? Block + Coins + Admin Monitor + Grass + Flowers (Fort courtyard, no pipe blocking) */}
          <div className="absolute bottom-0 right-2 sm:right-6 lg:right-10 flex items-end gap-1.5 sm:gap-2.5 z-10">
            {/* Question Block and Coins sitting on grass */}
            <div className="hidden md:flex items-end gap-1.5">
              <div className="flex flex-col items-center">
                <div className="anim-block-cycle world-block-highlight">
                  <PixelQuestionBlock size={26} />
                </div>
              </div>
              <div className="flex items-center gap-1 mb-0.5">
                <div className="anim-coin-idle">
                  <PixelCoin size={16} />
                </div>
                <div className="anim-coin-idle" style={{ animationDelay: '-0.4s' }}>
                  <PixelCoin size={16} />
                </div>
              </div>
            </div>

            {/* Right Admin Desk Monitor (Reacts to [data-cta="admin"]) */}
            <div className="hidden lg:block world-admin-monitor mb-0.5">
              <PixelMonitor size={34} />
            </div>

            {/* Daisy Wildflower & Grass along Fort Base */}
            <div className="flex items-end gap-1 mb-0.5">
              <PixelGrassTuft size={16} variant={1} />
              <PixelFlower size={18} variant={1} />
              <PixelGrassTuft size={16} variant={2} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 6: CONTINUOUS MARIO BRICK GROUND ACROSS THE BOTTOM                  */}
      {/* Flat level top grass walking surface with classic terracotta brick tiles  */}
      {/* ========================================================================= */}
      <div data-layer="6-ground" className="w-full relative z-10 shrink-0">
        <PixelBrickTile hasGrass={true} className="h-8 sm:h-9" />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 7: BOTTOM METADATA COPYRIGHT BAR (Always Fully Inside Viewport)     */}
      {/* ========================================================================= */}
      <div className="bg-[#102040] py-1 sm:py-1.5 px-4 text-center border-t-2 border-[#FFCC00] shrink-0 z-20 relative">
        <p className="font-pixel text-[8px] sm:text-[9px] text-[#FFCC00] tracking-wider leading-none">
          ★ &nbsp; WORLD 01 · STARTUPOLY © 2026 &nbsp; ★
        </p>
      </div>
    </footer>
  );
};
