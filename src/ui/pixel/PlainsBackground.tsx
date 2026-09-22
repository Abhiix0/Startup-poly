import React from 'react';
import { PixelCloudFluffy } from './PixelCloudFluffy';
import { PixelHill } from './PixelHill';
import { PixelQuestionBlock } from './PixelQuestionBlock';
import { PixelCoin } from './PixelCoin';
import { PixelSparkle } from './PixelSparkle';
import { PixelGrassTuft } from './PixelGrassTuft';
import { PixelFlower } from './PixelFlower';
import { PixelPipe } from './PixelPipe';
import { PixelBrickTile } from './PixelBrickTile';

export interface PlainsBackgroundProps {
  children: React.ReactNode;
}

export const PlainsBackground: React.FC<PlainsBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between relative overflow-hidden select-none anim-scene-transition">
      {/* ======================================================================= */}
      {/* LAYER 1: Distant Background Hills & Misty Castle Silhouette            */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Distant Rolling Hills SVG */}
        <svg
          viewBox="0 0 1440 280"
          className="absolute inset-x-0 bottom-8 w-full h-44 sm:h-64 object-cover object-bottom opacity-70"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="plainsHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A80E8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="plainsGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#15803D" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path
            d="M 0,280 L 0,170 Q 160,90 320,165 T 640,130 T 960,170 T 1280,125 T 1440,160 L 1440,280 Z"
            fill="url(#plainsHillsGrad)"
          />
          <path
            d="M 0,280 L 0,200 Q 140,120 280,195 T 560,150 T 840,205 T 1120,160 Q 1280,215 1440,230 L 1440,280 Z"
            fill="url(#plainsGreenGrad)"
          />
        </svg>

        {/* Misty Distant Castle on Left (from reference image) */}
        <div className="hidden sm:block absolute bottom-14 sm:bottom-20 left-4 sm:left-12 opacity-30 z-0">
          <div className="relative flex flex-col items-center">
            {/* Center tower with flag */}
            <div className="w-1 h-6 bg-[#102040]" />
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[18px] border-b-[#334155]" />
            <div className="w-8 h-20 bg-[#334155] border-x-2 border-[#102040] flex flex-col items-center pt-2 gap-1.5">
              <div className="w-2.5 h-4 bg-[#102040] rounded-t-sm" />
              <div className="w-2 h-3 bg-[#102040] rounded-t-sm" />
            </div>
            {/* Flanking turrets */}
            <div className="w-24 h-12 bg-[#334155] border-t-2 border-x-2 border-[#102040] flex justify-between items-start -mt-12 px-1">
              <div className="w-4 h-6 bg-[#334155] border-x-2 border-[#102040] -mt-4" />
              <div className="w-5 h-8 bg-[#102040] rounded-t-sm self-end" />
              <div className="w-4 h-6 bg-[#334155] border-x-2 border-[#102040] -mt-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 2: Sky & Drifting Clouds Layer                                    */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-4 left-[6%] opacity-70">
          <PixelCloudFluffy size={58} />
        </div>
        <div className="absolute top-10 right-[8%] opacity-80">
          <PixelCloudFluffy size={78} />
        </div>
        <div className="absolute top-20 left-[45%] opacity-50">
          <PixelCloudFluffy size={48} />
        </div>
        <div className="hidden sm:block absolute top-64 right-[16%] opacity-60">
          <PixelCloudFluffy size={62} />
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 3: Upper Floating Platforms (Question Blocks & Coins)             */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* UPPER-LEFT FLOATING ISLAND: 3 Coins + Platform + ? Block Below */}
        <div className="hidden sm:block absolute top-14 sm:top-18 left-4 sm:left-10 lg:left-16">
          <div className="relative flex flex-col items-center">
            {/* 3 Gold Coins hovering in a row above platform */}
            <div className="flex items-center gap-1.5 mb-1 px-2">
              <div className="anim-coin-idle">
                <PixelCoin size={20} />
              </div>
              <div className="anim-coin-idle" style={{ animationDelay: '-0.3s' }}>
                <PixelCoin size={20} />
              </div>
              <div className="anim-coin-idle" style={{ animationDelay: '-0.6s' }}>
                <PixelCoin size={20} />
              </div>
            </div>

            {/* Grassy Brick Platform Base */}
            <div className="relative">
              <div className="h-2 w-28 bg-[#22B14C] border-t-2 border-x-2 border-[#102040]" />
              <div className="h-5 w-28 bg-[#B84418] border-2 border-[#102040] relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#8B2500] absolute top-1 left-3" />
                <div className="w-2 h-1 bg-[#FF8C00] absolute bottom-1 right-4" />
              </div>
              <div className="flex justify-center gap-3">
                <div className="w-2.5 h-2 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
                <div className="w-3 h-2.5 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
              </div>
            </div>

            {/* Floating Question Block Below Platform */}
            <div className="mt-12 anim-block-cycle">
              <PixelQuestionBlock size={32} />
            </div>
          </div>
        </div>

        {/* MID-RIGHT FLOATING ISLAND: 1 Coin + Platform + ? Block Below */}
        <div className="hidden sm:block absolute top-36 sm:top-44 right-4 sm:right-10 lg:right-16">
          <div className="relative flex flex-col items-center">
            {/* 1 Gold Coin hovering */}
            <div className="anim-coin-idle mb-1">
              <PixelCoin size={22} />
            </div>

            {/* Grassy Brick Platform Base */}
            <div className="relative">
              <div className="h-2 w-24 bg-[#22B14C] border-t-2 border-x-2 border-[#102040]" />
              <div className="h-5 w-24 bg-[#B84418] border-2 border-[#102040] relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#8B2500] absolute top-1 left-2" />
                <div className="w-2 h-1 bg-[#FF8C00] absolute bottom-1 right-3" />
              </div>
              <div className="flex justify-center gap-3">
                <div className="w-2 h-2 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
                <div className="w-2.5 h-2 bg-[#8B2500] border-b-2 border-x-2 border-[#102040]" />
              </div>
            </div>

            {/* Floating Question Block Below */}
            <div className="mt-8 anim-block-cycle" style={{ animationDelay: '-2s' }}>
              <PixelQuestionBlock size={32} />
            </div>
          </div>
        </div>

        {/* Mobile-only ? block upper right */}
        <div className="sm:hidden absolute top-20 right-4 anim-block-cycle">
          <PixelQuestionBlock size={28} />
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 4: Main Foreground Content (Signboard Mounted onto the world)     */}
      {/* ======================================================================= */}
      <div className="relative z-20 flex-1 flex flex-col justify-between">
        {children}
      </div>

      {/* ======================================================================= */}
      {/* LAYER 5: Ground Scene Layer & Full-Width Brick Base                     */}
      {/* ======================================================================= */}
      <div className="relative z-30 w-full">
        {/* Ground Objects Layer resting directly on top of the grass turf */}
        <div className="absolute inset-x-0 bottom-full pointer-events-none z-10">
          {/* Left Ground Objects: Daisy Flower + Grass + Warp Pipe + Grass + Orange Flower */}
          <div className="absolute bottom-0 left-2 sm:left-6 lg:left-10 flex items-end gap-1 sm:gap-2">
            {/* Flower & Grass to the left of the pipe */}
            <div className="flex items-end gap-0.5 mb-0.5">
              <PixelFlower size={20} variant={1} />
              <PixelGrassTuft size={18} variant={1} />
            </div>

            {/* Classic Green Warp Pipe */}
            <div className="flex flex-col items-center">
              <div className="anim-pipe-highlight">
                <PixelPipe width={60} height={52} />
              </div>
            </div>

            {/* Grass tuft & orange wildflower to the right of the pipe */}
            <div className="flex items-end gap-0.5 mb-0.5">
              <PixelGrassTuft size={18} variant={2} />
              <PixelFlower size={18} variant={2} />
            </div>
          </div>

          {/* Scattered Wildflowers & Grass Tufts along middle ground (left of center) */}
          <div className="hidden sm:flex absolute bottom-0 left-[20%] lg:left-[24%] items-end gap-1 mb-0.5">
            <PixelGrassTuft size={18} variant={1} />
            <PixelFlower size={20} variant={1} />
            <PixelGrassTuft size={16} variant={2} />
          </div>

          <div className="hidden md:flex absolute bottom-0 left-[34%] items-end gap-1 mb-0.5">
            <PixelFlower size={18} variant={2} />
            <PixelGrassTuft size={18} variant={1} />
          </div>

          {/* Scattered Wildflowers & Grass Tufts along middle ground (right of center) */}
          <div className="hidden md:flex absolute bottom-0 right-[34%] items-end gap-1 mb-0.5">
            <PixelGrassTuft size={18} variant={2} />
            <PixelFlower size={18} variant={1} />
          </div>

          <div className="hidden sm:flex absolute bottom-0 right-[20%] lg:right-[24%] items-end gap-1 mb-0.5">
            <PixelFlower size={20} variant={2} />
            <PixelGrassTuft size={18} variant={1} />
            <PixelFlower size={16} variant={1} />
          </div>

          {/* Right Ground Objects: Grass & Flowers cluster */}
          <div className="absolute bottom-0 right-2 sm:right-6 lg:right-10 flex items-end gap-1 sm:gap-1.5">
            <div className="flex items-end gap-0.5 mb-0.5">
              <PixelGrassTuft size={18} variant={1} />
              <PixelFlower size={20} variant={1} />
              <PixelGrassTuft size={18} variant={2} />
              <PixelFlower size={18} variant={2} />
            </div>
          </div>
        </div>

        {/* Full-width Pixel Brick Turf Tile */}
        <PixelBrickTile hasGrass={true} className="h-7 sm:h-8 w-full" />
        <div className="bg-[#102040] pt-1.5 sm:pt-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] px-4 text-center border-t-2 border-[#FFCC00]">
          <p className="font-pixel text-[8px] sm:text-[9px] text-[#FFCC00] tracking-wider">
            ★ &nbsp; STARTUPOLY © 2026 &nbsp; ★
          </p>
        </div>
      </div>
    </div>
  );
};

