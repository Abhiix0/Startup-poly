import React from 'react';
import {
  PixelCoin,
  PixelCloudFluffy,
  PixelPipe,
  PixelQuestionBlock,
  PixelGrassTuft,
  PixelFlower,
  RetroCoin,
  RetroKoopa,
  RetroGoomba,
  RetroFounderJumper,
  RetroDispensingBlock,
} from '../../ui/pixel';

export const DistantHillsAndCastle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================================= */}
      {/* PARALLAX LAYER 1 (0.2x speed): Far Distant Mountain Ranges & Pine Forest*/}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Seamless scrolling track for far mountains (0.2x speed) */}
        <div className="flex w-[200%] h-full anim-parallax-scroll-far">
          {/* Tile 1 */}
          <div className="w-1/2 h-full relative shrink-0">
            {/* Drifting Far High Clouds */}
            <div className="absolute top-10 left-[8%] opacity-60">
              <PixelCloudFluffy size={60} />
            </div>
            <div className="absolute top-20 left-[48%] opacity-50">
              <PixelCloudFluffy size={75} />
            </div>
            <div className="absolute top-8 left-[78%] opacity-65">
              <PixelCloudFluffy size={55} />
            </div>

            {/* Distant Mountain Silhouettes with Snow Caps & Pine Ridge */}
            <svg
              viewBox="0 0 1440 420"
              className="absolute bottom-16 sm:bottom-20 inset-x-0 w-full h-56 sm:h-72 md:h-88 lg:h-96 object-cover object-bottom"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="snowPeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <linearGradient id="mountainRockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="50%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="farForestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Distant Layer: Mountain Peaks */}
              <polygon points="0,420 0,310 110,210 230,290 380,140 520,280 690,170 860,300 1020,160 1200,270 1340,190 1440,260 1440,420" fill="url(#mountainRockGrad)" />

              {/* Snow Caps on Peaks */}
              {/* Peak 1 */}
              <polygon points="110,210 80,240 105,232 120,242 140,230" fill="url(#snowPeakGrad)" />
              {/* Peak 2 (Tallest Left) */}
              <polygon points="380,140 330,190 365,180 385,195 420,178 440,192" fill="url(#snowPeakGrad)" />
              {/* Peak 3 (Center) */}
              <polygon points="690,170 650,210 680,202 705,215 730,198 740,212" fill="url(#snowPeakGrad)" />
              {/* Peak 4 (Right) */}
              <polygon points="1020,160 970,210 1005,198 1030,215 1060,195 1080,212" fill="url(#snowPeakGrad)" />
              {/* Peak 5 */}
              <polygon points="1340,190 1300,230 1330,222 1350,235 1380,218" fill="url(#snowPeakGrad)" />

              {/* Pine Tree Forest Ridge (Silhouetted evergreen tree silhouettes) */}
              <path
                d="M 0,420 L 0,330 
                   L 20,310 L 40,335 L 60,305 L 80,330 L 100,312 L 120,336 L 140,300 L 160,335 
                   L 180,315 L 200,340 L 220,305 L 240,330 L 260,308 L 280,338 L 300,310 L 320,336
                   L 340,312 L 360,340 L 380,315 L 400,342 L 420,318 L 440,345 L 460,320 L 480,348
                   L 500,322 L 520,350 L 540,324 L 560,350 L 580,326 L 600,352 L 620,325 L 640,350
                   L 660,320 L 680,345 L 700,318 L 720,345 L 740,320 L 760,348 L 780,322 L 800,350
                   L 820,325 L 840,352 L 860,326 L 880,350 L 900,324 L 920,350 L 940,322 L 960,348
                   L 980,320 L 1000,345 L 1020,318 L 1040,345 L 1060,320 L 1080,348 L 1100,324 L 1120,350
                   L 1140,326 L 1160,352 L 1180,325 L 1200,350 L 1220,320 L 1240,345 L 1260,318 L 1280,345
                   L 1300,322 L 1320,348 L 1340,324 L 1360,350 L 1380,326 L 1400,352 L 1420,328 L 1440,350
                   L 1440,420 Z"
                fill="url(#farForestGrad)"
              />
            </svg>
          </div>

          {/* Tile 2 (Identical for seamless infinite scroll) */}
          <div className="w-1/2 h-full relative shrink-0">
            <div className="absolute top-10 left-[8%] opacity-60">
              <PixelCloudFluffy size={60} />
            </div>
            <div className="absolute top-20 left-[48%] opacity-50">
              <PixelCloudFluffy size={75} />
            </div>
            <div className="absolute top-8 left-[78%] opacity-65">
              <PixelCloudFluffy size={55} />
            </div>

            <svg
              viewBox="0 0 1440 420"
              className="absolute bottom-16 sm:bottom-20 inset-x-0 w-full h-56 sm:h-72 md:h-88 lg:h-96 object-cover object-bottom"
              preserveAspectRatio="none"
            >
              <polygon points="0,420 0,310 110,210 230,290 380,140 520,280 690,170 860,300 1020,160 1200,270 1340,190 1440,260 1440,420" fill="url(#mountainRockGrad)" />
              <polygon points="110,210 80,240 105,232 120,242 140,230" fill="url(#snowPeakGrad)" />
              <polygon points="380,140 330,190 365,180 385,195 420,178 440,192" fill="url(#snowPeakGrad)" />
              <polygon points="690,170 650,210 680,202 705,215 730,198 740,212" fill="url(#snowPeakGrad)" />
              <polygon points="1020,160 970,210 1005,198 1030,215 1060,195 1080,212" fill="url(#snowPeakGrad)" />
              <polygon points="1340,190 1300,230 1330,222 1350,235 1380,218" fill="url(#snowPeakGrad)" />
              <path
                d="M 0,420 L 0,330 
                   L 20,310 L 40,335 L 60,305 L 80,330 L 100,312 L 120,336 L 140,300 L 160,335 
                   L 180,315 L 200,340 L 220,305 L 240,330 L 260,308 L 280,338 L 300,310 L 320,336
                   L 340,312 L 360,340 L 380,315 L 400,342 L 420,318 L 440,345 L 460,320 L 480,348
                   L 500,322 L 520,350 L 540,324 L 560,350 L 580,326 L 600,352 L 620,325 L 640,350
                   L 660,320 L 680,345 L 700,318 L 720,345 L 740,320 L 760,348 L 780,322 L 800,350
                   L 820,325 L 840,352 L 860,326 L 880,350 L 900,324 L 920,350 L 940,322 L 960,348
                   L 980,320 L 1000,345 L 1020,318 L 1040,345 L 1060,320 L 1080,348 L 1100,324 L 1120,350
                   L 1140,326 L 1160,352 L 1180,325 L 1200,350 L 1220,320 L 1240,345 L 1260,318 L 1280,345
                   L 1300,322 L 1320,348 L 1340,324 L 1360,350 L 1380,326 L 1400,352 L 1420,328 L 1440,350
                   L 1440,420 Z"
                fill="url(#farForestGrad)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* PARALLAX LAYER 2 (0.5x speed): Super Mario World Rolling Green Hills    */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Seamless scrolling track for mid-ground hills (0.5x speed) */}
        <div className="flex w-[200%] h-full anim-parallax-scroll-mid">
          {/* Tile 1 */}
          <div className="w-1/2 h-full relative shrink-0">
            {/* Mid-Distant Rolling Green Rounded Hills with 16-bit Black Border & Classic Eyes */}
            <svg
              viewBox="0 0 1440 280"
              className="absolute bottom-12 sm:bottom-16 inset-x-0 w-full h-44 sm:h-56 md:h-68 lg:h-76 object-cover object-bottom"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="smwLightGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="40%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>
                <linearGradient id="smwDarkGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#15803D" />
                  <stop offset="100%" stopColor="#166534" />
                </linearGradient>
              </defs>

              {/* Rear Rolling Green Hills */}
              <path
                d="M 0,280 L 0,160 Q 220,70 440,165 T 880,140 T 1320,175 Q 1380,185 1440,195 L 1440,280 Z"
                fill="url(#smwDarkGreenGrad)"
                stroke="#102040"
                strokeWidth="4"
              />

              {/* Prominent Foreground Rounded Hills (Classic Super Mario World shape) */}
              <path
                d="M 0,280 L 0,210 Q 180,95 360,190 T 720,130 T 1080,185 T 1440,150 L 1440,280 Z"
                fill="url(#smwLightGreenGrad)"
                stroke="#102040"
                strokeWidth="5"
              />

              {/* Classic SMW Hill Eyes (Oval black pill eyes on the hill summits) */}
              {/* Hill 1 Eyes */}
              <ellipse cx="260" cy="180" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="276" cy="180" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="260" cy="177" rx="1.5" ry="3.5" fill="#FFFFFF" />
              <ellipse cx="276" cy="177" rx="1.5" ry="3.5" fill="#FFFFFF" />

              {/* Hill 2 Eyes */}
              <ellipse cx="640" cy="155" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="656" cy="155" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="640" cy="152" rx="1.5" ry="3.5" fill="#FFFFFF" />
              <ellipse cx="656" cy="152" rx="1.5" ry="3.5" fill="#FFFFFF" />

              {/* Hill 3 Eyes */}
              <ellipse cx="1180" cy="185" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="1196" cy="185" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="1180" cy="182" rx="1.5" ry="3.5" fill="#FFFFFF" />
              <ellipse cx="1196" cy="182" rx="1.5" ry="3.5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Tile 2 */}
          <div className="w-1/2 h-full relative shrink-0">
            <svg
              viewBox="0 0 1440 280"
              className="absolute bottom-12 sm:bottom-16 inset-x-0 w-full h-44 sm:h-56 md:h-68 lg:h-76 object-cover object-bottom"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,280 L 0,160 Q 220,70 440,165 T 880,140 T 1320,175 Q 1380,185 1440,195 L 1440,280 Z"
                fill="url(#smwDarkGreenGrad)"
                stroke="#102040"
                strokeWidth="4"
              />
              <path
                d="M 0,280 L 0,210 Q 180,95 360,190 T 720,130 T 1080,185 T 1440,150 L 1440,280 Z"
                fill="url(#smwLightGreenGrad)"
                stroke="#102040"
                strokeWidth="5"
              />
              <ellipse cx="260" cy="180" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="276" cy="180" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="260" cy="177" rx="1.5" ry="3.5" fill="#FFFFFF" />
              <ellipse cx="276" cy="177" rx="1.5" ry="3.5" fill="#FFFFFF" />

              <ellipse cx="640" cy="155" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="656" cy="155" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="640" cy="152" rx="1.5" ry="3.5" fill="#FFFFFF" />
              <ellipse cx="656" cy="152" rx="1.5" ry="3.5" fill="#FFFFFF" />

              <ellipse cx="1180" cy="185" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="1196" cy="185" rx="3.5" ry="9" fill="#102040" />
              <ellipse cx="1180" cy="182" rx="1.5" ry="3.5" fill="#FFFFFF" />
              <ellipse cx="1196" cy="182" rx="1.5" ry="3.5" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 3: Castle Fortress Bastion Silhouette (Mid-Right Foreground)      */}
      {/* ======================================================================= */}
      <div className="hidden sm:block absolute bottom-14 sm:bottom-20 right-6 sm:right-16 lg:right-24 z-0 opacity-45">
        <div className="relative flex flex-col items-center">
          {/* Main Central Castle Tower with Flag */}
          <div className="relative flex flex-col items-center">
            {/* Flagpole */}
            <div className="relative flex items-end justify-center -mb-0.5">
              <div className="w-1.5 h-12 bg-[#102040] rounded-t-sm" />
              <div className="absolute top-0 left-1">
                <svg
                  width="30"
                  height="18"
                  viewBox="0 0 30 18"
                  fill="none"
                  className="anim-flag-flutter origin-left"
                >
                  <path d="M0 0 L30 9 L0 18 Z" fill="#E11D48" stroke="#102040" strokeWidth="2" />
                  <path d="M0 2 L22 9 L0 11 Z" fill="#FB7185" />
                  <rect x="4" y="7" width="4" height="4" fill="#FFCC00" />
                </svg>
              </div>
            </div>

            {/* Conical Roof / Battlements */}
            <div className="w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-b-[32px] border-b-[#334155]" />
            <div className="w-16 h-5 bg-[#334155] border-x-2 border-[#102040] flex justify-between px-1">
              <div className="w-2.5 h-2.5 bg-[#102040]" />
              <div className="w-2.5 h-2.5 bg-[#102040]" />
              <div className="w-2.5 h-2.5 bg-[#102040]" />
            </div>

            {/* Central Tower Body with Arched Windows */}
            <div className="w-14 h-32 bg-[#334155] border-x-2 border-[#102040] flex flex-col items-center pt-3 gap-2.5">
              <div className="w-4 h-7 bg-[#102040] rounded-t-sm" />
              <div className="w-4 h-6 bg-[#102040] rounded-t-sm" />
            </div>
          </div>

          {/* Left & Right Flanking Turrets with Battlements */}
          <div className="w-44 h-24 bg-[#334155] border-t-2 border-x-2 border-[#102040] flex justify-between items-start -mt-20 px-2">
            {/* Left Turret */}
            <div className="flex flex-col items-center -mt-8">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-b-[#334155]" />
              <div className="w-8 h-4 bg-[#334155] border-x-2 border-[#102040]" />
              <div className="w-3 h-5 bg-[#102040] rounded-t-sm mt-1" />
            </div>

            {/* Castle Main Gate / Portcullis */}
            <div className="w-10 h-14 bg-[#102040] rounded-t-md self-end flex items-center justify-center">
              <div className="w-7 h-10 border-t border-x border-[#64748B] rounded-t-sm opacity-60" />
            </div>

            {/* Right Turret */}
            <div className="flex flex-col items-center -mt-8">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-b-[#334155]" />
              <div className="w-8 h-4 bg-[#334155] border-x-2 border-[#102040]" />
              <div className="w-3 h-5 bg-[#102040] rounded-t-sm mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 4: Giant Interlocking Warp Pipe Land Complex (Right Side)          */}
      {/* ======================================================================= */}
      <div className="hidden lg:block absolute bottom-12 right-10 sm:right-16 lg:right-24 pointer-events-none z-0">
        <div className="relative flex items-end">
          {/* Vertical Giant Pipe 1 (Tallest) */}
          <div className="flex flex-col items-center relative z-10">
            {/* Coin hover above pipe top */}
            <div className="-mb-2">
              <RetroCoin size={18} />
            </div>
            {/* Pipe Lip Rim */}
            <div className="w-16 h-8 bg-[#22C55E] border-3 border-[#102040] rounded-t-sm relative shadow-sm">
              <div className="absolute top-0 bottom-0 left-2 w-2.5 bg-[#86EFAC]" />
              <div className="absolute top-0 bottom-0 right-2 w-3 bg-[#15803D]" />
            </div>
            {/* Pipe Body */}
            <div className="w-14 h-56 bg-[#22C55E] border-x-3 border-[#102040] relative">
              <div className="absolute top-0 bottom-0 left-2 w-2.5 bg-[#86EFAC]" />
              <div className="absolute top-0 bottom-0 right-2 w-3 bg-[#15803D]" />
            </div>
          </div>

          {/* Horizontal Interconnecting Elbow Pipe */}
          <div className="w-16 h-10 bg-[#22C55E] border-y-3 border-[#102040] -ml-2 -mb-28 relative z-0">
            <div className="absolute top-1 inset-x-0 h-2 bg-[#86EFAC]" />
            <div className="absolute bottom-1 inset-x-0 h-2 bg-[#15803D]" />
          </div>

          {/* Mid Pipe 2 with Pacing Koopa on top! */}
          <div className="flex flex-col items-center relative z-10 -ml-1">
            {/* Koopa pacing on pipe top */}
            <div className="anim-patrol-sm -mb-1">
              <RetroKoopa size={30} />
            </div>
            <div className="w-16 h-8 bg-[#22C55E] border-3 border-[#102040] rounded-t-sm relative shadow-sm">
              <div className="absolute top-0 bottom-0 left-2 w-2.5 bg-[#86EFAC]" />
              <div className="absolute top-0 bottom-0 right-2 w-3 bg-[#15803D]" />
            </div>
            <div className="w-14 h-36 bg-[#22C55E] border-x-3 border-[#102040] relative">
              <div className="absolute top-0 bottom-0 left-2 w-2.5 bg-[#86EFAC]" />
              <div className="absolute top-0 bottom-0 right-2 w-3 bg-[#15803D]" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* LAYER 5: Simulated Game Loop: Jumping Founders, Hitting ? Blocks & Coins*/}
      {/* ======================================================================= */}

      {/* Action Zone Left: Brick Walkway with Bumping ? Block & Leaping Founder */}
      <div className="hidden md:block absolute bottom-24 lg:bottom-32 left-10 sm:left-20 lg:left-28 pointer-events-none z-0">
        <div className="relative flex flex-col items-start">
          {/* Overhead Bumping ? Block that Dispenses Gold Coin */}
          <div className="ml-24 mb-6">
            <RetroDispensingBlock size={30} />
          </div>

          {/* Leaping Caped Founder punching upward into the block */}
          <div className="anim-founder-game-loop absolute -bottom-1 left-2">
            <RetroFounderJumper size={34} variant="blue" />
          </div>

          {/* Elevated Brick Walkway Base with Finished Clean Edges */}
          <div className="flex items-center shadow-sm">
            <div className="w-7 h-7 bg-[#B84418] border-2 border-[#102040] relative">
              <div className="absolute inset-0 border-t border-l border-[#E07A5F] opacity-70" />
            </div>
            <div className="w-7 h-7 bg-[#B84418] border-2 border-[#102040] relative">
              <div className="absolute inset-0 border-t border-l border-[#E07A5F] opacity-70" />
            </div>
            <div className="w-7 h-7 bg-[#B84418] border-2 border-[#102040] relative">
              <div className="absolute inset-0 border-t border-l border-[#E07A5F] opacity-70" />
            </div>
            <div className="w-7 h-7 bg-[#B84418] border-2 border-[#102040] relative">
              <div className="absolute inset-0 border-t border-l border-[#E07A5F] opacity-70" />
            </div>
            <div className="w-7 h-7 bg-[#B84418] border-2 border-[#102040] relative">
              <div className="absolute inset-0 border-t border-l border-[#E07A5F] opacity-70" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Zone Far-Left: Goomba Pacing on Brick Platform with Jump-Arc Coins Overhead */}
      <div className="hidden lg:block absolute bottom-16 left-80 pointer-events-none z-0">
        <div className="relative flex flex-col items-center">
          {/* Natural Jump-Arc of 3 Coins above Goomba patrol */}
          <div className="flex items-end gap-2.5 mb-2">
            <div className="mb-0"><RetroCoin size={16} style={{ animationDelay: '0s' }} /></div>
            <div className="mb-2"><RetroCoin size={16} style={{ animationDelay: '-0.2s' }} /></div>
            <div className="mb-0"><RetroCoin size={16} style={{ animationDelay: '-0.4s' }} /></div>
          </div>

          {/* Patrolling Goomba */}
          <div className="anim-patrol-sm mb-0.5">
            <RetroGoomba size={24} />
          </div>
          {/* Stepped Brick Ledge */}
          <div className="flex shadow-sm">
            <div className="w-6 h-6 bg-[#B84418] border-2 border-[#102040]" />
            <div className="w-6 h-6 bg-[#B84418] border-2 border-[#102040]" />
            <div className="w-6 h-6 bg-[#B84418] border-2 border-[#102040]" />
            <div className="w-6 h-6 bg-[#B84418] border-2 border-[#102040]" />
          </div>
        </div>
      </div>

      {/* Natural Mario Jump-Arc of Coins over the Green Warp Pipe Area */}
      <div className="hidden sm:flex absolute bottom-28 left-40 sm:left-48 items-end gap-3 pointer-events-none z-0">
        <div className="mb-0"><RetroCoin size={18} style={{ animationDelay: '-0.1s' }} /></div>
        <div className="mb-3"><RetroCoin size={18} style={{ animationDelay: '-0.2s' }} /></div>
        <div className="mb-6"><RetroCoin size={18} style={{ animationDelay: '-0.3s' }} /></div>
        <div className="mb-3"><RetroCoin size={18} style={{ animationDelay: '-0.4s' }} /></div>
        <div className="mb-0"><RetroCoin size={18} style={{ animationDelay: '-0.5s' }} /></div>
      </div>

      {/* Action Zone Center: Retro Hero running behind the top header */}
      <div className="hidden sm:block absolute top-20 left-[48%] pointer-events-none z-0">
        <div className="anim-patrol-md opacity-80">
          <RetroFounderJumper size={26} variant="red" />
        </div>
      </div>
    </div>
  );
};
