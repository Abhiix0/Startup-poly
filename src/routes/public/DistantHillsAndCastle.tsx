import React from 'react';

export const DistantHillsAndCastle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================================= */}
      {/* LAYER: Natural Layered Mountain Panorama with Mario Depth & Snowcaps   */}
      {/* ======================================================================= */}
      <svg
        viewBox="0 0 1440 280"
        className="w-full h-44 sm:h-52 md:h-60 lg:h-66 object-cover object-bottom"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Distant Alpine Mountain Gradient */}
          <linearGradient id="distantAlpineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A75C7" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#31559C" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1E386B" stopOpacity="1" />
          </linearGradient>

          {/* Mid-range Teal Hill Gradient */}
          <linearGradient id="midTealHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#0D9488" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="1" />
          </linearGradient>

          {/* Foreground Lush Green Hills Gradient */}
          <linearGradient id="greenHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2ECC71" />
            <stop offset="45%" stopColor="#22C55E" />
            <stop offset="85%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Snowcap highlight */}
          <linearGradient id="snowcapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#BFDBFE" />
          </linearGradient>
        </defs>

        {/* --------------------------------------------------------------------- */}
        {/* 1. LAYER A: DISTANT MAJESTIC ALPINE PEAKS WITH SNOWCAPS               */}
        {/* --------------------------------------------------------------------- */}
        <g>
          {/* Broad, gently rolling blue mountain peaks */}
          <path
            d="M 0,280 
               L 0,160 
               C 70,150 140,75 250,75 
               C 340,75 410,135 500,135 
               C 580,135 660,65 760,65 
               C 870,65 940,125 1030,125 
               C 1120,125 1190,75 1270,75 
               C 1340,75 1395,120 1440,140 
               L 1440,280 Z"
            fill="url(#distantAlpineGrad)"
            stroke="#102040"
            strokeWidth="2"
          />

          {/* Peak 1 Snowcap */}
          <path
            d="M 215,95 Q 250,75 285,95 Q 268,105 250,98 Q 232,105 215,95 Z"
            fill="url(#snowcapGrad)"
            stroke="#102040"
            strokeWidth="1.5"
            opacity="0.9"
          />

          {/* Peak 2 Snowcap (Center Hero Peak) */}
          <path
            d="M 720,85 Q 760,65 800,85 Q 780,96 760,88 Q 740,96 720,85 Z"
            fill="url(#snowcapGrad)"
            stroke="#102040"
            strokeWidth="1.5"
            opacity="0.9"
          />

          {/* Peak 3 Snowcap */}
          <path
            d="M 1235,95 Q 1270,75 1305,95 Q 1288,105 1270,98 Q 1252,105 1235,95 Z"
            fill="url(#snowcapGrad)"
            stroke="#102040"
            strokeWidth="1.5"
            opacity="0.9"
          />
        </g>

        {/* --------------------------------------------------------------------- */}
        {/* 2. LAYER B: MID-DISTANCE TEAL ROLLING HILLS                           */}
        {/* --------------------------------------------------------------------- */}
        <g opacity="0.8">
          <path
            d="M 0,280 
               L 0,185 
               C 60,185 110,120 190,120 
               C 280,120 350,175 440,175 
               C 530,175 600,115 690,115 
               C 780,115 850,165 940,165 
               C 1020,165 1090,125 1170,125 
               C 1250,125 1320,160 1440,160 
               L 1440,280 Z"
            fill="url(#midTealHillsGrad)"
            stroke="#102040"
            strokeWidth="2"
          />
        </g>

        {/* --------------------------------------------------------------------- */}
        {/* 3. LAYER C: FOREGROUND LUSH GREEN ROLLING DUNES WITH SOFT CREST LIGHTS */}
        {/* --------------------------------------------------------------------- */}
        <g>
          {/* Main rolling green hills body with gentle Mario World curves */}
          <path
            d="M 0,280 
               L 0,195 
               C 50,195 90,140 150,140 
               C 220,140 290,190 380,190 
               C 470,190 520,135 590,135 
               C 670,135 740,185 820,185 
               C 900,185 960,140 1040,140 
               C 1120,140 1180,180 1250,180 
               C 1310,180 1350,165 1400,165 
               C 1420,165 1435,170 1440,172 
               L 1440,280 Z"
            fill="url(#greenHillsGrad)"
            stroke="#102040"
            strokeWidth="2"
          />

          {/* Soft Hilltop Crest Highlights (Super Mario World style) */}
          <path
            d="M 85,155 C 115,140 150,140 210,148"
            stroke="#86EFAC"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 520,150 C 555,135 590,135 655,145"
            stroke="#86EFAC"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 970,152 C 1005,140 1040,140 1105,148"
            stroke="#86EFAC"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 1340,172 C 1370,165 1400,165 1435,170"
            stroke="#86EFAC"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
        </g>

        {/* Continuous Ground Baseline (y = 279) */}
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
