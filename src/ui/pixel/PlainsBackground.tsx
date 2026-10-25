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
    <div className="min-h-screen bg-nes-sky flex flex-col justify-between relative overflow-hidden select-none anim-scene-transition">
      {/* ======================================================================= */}
      {/* LAYER 1: Distant Background Two-Tone Blue Hills & Prominent Castle      */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Layered Two-Tone Mountain Panorama Aligned to Ground Baseline */}
        <svg
          viewBox="0 0 1440 280"
          className="absolute inset-x-0 bottom-7 sm:bottom-8 w-full h-44 sm:h-64 object-cover object-bottom"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Tone 1: Distant Deep Arcade Indigo/Navy Blue */}
            <linearGradient id="plainsPeaksGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A4D85" />
              <stop offset="60%" stopColor="#1E3763" />
              <stop offset="100%" stopColor="#152646" />
            </linearGradient>

            {/* Tone 2: Foreground Vibrant Mid-Arcade Blue */}
            <linearGradient id="plainsHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3E72DC" />
              <stop offset="55%" stopColor="#2E5AB5" />
              <stop offset="100%" stopColor="#204085" />
            </linearGradient>

            {/* Subtle Snowcap highlight */}
            <linearGradient id="plainsSnowcapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#C3D9FF" />
            </linearGradient>
          </defs>

          {/* Tone 1: Distant Alpine Peaks with Snowcaps */}
          <g>
            <path
              d="M 0,280 L 0,160 C 70,150 140,75 250,75 C 340,75 410,135 500,135 C 580,135 660,65 760,65 C 870,65 940,125 1030,125 C 1120,125 1190,75 1270,75 C 1340,75 1395,120 1440,140 L 1440,280 Z"
              fill="url(#plainsPeaksGrad)"
              stroke="#102040"
              strokeWidth="2"
            />
            {/* Snowcaps */}
            <path
              d="M 215,95 Q 250,75 285,95 Q 268,105 250,98 Q 232,105 215,95 Z"
              fill="url(#plainsSnowcapGrad)"
              stroke="#102040"
              strokeWidth="1.5"
              opacity="0.9"
            />
            <path
              d="M 720,85 Q 760,65 800,85 Q 780,96 760,88 Q 740,96 720,85 Z"
              fill="url(#plainsSnowcapGrad)"
              stroke="#102040"
              strokeWidth="1.5"
              opacity="0.9"
            />
            <path
              d="M 1235,95 Q 1270,75 1305,95 Q 1288,105 1270,98 Q 1252,105 1235,95 Z"
              fill="url(#plainsSnowcapGrad)"
              stroke="#102040"
              strokeWidth="1.5"
              opacity="0.9"
            />
          </g>

          {/* Tone 2: Foreground Vibrant Mid-Blue Rolling Slopes */}
          <g>
            <path
              d="M 0,280 L 0,195 C 50,195 90,140 150,140 C 220,140 290,190 380,190 C 470,190 520,135 590,135 C 670,135 740,185 820,185 C 900,185 960,140 1040,140 C 1120,140 1180,180 1250,180 C 1310,180 1350,165 1400,165 C 1420,165 1435,170 1440,172 L 1440,280 Z"
              fill="url(#plainsHillsGrad)"
              stroke="#102040"
              strokeWidth="2"
            />
            {/* Subtle Crest Highlights */}
            <path d="M 85,155 C 115,140 150,140 210,148" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d="M 520,150 C 555,135 590,135 655,145" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d="M 970,152 C 1005,140 1040,140 1105,148" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d="M 1340,172 C 1370,165 1400,165 1435,170" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
          </g>

          <line x1="0" y1="279" x2="1440" y2="279" stroke="#102040" strokeWidth="2" />
        </svg>

        {/* Castle Fortress Grounded on Right (Substantially Enlarged & Prominent) */}
        <div className="block absolute bottom-7 sm:bottom-8 right-2 sm:right-6 md:right-10 lg:right-14 opacity-100 z-0 origin-bottom-right scale-110 sm:scale-130 md:scale-150 lg:scale-175 transition-transform duration-300 drop-shadow-[0_8px_16px_rgba(16,32,64,0.45)] pointer-events-none">
          <div className="relative flex flex-col items-center">
            {/* Center tower with flag */}
            <div className="relative flex items-end justify-center -mb-0.5">
              <div className="w-1.5 h-10 bg-[#0F172A] rounded-t-sm" />
              <div className="absolute top-0 left-1">
                <svg
                  width="28"
                  height="18"
                  viewBox="0 0 28 18"
                  fill="none"
                  className="anim-flag-flutter origin-left"
                >
                  <path d="M0 0 L28 9 L0 18 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="2" />
                  <path d="M0 2 L20 9 L0 11 Z" fill="#FB7185" />
                  <rect x="4" y="7" width="4" height="4" fill="#FFCC00" />
                </svg>
              </div>
            </div>
            {/* Conical Roof / Battlements */}
            <div className="w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-b-[26px] border-b-[#475569]" />
            <div className="w-13 h-4 bg-[#475569] border-x-2 border-[#0F172A] flex justify-between px-1">
              <div className="w-2 h-2 bg-[#0F172A]" />
              <div className="w-2 h-2 bg-[#0F172A]" />
              <div className="w-2 h-2 bg-[#0F172A]" />
            </div>
            {/* Central Tower Body with Amber Lit Arched Windows */}
            <div className="w-11 h-28 bg-[#3E4D64] border-x-2 border-[#0F172A] flex flex-col items-center pt-3 gap-2">
              <div className="w-3.5 h-6 bg-[#FCD34D] border border-[#0F172A] rounded-t-sm shadow-[inset_1px_1px_0px_#FFFBEB]" />
              <div className="w-3 h-5 bg-[#FCD34D] border border-[#0F172A] rounded-t-sm shadow-[inset_1px_1px_0px_#FFFBEB]" />
            </div>
            {/* Flanking turrets & Portcullis */}
            <div className="w-36 h-20 bg-[#3E4D64] border-t-2 border-x-2 border-[#0F172A] flex justify-between items-start -mt-18 px-2">
              <div className="flex flex-col items-center -mt-7">
                <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[18px] border-b-[#475569]" />
                <div className="w-7 h-3 bg-[#475569] border-x-2 border-[#0F172A]" />
                <div className="w-2.5 h-4 bg-[#FCD34D] border border-[#0F172A] rounded-t-sm mt-1" />
              </div>
              <div className="w-8 h-12 bg-[#0F172A] rounded-t-md self-end flex items-center justify-center">
                <div className="w-6 h-9 border-t border-x border-[#94A3B8] rounded-t-sm opacity-85" />
              </div>
              <div className="flex flex-col items-center -mt-7">
                <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[18px] border-b-[#475569]" />
                <div className="w-7 h-3 bg-[#475569] border-x-2 border-[#0F172A]" />
                <div className="w-2.5 h-4 bg-[#FCD34D] border border-[#0F172A] rounded-t-sm mt-1" />
              </div>
            </div>
            <div className="w-38 h-2 bg-[#2E3B4E] border-x-2 border-b-2 border-[#0F172A] -mt-0.5" />
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
        <div className="bg-nes-navy pt-1.5 sm:pt-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] px-4 text-center border-t-2 border-nes-gold">
          <p className="font-pixel text-[8px] sm:text-[9px] text-nes-gold tracking-wider">
            ★ &nbsp; STARTUPOLY © 2026 &nbsp; ★
          </p>
        </div>
      </div>
    </div>
  );
};

