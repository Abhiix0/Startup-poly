import React from 'react';
import { PixelQuestionBlock, PixelCoin, PixelGrassTuft, PixelSparkle } from '../../ui/pixel';

export const FloatingPlatforms: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================================= */}
      {/* UPPER-LEFT FLOATING SKY ISLAND                                          */}
      {/* Anchored with a soft cloud vapor base and gentle floating sway          */}
      {/* ======================================================================= */}
      <div className="hidden sm:block absolute top-7 sm:top-10 md:top-14 left-3 sm:left-6 md:left-8 lg:left-12">
        {/* Floating Island Group with Combined Bob & Sway */}
        <div className="relative flex flex-col items-center anim-island-float-left">
          {/* Subtle magical sparkle above ? block */}
          <div className="absolute -top-3 -left-1 anim-sparkle-cycle pointer-events-none">
            <PixelSparkle size={14} />
          </div>

          {/* Top Row: Coin above ? Block + Wildflower */}
          <div className="w-full flex items-end justify-between px-2 mb-1">
            <div className="flex flex-col items-center">
              <div className="anim-coin-idle -mb-1">
                <PixelCoin size={20} />
              </div>
              <div className="anim-block-cycle">
                <PixelQuestionBlock size={32} />
              </div>
            </div>
            <div className="mb-0.5">
              <PixelGrassTuft size={22} variant={1} />
            </div>
          </div>

          {/* Grassy Brick Platform Base (Chunky 8-bit platform) */}
          <div className="relative">
            {/* Top Grass Fringe */}
            <div className="h-2 w-28 sm:w-32 bg-[#22B14C] border-t-2 border-x-2 border-[#102040] relative">
              <div className="absolute top-2 left-2 w-2 h-1.5 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
              <div className="absolute top-2 left-8 w-2.5 h-2 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
              <div className="absolute top-2 right-4 w-2 h-1.5 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
            </div>

            {/* Earthy Brick Tier */}
            <div className="h-6 w-28 sm:w-32 bg-[#B84418] border-2 border-[#102040] relative flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none opacity-40">
                <div className="w-full h-0.5 bg-[#102040]" />
                <div className="w-full h-0.5 bg-[#102040]" />
              </div>
              <div className="w-1.5 h-1.5 bg-[#8B2500] absolute top-1.5 left-4" />
              <div className="w-2 h-1.5 bg-[#FF8C00] absolute bottom-1 right-6" />
              <div className="w-1.5 h-1.5 bg-[#8B2500] absolute top-2 right-10" />
            </div>

            {/* Bottom Hanging Dirt Roots */}
            <div className="flex justify-center gap-4">
              <div className="w-2.5 h-2.5 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
              <div className="w-3.5 h-3 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
              <div className="w-2 h-2 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* UPPER-RIGHT FLOATING SKY ISLAND                                         */}
      {/* Anchored with a soft cloud vapor base and gentle floating sway          */}
      {/* ======================================================================= */}
      <div className="hidden sm:block absolute top-9 sm:top-12 md:top-16 right-3 sm:right-6 md:right-8 lg:right-12">
        <div className="relative flex flex-col items-center anim-island-float-right">
          {/* Subtle sparkle over gold coins */}
          <div className="absolute -top-3.5 right-2 anim-sparkle-cycle pointer-events-none" style={{ animationDelay: '-1.8s' }}>
            <PixelSparkle size={14} />
          </div>

          {/* Top Row: 3 Gold Coins in a Row */}
          <div className="flex items-center gap-2 mb-1.5 px-2">
            <div className="anim-coin-idle">
              <PixelCoin size={22} />
            </div>
            <div className="anim-coin-idle" style={{ animationDelay: '-0.3s' }}>
              <PixelCoin size={22} />
            </div>
            <div className="anim-coin-idle" style={{ animationDelay: '-0.6s' }}>
              <PixelCoin size={22} />
            </div>
          </div>

          {/* Winged Red Flying Critter (Beside Platform) */}
          <div className="absolute -left-10 top-4 anim-winged-hover">
            <div className="relative flex items-center justify-center">
              {/* Wings */}
              <div className="absolute -top-2 left-0 w-3 h-2 bg-white border border-[#102040] rounded-t-sm -rotate-12" />
              <div className="absolute -top-2 right-0 w-3 h-2 bg-white border border-[#102040] rounded-t-sm rotate-12" />
              {/* Body */}
              <div className="w-6 h-6 bg-[#D32F2F] border-2 border-[#102040] rounded-sm flex flex-col items-center justify-center">
                {/* Eyes */}
                <div className="flex gap-1">
                  <div className="w-1.5 h-2 bg-white flex items-end">
                    <div className="w-1 h-1 bg-[#102040]" />
                  </div>
                  <div className="w-1.5 h-2 bg-white flex items-end">
                    <div className="w-1 h-1 bg-[#102040]" />
                  </div>
                </div>
                {/* Yellow feet */}
                <div className="flex gap-1.5 -mb-2 mt-0.5">
                  <div className="w-1.5 h-1 bg-[#FFCC00] border border-[#102040]" />
                  <div className="w-1.5 h-1 bg-[#FFCC00] border border-[#102040]" />
                </div>
              </div>
            </div>
          </div>

          {/* Grassy Brick Platform Base */}
          <div className="relative">
            {/* Top Grass Fringe */}
            <div className="h-2 w-32 sm:w-36 bg-[#22B14C] border-t-2 border-x-2 border-[#102040] relative">
              <div className="absolute top-2 left-3 w-2 h-1.5 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
              <div className="absolute top-2 right-5 w-2 h-2 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
            </div>

            {/* Earthy Brick Tier */}
            <div className="h-6 w-32 sm:w-36 bg-[#B84418] border-2 border-[#102040] relative flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none opacity-40">
                <div className="w-full h-0.5 bg-[#102040]" />
                <div className="w-full h-0.5 bg-[#102040]" />
              </div>
              <div className="w-2 h-1.5 bg-[#FF8C00] absolute top-1.5 left-6" />
              <div className="w-1.5 h-1.5 bg-[#8B2500] absolute bottom-1.5 right-8" />
            </div>

            {/* Bottom Hanging Dirt Roots */}
            <div className="flex justify-center gap-5">
              <div className="w-3 h-2 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
              <div className="w-2.5 h-3 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MID-LEFT RETRO SKY PROP: Floating ? Block & Hovering Coin               */}
      {/* Adds authentic Mario flavor into the mid-left open space               */}
      {/* ======================================================================= */}
      <div className="hidden md:block absolute top-52 lg:top-56 left-4 lg:left-10 anim-island-float-left pointer-events-none z-0">
        <div className="flex flex-col items-center">
          <div className="anim-coin-idle mb-1">
            <PixelCoin size={18} />
          </div>
          <div className="anim-block-cycle world-block-highlight">
            <PixelQuestionBlock size={28} />
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MID-RIGHT RETRO SKY PROP: Floating Brick Pair & Coin                    */}
      {/* Adds authentic Mario flavor into the mid-right open space              */}
      {/* ======================================================================= */}
      <div className="hidden md:block absolute top-56 lg:top-60 right-6 lg:right-12 anim-island-float-right pointer-events-none z-0" style={{ animationDelay: '-1.5s' }}>
        <div className="flex flex-col items-center">
          <div className="anim-coin-idle mb-1" style={{ animationDelay: '-0.5s' }}>
            <PixelCoin size={18} />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-6 h-6 bg-[#B84418] border-2 border-[#102040] shadow-[1px_1px_0px_#102040] flex items-center justify-center">
              <div className="w-4 h-1 bg-[#8B2500]" />
            </div>
            <div className="anim-block-cycle world-block-highlight">
              <PixelQuestionBlock size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
