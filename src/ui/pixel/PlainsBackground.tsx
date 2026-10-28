import React from 'react';
import { PixelCloudFluffy } from './PixelCloudFluffy';
import { PixelQuestionBlock } from './PixelQuestionBlock';
import { PixelCoin } from './PixelCoin';
import { PixelGrassTuft } from './PixelGrassTuft';
import { PixelFlower } from './PixelFlower';
import { PixelPipe } from './PixelPipe';
import { PixelBrickTile } from './PixelBrickTile';

export interface PlainsBackgroundProps {
  children: React.ReactNode;
}

export const PlainsBackground: React.FC<PlainsBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen nes-sky-gradient flex flex-col justify-between relative overflow-hidden select-none anim-scene-transition">
      {/* ======================================================================= */}
      {/* LAYER 1: Distant Background Hills (Matching Landing Page Panorama)       */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        {/* Layered Mountain Panorama Aligned to Ground Baseline */}
        <svg
          viewBox="0 0 1440 280"
          className="absolute inset-x-0 bottom-7 sm:bottom-8 w-full h-52 sm:h-64 object-cover object-bottom"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          style={{ imageRendering: 'pixelated' }}
        >
          <defs>
            {/* Foreground Lush Green Hills Gradient */}
            <linearGradient id="plainsGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2ECC71" />
              <stop offset="45%" stopColor="#22C55E" />
              <stop offset="85%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
          </defs>

          {/* 1. Distant Alpine Peaks (Color 1: Royal Blue) */}
          <g>
            <path
              d="M 0,280 V 148 H 12 V 144 H 24 V 136 H 36 V 132 H 48 V 128 H 60 V 120 H 72 V 116 H 84 V 112 H 96 V 104 H 108 V 100 H 120 V 96 H 132 V 88 H 144 V 84 H 156 V 80 H 168 V 72 H 180 V 68 H 192 V 64 H 204 V 56 H 216 V 52 H 228 V 48 H 240 V 40 H 252 V 44 H 264 V 48 H 276 V 52 H 288 V 56 H 300 V 60 H 312 V 64 H 324 V 68 H 336 V 72 H 348 V 76 H 360 V 80 H 372 V 84 H 384 V 88 H 396 V 92 H 408 V 100 H 420 V 104 H 432 V 108 H 444 V 112 H 456 V 116 H 468 V 120 H 480 V 124 H 492 V 120 H 504 V 116 H 516 V 112 H 528 V 108 H 540 V 100 H 552 V 96 H 564 V 92 H 576 V 88 H 588 V 84 H 600 V 76 H 612 V 72 H 624 V 68 H 636 V 64 H 648 V 56 H 660 V 52 H 672 V 48 H 684 V 44 H 696 V 36 H 708 V 32 H 720 V 28 H 732 V 24 H 756 V 32 H 768 V 36 H 780 V 40 H 792 V 44 H 804 V 48 H 816 V 52 H 828 V 56 H 840 V 60 H 852 V 68 H 864 V 72 H 876 V 76 H 888 V 80 H 900 V 84 H 912 V 88 H 924 V 92 H 936 V 100 H 948 V 104 H 960 V 108 H 972 V 112 H 984 V 116 H 996 V 120 H 1008 V 116 H 1020 V 112 H 1032 V 108 H 1044 V 104 H 1056 V 100 H 1080 V 96 H 1092 V 92 H 1104 V 88 H 1116 V 84 H 1128 V 80 H 1140 V 76 H 1152 V 72 H 1164 V 68 H 1188 V 64 H 1200 V 60 H 1212 V 56 H 1224 V 52 H 1236 V 48 H 1248 V 44 H 1260 V 40 H 1272 V 44 H 1284 V 52 H 1296 V 60 H 1308 V 64 H 1320 V 72 H 1332 V 80 H 1344 V 88 H 1356 V 96 H 1368 V 100 H 1380 V 108 H 1392 V 116 H 1404 V 124 H 1416 V 128 H 1428 V 136 H 1440 V 280 Z"
              fill="#1765BE"
              stroke="#102040"
              strokeWidth="2"
            />
          </g>

          {/* 2. Mid-range Mountains (Color 2: Deep Navy Blue) */}
          <g>
            <path
              d="M 0,280 V 172 H 12 V 164 H 24 V 160 H 36 V 152 H 48 V 148 H 60 V 140 H 72 V 136 H 84 V 128 H 96 V 124 H 108 V 116 H 120 V 112 H 132 V 104 H 144 V 100 H 156 V 92 H 168 V 88 H 180 V 92 H 192 V 96 H 204 V 100 H 216 V 104 H 228 V 108 H 240 V 112 H 252 V 116 H 264 V 120 H 276 V 124 H 288 V 128 H 312 V 132 H 324 V 136 H 336 V 140 H 348 V 144 H 360 V 148 H 372 V 152 H 384 V 156 H 396 V 160 H 408 V 164 H 420 V 168 H 432 V 164 H 444 V 160 H 456 V 156 H 468 V 152 H 480 V 148 H 492 V 144 H 504 V 140 H 516 V 136 H 528 V 132 H 540 V 128 H 552 V 124 H 564 V 120 H 576 V 116 H 588 V 112 H 600 V 108 H 612 V 104 H 624 V 100 H 636 V 96 H 648 V 92 H 660 V 88 H 672 V 84 H 684 V 80 H 696 V 84 H 708 V 88 H 720 V 92 H 732 V 96 H 744 V 100 H 756 V 104 H 768 V 108 H 780 V 112 H 792 V 116 H 804 V 120 H 816 V 124 H 828 V 128 H 852 V 132 H 864 V 136 H 876 V 140 H 888 V 144 H 900 V 148 H 912 V 152 H 924 V 156 H 936 V 160 H 948 V 156 H 960 V 152 H 972 V 148 H 984 V 144 H 996 V 140 H 1008 V 136 H 1020 V 132 H 1032 V 128 H 1044 V 124 H 1056 V 120 H 1068 V 116 H 1080 V 112 H 1092 V 108 H 1104 V 104 H 1128 V 100 H 1140 V 96 H 1152 V 92 H 1176 V 96 H 1200 V 100 H 1212 V 104 H 1224 V 108 H 1248 V 112 H 1260 V 116 H 1284 V 120 H 1296 V 124 H 1320 V 128 H 1332 V 132 H 1344 V 136 H 1368 V 140 H 1380 V 144 H 1404 V 148 H 1416 V 152 H 1440 V 280 Z"
              fill="#085599"
              stroke="#102040"
              strokeWidth="2"
            />
          </g>

          {/* 3. Foreground Lush Rolling Green Hills */}
          <g>
            <path
              d="M 0,280 V 196 H 12 V 192 H 30 V 188 H 36 V 184 H 48 V 180 H 54 V 176 H 60 V 172 H 66 V 168 H 72 V 164 H 78 V 160 H 90 V 156 H 96 V 152 H 102 V 148 H 114 V 144 H 132 V 140 H 174 V 144 H 198 V 148 H 210 V 152 H 222 V 156 H 234 V 160 H 246 V 164 H 258 V 168 H 270 V 172 H 288 V 176 H 300 V 180 H 318 V 184 H 336 V 188 H 420 V 184 H 438 V 180 H 450 V 176 H 462 V 172 H 474 V 168 H 486 V 164 H 492 V 160 H 504 V 156 H 510 V 152 H 522 V 148 H 534 V 144 H 546 V 140 H 564 V 136 H 624 V 140 H 648 V 144 H 660 V 148 H 672 V 152 H 684 V 156 H 696 V 160 H 714 V 164 H 726 V 168 H 738 V 172 H 750 V 176 H 762 V 180 H 786 V 184 H 858 V 180 H 876 V 176 H 894 V 172 H 906 V 168 H 918 V 164 H 930 V 160 H 942 V 156 H 960 V 152 H 972 V 148 H 990 V 144 H 1008 V 140 H 1074 V 144 H 1098 V 148 H 1110 V 152 H 1128 V 156 H 1140 V 160 H 1158 V 164 H 1170 V 168 H 1182 V 172 H 1200 V 176 H 1224 V 180 H 1290 V 176 H 1320 V 172 H 1344 V 168 H 1374 V 164 H 1416 V 168 H 1434 V 172 H 1440 V 280 Z"
              fill="url(#plainsGreenGrad)"
              stroke="#102040"
              strokeWidth="2"
            />
            {/* Crest Highlights */}
            <path
              d="M 84,160 H 90 V 156 H 96 V 152 H 102 V 148 H 114 V 144 H 132 V 140 H 174 V 144 H 198 V 148 H 210 V 152 H 216 V 156 H 210 V 152 H 198 V 148 H 174 V 144 H 132 V 148 H 114 V 152 H 102 V 156 H 96 V 160 H 90 V 164 H 84 Z"
              fill="#86EFAC"
              opacity="0.85"
            />
            <path
              d="M 516,152 H 522 V 148 H 534 V 144 H 546 V 140 H 564 V 136 H 624 V 140 H 648 V 144 H 660 V 148 H 648 V 144 H 624 V 140 H 564 V 144 H 546 V 148 H 534 V 152 H 522 V 156 H 516 Z"
              fill="#86EFAC"
              opacity="0.85"
            />
            <path
              d="M 966,152 H 972 V 148 H 990 V 144 H 1008 V 140 H 1074 V 144 H 1098 V 148 H 1110 V 152 H 1098 V 148 H 1074 V 144 H 1008 V 148 H 990 V 152 H 972 V 156 H 966 Z"
              fill="#86EFAC"
              opacity="0.85"
            />
            <path
              d="M 1338,172 H 1344 V 168 H 1374 V 164 H 1416 V 168 H 1434 V 172 H 1416 V 168 H 1374 V 172 H 1344 V 176 H 1338 Z"
              fill="#86EFAC"
              opacity="0.85"
            />
          </g>

          <line x1="0" y1="279" x2="1440" y2="279" stroke="#102040" strokeWidth="2" />
        </svg>

        {/* Animated Background How-To-Play & Encouraging Words Banner */}
        <div className="absolute top-16 sm:top-[72px] inset-x-0 flex justify-center pointer-events-none z-10 pl-3 pr-14 sm:px-4">
          <div className="anim-retro-banner inline-flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-[#102040] border-2 border-[#FFCC00] shadow-[2px_2px_0px_#B84418] rounded-xs max-w-xl text-center">
            <span className="text-[10px] sm:text-xs text-[#FFCC00] animate-pulse">💡</span>
            <p className="font-pixel text-[10px] sm:text-xs text-[#FFFBEB] tracking-wide leading-relaxed">
              <span className="text-[#FFCC00] font-bold">TUTORIAL:</span> 1. ENTER CODE &nbsp;•&nbsp; 2. PICK TEAM &nbsp;•&nbsp; 3. WIN!
            </p>
            <span className="text-[10px] sm:text-xs text-[#22C55E] hidden sm:inline">★</span>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 2: Moving Animated Drifting Clouds (Upper & Mid Lanes)            */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Upper High-Altitude Cloud Lane (110s smooth drift) */}
        <div className="absolute inset-x-0 top-3 sm:top-5 h-16 overflow-hidden pointer-events-none">
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-far opacity-65"
            style={{ animationDelay: '-20s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[8%]">
                <PixelCloudFluffy size={44} />
              </div>
              <div className="absolute top-3 left-[38%]">
                <PixelCloudFluffy size={52} />
              </div>
              <div className="absolute top-1 left-[70%]">
                <PixelCloudFluffy size={42} />
              </div>
            </div>
            {/* Set 2 (Seamless Loop) */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[8%]">
                <PixelCloudFluffy size={44} />
              </div>
              <div className="absolute top-3 left-[38%]">
                <PixelCloudFluffy size={52} />
              </div>
              <div className="absolute top-1 left-[70%]">
                <PixelCloudFluffy size={42} />
              </div>
            </div>
          </div>
        </div>

        {/* Lower/Mid Cloud Lane (65s smooth drift) */}
        <div className="absolute inset-x-0 top-16 sm:top-20 h-16 overflow-hidden pointer-events-none">
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-near opacity-75"
            style={{ animationDelay: '-8s' }}
          >
            {/* Set 1 */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[15%]">
                <PixelCloudFluffy size={60} />
              </div>
              <div className="absolute top-2 left-[55%]">
                <PixelCloudFluffy size={46} />
              </div>
              <div className="absolute top-1 left-[85%]">
                <PixelCloudFluffy size={68} />
              </div>
            </div>
            {/* Set 2 (Seamless Loop) */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[15%]">
                <PixelCloudFluffy size={60} />
              </div>
              <div className="absolute top-2 left-[55%]">
                <PixelCloudFluffy size={46} />
              </div>
              <div className="absolute top-1 left-[85%]">
                <PixelCloudFluffy size={68} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 3: Upper Floating Platforms (Question Blocks & Coins)             */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* UPPER-LEFT FLOATING ISLAND: 3 Coins + Platform + ? Block Below */}
        <div className="hidden sm:block absolute top-20 sm:top-24 left-3 sm:left-6 lg:left-12">
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
            <div className="mt-8 anim-block-cycle">
              <PixelQuestionBlock size={32} />
            </div>
          </div>
        </div>

        {/* MID-RIGHT FLOATING ISLAND: 1 Coin + Platform + ? Block Below */}
        <div className="hidden sm:block absolute top-24 sm:top-28 right-3 sm:right-6 lg:right-12">
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
        <div className="sm:hidden absolute top-[66px] right-4 anim-block-cycle">
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
        <div className="bg-nes-navy pt-1.5 sm:pt-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] px-4 text-center border-t-2 border-nes-gold">
          <p className="font-pixel text-[8px] sm:text-[9px] text-nes-gold tracking-wider">
            ★ &nbsp; STARTUPOLY © 2026 &nbsp; ★
          </p>
        </div>
      </div>
    </div>
  );
};

