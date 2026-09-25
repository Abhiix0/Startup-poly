import React from 'react';
import {
  PixelBrickTile,
  PixelCloudFluffy,
  PixelPipe,
} from '../../ui';
import {
  PixelCoin,
  PixelHill,
  PixelQuestionBlock,
  PixelBug,
  PixelGrassTuft,
  PixelFlower,
  PixelSparkle,
  PixelMonitor,
} from '../../ui/pixel';
import { Founder } from './Founder';

export interface PixelWorldProps {
  isIntroActive?: boolean;
}

export const PixelWorld: React.FC<PixelWorldProps> = ({ isIntroActive = false }) => {
  return (
    <footer
      className="w-full relative select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Dynamic World Viewport */}
      <div className="relative w-full h-24 sm:h-28 md:h-34 pointer-events-none">
        {/* ========================================================================= */}
        {/* LAYER 1: SKY (Background canvas layer)                                   */}
        {/* ========================================================================= */}
        <div data-layer="1-sky" className="absolute inset-0 pointer-events-none" />

        {/* ========================================================================= */}
        {/* LAYER 2: FAR CLOUDS (110s drift, small, 40-50% opacity)                  */}
        {/* ========================================================================= */}
        <div
          data-layer="2-clouds-far"
          className="absolute inset-x-0 top-0 h-20 overflow-hidden pointer-events-none"
        >
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-far opacity-45"
            style={{ animationDelay: '-25s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-16 shrink-0">
              <div className="absolute top-1 left-[10%]">
                <PixelCloudFluffy size={42} />
              </div>
              <div className="absolute top-4 left-[45%]">
                <PixelCloudFluffy size={48} />
              </div>
              <div className="absolute top-1 left-[80%]">
                <PixelCloudFluffy size={38} />
              </div>
            </div>
            {/* Set 2 (Identical for seamless loop) */}
            <div className="w-1/2 relative h-16 shrink-0">
              <div className="absolute top-1 left-[10%]">
                <PixelCloudFluffy size={42} />
              </div>
              <div className="absolute top-4 left-[45%]">
                <PixelCloudFluffy size={48} />
              </div>
              <div className="absolute top-1 left-[80%]">
                <PixelCloudFluffy size={38} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 3: NEAR CLOUDS (45s drift, larger, 80-90% opacity)                  */}
        {/* ========================================================================= */}
        <div
          data-layer="3-clouds-near"
          className="absolute inset-x-0 top-0 h-22 overflow-hidden pointer-events-none"
        >
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-near opacity-85"
            style={{ animationDelay: '-12s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-20 shrink-0">
              <div className="absolute top-2 left-[5%]">
                <PixelCloudFluffy size={64} />
              </div>
              <div className="absolute top-5 left-[35%]">
                <PixelCloudFluffy size={74} />
              </div>
              <div className="absolute top-3 left-[72%]">
                <PixelCloudFluffy size={58} />
              </div>
            </div>
            {/* Set 2 (Identical for seamless loop) */}
            <div className="w-1/2 relative h-20 shrink-0">
              <div className="absolute top-2 left-[5%]">
                <PixelCloudFluffy size={64} />
              </div>
              <div className="absolute top-5 left-[35%]">
                <PixelCloudFluffy size={74} />
              </div>
              <div className="absolute top-3 left-[72%]">
                <PixelCloudFluffy size={58} />
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
        {/* LAYER 5: OBJECTS (Pipes, Question Blocks, Monitor, Critter, Poly Slot)   */}
        {/* ========================================================================= */}
        <div
          data-layer="5-objects"
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
        >
          {/* LEFT GROUND OBJECTS: Daisy Flower & Grass + Warp Pipe + Grass + Brick Podium + Orange Flower */}
          <div className="absolute bottom-0 left-2 sm:left-6 lg:left-10 flex items-end gap-1.5 sm:gap-2.5">
            {/* Leftmost Daisy Flower & Grass tuft */}
            <div className="hidden sm:flex items-end gap-0.5 mb-0.5">
              <PixelFlower size={20} variant={1} />
              <PixelGrassTuft size={18} variant={1} />
            </div>

            {/* Classic Large Green Warp Pipe */}
            <div className="relative flex flex-col items-center">
              {/* Phase 4: Rare ambient coin peek */}
              <div
                data-testid="ambient-pipe-coin"
                className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none anim-pipe-coin-peek"
                aria-hidden="true"
              >
                <PixelCoin size={14} />
              </div>
              <div className="anim-pipe-highlight">
                <PixelPipe className="w-[56px] h-[50px] sm:w-[68px] sm:h-[58px]" />
              </div>
            </div>

            {/* Grass tuft between pipe & brick podium */}
            <div className="hidden sm:block mb-0.5">
              <PixelGrassTuft size={18} variant={2} />
            </div>

            {/* Stepped Brick Podium with ? Block & Bug */}
            <div className="hidden sm:flex items-end gap-1.5">
              {/* Coin hovering */}
              <div className="flex flex-col items-center -mb-1">
                <div className="anim-coin-idle">
                  <PixelCoin size={18} />
                </div>
                {/* Floating Question Block */}
                <div className="anim-block-cycle world-block-highlight">
                  <PixelQuestionBlock size={28} />
                </div>
              </div>

              {/* Stepped Brick Block with Walking Bug */}
              <div className="flex flex-col items-center">
                <PixelBug size={24} className="mb-0.5 anim-critter-crawl" />
                <div className="flex">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#B84418] border-2 border-[#102040]" />
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#B84418] border-2 border-[#102040]" />
                </div>
              </div>
            </div>

            {/* Orange Wildflower beside Brick podium */}
            <div className="hidden sm:block mb-0.5">
              <PixelFlower size={20} variant={2} />
            </div>
          </div>

          {/* RIGHT GROUND OBJECTS: ? Block + Coins + Poly + CRT Monitor + Grass + Pipe + Daisy + Grass */}
          <div className="absolute bottom-0 right-2 sm:right-6 lg:right-10 flex items-end gap-1.5 sm:gap-3">
            {/* Floating Question Block and Coins */}
            <div className="hidden md:flex items-end gap-1.5">
              <div className="flex flex-col items-center">
                <div className="anim-block-cycle world-block-highlight">
                  <PixelQuestionBlock size={28} />
                </div>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <div className="anim-coin-idle">
                  <PixelCoin size={18} />
                </div>
                <div className="anim-coin-idle" style={{ animationDelay: '-0.4s' }}>
                  <PixelCoin size={18} />
                </div>
              </div>
            </div>

            {/* Founder Mascot with walk-in, idle, bubble & CTA reactions */}
            <div
              className={`relative z-20 transition-opacity duration-150 ${
                isIntroActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <Founder size={46} className="scale-90 sm:scale-100 origin-bottom" />
            </div>

            {/* Right Admin Desk Monitor (Reacts to [data-cta="admin"]) */}
            <div className="hidden lg:block world-admin-monitor mb-1">
              <PixelMonitor size={36} />
            </div>

            {/* Grass tuft beside right warp pipe */}
            <div className="hidden sm:block mb-0.5">
              <PixelGrassTuft size={18} variant={1} />
            </div>

            {/* Right Large Green Warp Pipe */}
            <div className="flex flex-col items-center">
              <div className="anim-pipe-highlight">
                <PixelPipe className="w-[56px] h-[50px] sm:w-[68px] sm:h-[54px]" />
              </div>
            </div>

            {/* Daisy Wildflower & Grass to the right of the Warp pipe */}
            <div className="hidden sm:flex items-end gap-0.5 mb-0.5">
              <PixelFlower size={20} variant={1} />
              <PixelGrassTuft size={18} variant={2} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 6: GROUND (Full-width pixel brick tile + copyright metadata bar)    */}
      {/* ========================================================================= */}
      <div data-layer="6-ground" className="w-full relative z-10">
        <PixelBrickTile hasGrass={true} className="h-7 sm:h-8 w-full" />
        <div className="bg-[#102040] pt-1.5 sm:pt-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] px-4 text-center border-t-2 border-[#FFCC00]">
          <p className="font-pixel text-[8px] sm:text-[9px] text-[#FFCC00] tracking-wider">
            ★ &nbsp; WORLD 01 · STARTUPOLY © 2026 &nbsp; ★
          </p>
        </div>
      </div>
    </footer>
  );
};
