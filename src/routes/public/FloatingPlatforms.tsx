import React from 'react';
import { PixelQuestionBlock, PixelCoin, PixelGrassTuft } from '../../ui/pixel';

export const FloatingPlatforms: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================================= */}
      {/* UPPER-LEFT FLOATING ISLAND                                             */}
      {/* ======================================================================= */}
      <div className="hidden sm:block absolute top-8 sm:top-12 md:top-16 left-3 sm:left-6 md:left-10 lg:left-14">
        {/* Floating Island Group */}
        <div className="relative flex flex-col items-center">
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
              {/* Grass drops */}
              <div className="absolute top-2 left-2 w-2 h-1.5 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
              <div className="absolute top-2 left-8 w-2.5 h-2 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
              <div className="absolute top-2 right-4 w-2 h-1.5 bg-[#22B14C] border-b-2 border-x-2 border-[#102040]" />
            </div>

            {/* Earthy Brick Tier */}
            <div className="h-6 w-28 sm:w-32 bg-[#B84418] border-2 border-[#102040] relative flex items-center justify-center">
              {/* Brick Mortar Lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none opacity-40">
                <div className="w-full h-0.5 bg-[#102040]" />
                <div className="w-full h-0.5 bg-[#102040]" />
              </div>
              {/* Dirt speckles */}
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
      {/* UPPER-RIGHT FLOATING ISLAND                                            */}
      {/* ======================================================================= */}
      <div className="hidden sm:block absolute top-10 sm:top-14 md:top-20 right-3 sm:right-6 md:right-10 lg:right-14">
        <div className="relative flex flex-col items-center">
          {/* Top Row: 3 Gold Coins in a Row + Winged Flying Critter */}
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
    </div>
  );
};
