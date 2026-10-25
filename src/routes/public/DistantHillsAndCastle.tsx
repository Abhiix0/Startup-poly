import React from 'react';

export const DistantHillsAndCastle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================================= */}
      {/* LAYER: Natural Pixel-Art Stepped Mountain Panorama with Snowcaps        */}
      {/* ======================================================================= */}
      <svg
        viewBox="0 0 1440 280"
        className="w-full h-44 sm:h-52 md:h-60 lg:h-66 object-cover object-bottom"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated' }}
      >
        <defs>
          {/* Foreground Lush Green Hills Gradient */}
          <linearGradient id="greenHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2ECC71" />
            <stop offset="45%" stopColor="#22C55E" />
            <stop offset="85%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>

        {/* --------------------------------------------------------------------- */}
        {/* 1. LAYER A: DISTANT PIXELATED ALPINE PEAKS (COLOR 1: ROYAL BLUE)      */}
        {/* --------------------------------------------------------------------- */}
        <g>
          {/* Stepped pixel-art alpine peaks silhouette (Left, Center & Right peaks) */}
          <path
            d="M 0,280 V 160 H 12 V 156 H 24 V 152 H 36 V 148 H 48 V 144 H 54 V 140 H 60 V 136 H 72 V 132 H 78 V 128 H 84 V 124 H 96 V 120 H 102 V 116 H 108 V 112 H 120 V 108 H 126 V 104 H 132 V 100 H 144 V 96 H 156 V 92 H 162 V 88 H 180 V 84 H 192 V 80 H 210 V 76 H 288 V 80 H 306 V 84 H 318 V 88 H 336 V 92 H 342 V 96 H 354 V 100 H 366 V 104 H 378 V 108 H 390 V 112 H 402 V 116 H 408 V 120 H 426 V 124 H 438 V 128 H 456 V 132 H 480 V 136 H 516 V 132 H 540 V 128 H 552 V 124 H 564 V 120 H 576 V 116 H 588 V 112 H 600 V 108 H 606 V 104 H 618 V 100 H 630 V 96 H 636 V 92 H 648 V 88 H 660 V 84 H 672 V 80 H 684 V 76 H 696 V 72 H 714 V 68 H 738 V 64 H 786 V 68 H 816 V 72 H 834 V 76 H 852 V 80 H 864 V 84 H 876 V 88 H 888 V 92 H 900 V 96 H 912 V 100 H 924 V 104 H 936 V 108 H 948 V 112 H 960 V 116 H 972 V 120 H 996 V 124 H 1068 V 120 H 1092 V 116 H 1110 V 112 H 1122 V 108 H 1134 V 104 H 1146 V 100 H 1158 V 96 H 1170 V 92 H 1188 V 88 H 1200 V 84 H 1212 V 80 H 1236 V 76 H 1302 V 80 H 1320 V 84 H 1332 V 88 H 1344 V 92 H 1350 V 96 H 1362 V 100 H 1368 V 104 H 1374 V 108 H 1386 V 112 H 1392 V 116 H 1398 V 120 H 1404 V 124 H 1410 V 128 H 1422 V 132 H 1428 V 136 H 1434 V 140 H 1440 V 280 Z"
            fill="#1765BE"
            stroke="#102040"
            strokeWidth="2"
          />
        </g>

        {/* --------------------------------------------------------------------- */}
        {/* 2. LAYER B: MID-DISTANCE PIXELATED MOUNTAINS (COLOR 2: DEEP NAVY BLUE) */}
        {/* --------------------------------------------------------------------- */}
        <g>
          <path
            d="M 0,280 V 184 H 24 V 180 H 36 V 176 H 48 V 172 H 54 V 168 H 60 V 164 H 72 V 160 H 78 V 156 H 84 V 152 H 90 V 148 H 102 V 144 H 108 V 140 H 114 V 136 H 126 V 132 H 138 V 128 H 150 V 124 H 168 V 120 H 222 V 124 H 246 V 128 H 258 V 132 H 276 V 136 H 288 V 140 H 300 V 144 H 312 V 148 H 324 V 152 H 336 V 156 H 348 V 160 H 360 V 164 H 372 V 168 H 390 V 172 H 420 V 176 H 462 V 172 H 486 V 168 H 504 V 164 H 516 V 160 H 528 V 156 H 540 V 152 H 552 V 148 H 564 V 144 H 576 V 140 H 582 V 136 H 594 V 132 H 606 V 128 H 618 V 124 H 636 V 120 H 654 V 116 H 732 V 120 H 750 V 124 H 768 V 128 H 780 V 132 H 798 V 136 H 810 V 140 H 822 V 144 H 834 V 148 H 846 V 152 H 864 V 156 H 882 V 160 H 900 V 164 H 978 V 160 H 1002 V 156 H 1020 V 152 H 1038 V 148 H 1050 V 144 H 1068 V 140 H 1080 V 136 H 1098 V 132 H 1116 V 128 H 1146 V 124 H 1194 V 128 H 1224 V 132 H 1248 V 136 H 1266 V 140 H 1290 V 144 H 1308 V 148 H 1332 V 152 H 1356 V 156 H 1392 V 160 H 1440 V 280 Z"
            fill="#085599"
            stroke="#102040"
            strokeWidth="2"
          />
        </g>

        {/* --------------------------------------------------------------------- */}
        {/* 3. LAYER C: FOREGROUND PIXELATED LUSH GREEN DUNES & CREST LIGHTS      */}
        {/* --------------------------------------------------------------------- */}
        <g>
          {/* Main stepped rolling green hills body */}
          <path
            d="M 0,280 V 196 H 12 V 192 H 30 V 188 H 36 V 184 H 48 V 180 H 54 V 176 H 60 V 172 H 66 V 168 H 72 V 164 H 78 V 160 H 90 V 156 H 96 V 152 H 102 V 148 H 114 V 144 H 132 V 140 H 174 V 144 H 198 V 148 H 210 V 152 H 222 V 156 H 234 V 160 H 246 V 164 H 258 V 168 H 270 V 172 H 288 V 176 H 300 V 180 H 318 V 184 H 336 V 188 H 420 V 184 H 438 V 180 H 450 V 176 H 462 V 172 H 474 V 168 H 486 V 164 H 492 V 160 H 504 V 156 H 510 V 152 H 522 V 148 H 534 V 144 H 546 V 140 H 564 V 136 H 624 V 140 H 648 V 144 H 660 V 148 H 672 V 152 H 684 V 156 H 696 V 160 H 714 V 164 H 726 V 168 H 738 V 172 H 750 V 176 H 762 V 180 H 786 V 184 H 858 V 180 H 876 V 176 H 894 V 172 H 906 V 168 H 918 V 164 H 930 V 160 H 942 V 156 H 960 V 152 H 972 V 148 H 990 V 144 H 1008 V 140 H 1074 V 144 H 1098 V 148 H 1110 V 152 H 1128 V 156 H 1140 V 160 H 1158 V 164 H 1170 V 168 H 1182 V 172 H 1200 V 176 H 1224 V 180 H 1290 V 176 H 1320 V 172 H 1344 V 168 H 1374 V 164 H 1416 V 168 H 1434 V 172 H 1440 V 280 Z"
            fill="url(#greenHillsGrad)"
            stroke="#102040"
            strokeWidth="2"
          />

          {/* Stepped Pixel Crest Highlights (Super Mario World 8-bit aesthetic) */}
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

          {/* Pixel Shrub Tufts dotted along the green slopes matching reference */}
          <g fill="#166534">
            <rect x="240" y="164" width="4" height="6" />
            <rect x="244" y="162" width="6" height="8" />
            <rect x="250" y="164" width="4" height="6" />
            <rect x="450" y="174" width="4" height="6" />
            <rect x="454" y="172" width="6" height="8" />
            <rect x="460" y="174" width="4" height="6" />
            <rect x="696" y="162" width="4" height="6" />
            <rect x="700" y="160" width="6" height="8" />
            <rect x="706" y="162" width="4" height="6" />
            <rect x="918" y="166" width="4" height="6" />
            <rect x="922" y="164" width="6" height="8" />
            <rect x="928" y="166" width="4" height="6" />
            <rect x="1170" y="170" width="4" height="6" />
            <rect x="1174" y="168" width="6" height="8" />
            <rect x="1180" y="170" width="4" height="6" />
          </g>
        </g>

        {/* Continuous Stepped Ground Baseline (y = 279) */}
        <line x1="0" y1="279" x2="1440" y2="279" stroke="#102040" strokeWidth="2" />
      </svg>

      {/* ======================================================================= */}
      {/* LAYER: Fully Opaque Majestic Castle Fortress - Grounded on Turf Baseline */}
      {/* ======================================================================= */}
      <div className="block absolute bottom-7 sm:bottom-8 md:bottom-8 lg:bottom-8 right-2 sm:right-6 md:right-10 lg:right-14 z-0 opacity-100 scale-75 sm:scale-85 md:scale-95 lg:scale-100 origin-bottom-right drop-shadow-[0_4px_8px_rgba(16,32,64,0.35)]">
        <div className="relative flex flex-col items-center">
          {/* Main Central Castle Tower with Flag */}
          <div className="relative flex flex-col items-center">
            {/* Flagpole mounted right in the center of the conical roof peak */}
            <div className="relative flex items-end justify-center -mb-0.5">
              <div className="w-1.5 h-10 bg-[#0F172A] rounded-t-sm" />
              {/* Triangular Flag attached at the top of the pole extending right */}
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
          </div>

          {/* Left & Right Flanking Turrets with Battlements */}
          <div className="w-36 h-20 bg-[#3E4D64] border-t-2 border-x-2 border-[#0F172A] flex justify-between items-start -mt-18 px-2">
            {/* Left Turret Top */}
            <div className="flex flex-col items-center -mt-7">
              <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[18px] border-b-[#475569]" />
              <div className="w-7 h-3 bg-[#475569] border-x-2 border-[#0F172A]" />
              <div className="w-2.5 h-4 bg-[#FCD34D] border border-[#0F172A] rounded-t-sm mt-1" />
            </div>

            {/* Castle Main Gate / Portcullis */}
            <div className="w-8 h-12 bg-[#0F172A] rounded-t-md self-end flex items-center justify-center">
              <div className="w-6 h-9 border-t border-x border-[#94A3B8] rounded-t-sm opacity-85" />
            </div>

            {/* Right Turret Top */}
            <div className="flex flex-col items-center -mt-7">
              <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[18px] border-b-[#475569]" />
              <div className="w-7 h-3 bg-[#475569] border-x-2 border-[#0F172A]" />
              <div className="w-2.5 h-4 bg-[#FCD34D] border border-[#0F172A] rounded-t-sm mt-1" />
            </div>
          </div>

          {/* Solid Foundation Base Level with Ground */}
          <div className="w-38 h-2 bg-[#2E3B4E] border-x-2 border-b-2 border-[#0F172A] -mt-0.5" />
        </div>
      </div>
    </div>
  );
};
