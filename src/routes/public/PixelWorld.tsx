import React, { useRef } from 'react';
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
  PixelSparkle,
  PixelMonitor,
} from '../../ui/pixel';
import { usePointerParallax } from '../../lib/usePointerParallax';
import { Founder } from './Founder';

export const PixelWorld: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Enable subtle pointer parallax on fine-pointer desktop devices
  usePointerParallax(containerRef);

  return (
    <footer
      ref={containerRef}
      className="w-full relative select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Dynamic World Viewport */}
      <div className="relative w-full h-24 sm:h-28 md:h-36 pointer-events-none">
        {/* ========================================================================= */}
        {/* LAYER 1: SKY (Background canvas layer)                                   */}
        {/* ========================================================================= */}
        <div data-layer="1-sky" className="absolute inset-0 pointer-events-none" />

        {/* ========================================================================= */}
        {/* LAYER 2: FAR CLOUDS (110s drift, small, 40-50% opacity, parallax depth 1) */}
        {/* ========================================================================= */}
        <div
          data-layer="2-clouds-far"
          className="absolute inset-x-0 top-0 h-24 overflow-hidden pointer-events-none"
          style={{
            transform: 'translate3d(calc(var(--px, 0) * 2px), calc(var(--py, 0) * 1px), 0)',
          }}
        >
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-far opacity-45"
            style={{ animationDelay: '-25s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-20 shrink-0">
              <div className="absolute top-2 left-[10%]">
                <PixelCloudFluffy size={44} />
              </div>
              <div className="absolute top-6 left-[45%]">
                <PixelCloudFluffy size={48} />
              </div>
              <div className="absolute top-1 left-[80%]">
                <PixelCloudFluffy size={40} />
              </div>
            </div>
            {/* Set 2 (Identical for seamless loop) */}
            <div className="w-1/2 relative h-20 shrink-0">
              <div className="absolute top-2 left-[10%]">
                <PixelCloudFluffy size={44} />
              </div>
              <div className="absolute top-6 left-[45%]">
                <PixelCloudFluffy size={48} />
              </div>
              <div className="absolute top-1 left-[80%]">
                <PixelCloudFluffy size={40} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 3: NEAR CLOUDS (45s drift, larger, 80-90% opacity, parallax depth 2)*/}
        {/* ========================================================================= */}
        <div
          data-layer="3-clouds-near"
          className="absolute inset-x-0 top-0 h-24 overflow-hidden pointer-events-none"
          style={{
            transform: 'translate3d(calc(var(--px, 0) * 4px), calc(var(--py, 0) * 2px), 0)',
          }}
        >
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-near opacity-85"
            style={{ animationDelay: '-12s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-24 shrink-0">
              <div className="absolute top-3 left-[5%]">
                <PixelCloudFluffy size={68} />
              </div>
              <div className="absolute top-8 left-[35%]">
                <PixelCloudFluffy size={76} />
              </div>
              <div className="absolute top-4 left-[72%]">
                <PixelCloudFluffy size={60} />
              </div>
            </div>
            {/* Set 2 (Identical for seamless loop) */}
            <div className="w-1/2 relative h-24 shrink-0">
              <div className="absolute top-3 left-[5%]">
                <PixelCloudFluffy size={68} />
              </div>
              <div className="absolute top-8 left-[35%]">
                <PixelCloudFluffy size={76} />
              </div>
              <div className="absolute top-4 left-[72%]">
                <PixelCloudFluffy size={60} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 4: GROUND DECORATIONS (Hills, Grass Tufts, Sparkles)               */}
        {/* ========================================================================= */}
        <div
          data-layer="4-ground-deco"
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
          style={{
            transform: 'translate3d(calc(var(--px, 0) * 3px), calc(var(--py, 0) * 1px), 0)',
          }}
        >
          {/* Left Hill */}
          <div className="hidden md:block absolute bottom-0 left-2 lg:left-6">
            <PixelHill size={118} />
          </div>

          {/* Left Sparkles with desynchronized low-duty twinkle */}
          <div className="hidden md:block absolute bottom-18 left-14 lg:left-20 anim-sparkle-cycle">
            <PixelSparkle size={16} />
          </div>
          <div
            className="hidden md:block absolute bottom-12 left-2 anim-sparkle-cycle"
            style={{ animationDelay: '-3s' }}
          >
            <PixelSparkle size={14} />
          </div>

          {/* Right Hill */}
          <div className="hidden md:block absolute bottom-0 right-2 lg:right-6">
            <PixelHill size={118} />
          </div>

          {/* Right Sparkles */}
          <div
            className="hidden md:block absolute bottom-18 right-16 lg:right-22 anim-sparkle-cycle"
            style={{ animationDelay: '-1.5s' }}
          >
            <PixelSparkle size={16} />
          </div>
          <div
            className="hidden md:block absolute bottom-10 right-2 anim-sparkle-cycle"
            style={{ animationDelay: '-4.5s' }}
          >
            <PixelSparkle size={14} />
          </div>

          {/* Grass Tufts with subtle 2-frame alternate sway */}
          <div className="hidden lg:block absolute bottom-0 left-40 anim-grass-sway">
            <PixelGrassTuft size={20} variant={1} />
          </div>
          <div className="hidden lg:block absolute bottom-0 right-44 anim-grass-sway" style={{ animationDelay: '-1.5s' }}>
            <PixelGrassTuft size={20} variant={2} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 5: OBJECTS (Pipes, Question Blocks, Monitor, Critter, Poly Slot)   */}
        {/* ========================================================================= */}
        <div
          data-layer="5-objects"
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
          style={{
            transform: 'translate3d(calc(var(--px, 0) * 5px), calc(var(--py, 0) * 2px), 0)',
          }}
        >
          {/* Left Pipe with Popping Coins */}
          <div className="hidden md:flex absolute bottom-0 left-24 lg:left-32 flex-col items-center">
            <div className="flex gap-1 -mb-1 anim-coin-idle world-join-coin-pop">
              <PixelCoin size={20} />
              <PixelCoin size={22} />
            </div>
            <div className="anim-pipe-highlight">
              <PixelPipe width={52} height={34} />
            </div>
          </div>

          {/* Left Floating Question Block on Bricks + Original Critter Bug */}
          <div className="hidden lg:block absolute bottom-16 left-48 anim-block-cycle world-block-highlight">
            <PixelQuestionBlock size={30} />
          </div>
          <div className="hidden lg:flex absolute bottom-0 left-52 flex-col items-center">
            <PixelBug size={26} className="mb-0.5" />
            <div className="flex">
              <div className="w-7 h-7 bg-[#B84418] border-2 border-[#102040]" />
              <div className="w-7 h-7 bg-[#B84418] border-2 border-[#102040]" />
            </div>
          </div>

          {/* Right Floating Question Block */}
          <div
            className="hidden md:block absolute bottom-16 right-28 lg:right-36 anim-block-cycle world-block-highlight"
            style={{ animationDelay: '-4s' }}
          >
            <PixelQuestionBlock size={30} />
          </div>

          {/* Right Admin Desk Monitor (Reacts to [data-cta="admin"]) */}
          <div className="hidden lg:block absolute bottom-0 right-60 world-admin-monitor">
            <PixelMonitor size={34} />
          </div>

          {/* Founder Mascot "Poly" with walk-in, idle, bubble & CTA reactions */}
          <div className="hidden sm:block absolute bottom-0 right-10 lg:right-20">
            <Founder size={46} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 6: GROUND (Full-width pixel brick tile + copyright metadata bar)    */}
      {/* ========================================================================= */}
      <div data-layer="6-ground" className="w-full relative z-10">
        <PixelBrickTile hasGrass={true} className="h-8 sm:h-10 w-full" />
        <div className="bg-[#102040] pt-2.5 sm:pt-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] px-4 text-center border-t-2 border-[#FFCC00]">
          <p className="font-pixel text-[8px] sm:text-[10px] text-[#FFCC00] tracking-wider">
            STARTUPOLY © 2026
          </p>
        </div>
      </div>
    </footer>
  );
};
