import React from 'react';

export const DistantHillsAndCastle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* ======================================================================= */}
      {/* LAYER: Background Blue Mountain Silhouettes                             */}
      {/* ======================================================================= */}
      <svg
        viewBox="0 0 1440 280"
        className="w-full h-44 sm:h-60 md:h-72 lg:h-80 object-cover object-bottom"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="distantBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A80E8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#356BD6" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="greenHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#15803D" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Far Background Blue Mountain Peaks */}
        <path
          d="M 0,280 L 0,170 Q 160,80 320,160 T 640,130 T 960,170 T 1280,120 T 1440,160 L 1440,280 Z"
          fill="url(#distantBlueGrad)"
        />

        {/* Mid-Distant Rolling Green Rounded Hills */}
        <path
          d="M 0,280 L 0,200 Q 140,120 280,195 T 560,150 T 840,205 T 1120,160 Q 1280,215 1440,230 L 1440,280 Z"
          fill="url(#greenHillsGrad)"
        />
      </svg>

      {/* ======================================================================= */}
      {/* LAYER: Majestic Castle Fortress Silhouette (Elevated and Visible)        */}
      {/* ======================================================================= */}
      <div className="hidden sm:block absolute bottom-14 sm:bottom-18 lg:bottom-22 right-4 sm:right-8 lg:right-12 z-0">
        <div className="relative flex flex-col items-center">
          {/* Main Central Castle Tower with Flag */}
          <div className="relative flex flex-col items-center">
            {/* Flagpole mounted right in the center of the conical roof peak */}
            <div className="relative flex items-end justify-center -mb-0.5">
              <div className="w-1.5 h-10 bg-[#102040] rounded-t-sm" />
              {/* Triangular Flag attached at the top of the pole extending right */}
              <div className="absolute top-0 left-1">
                <svg
                  width="28"
                  height="18"
                  viewBox="0 0 28 18"
                  fill="none"
                  className="anim-flag-flutter origin-left"
                >
                  <path d="M0 0 L28 9 L0 18 Z" fill="#E11D48" stroke="#102040" strokeWidth="2" />
                  <path d="M0 2 L20 9 L0 11 Z" fill="#FB7185" />
                  <rect x="4" y="7" width="4" height="4" fill="#FFCC00" />
                </svg>
              </div>
            </div>

            {/* Conical Roof / Battlements */}
            <div className="w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-b-[26px] border-b-[#334155]" />
            <div className="w-13 h-4 bg-[#334155] border-x-2 border-[#102040] flex justify-between px-1">
              <div className="w-2 h-2 bg-[#102040]" />
              <div className="w-2 h-2 bg-[#102040]" />
              <div className="w-2 h-2 bg-[#102040]" />
            </div>

            {/* Central Tower Body with Arched Windows */}
            <div className="w-11 h-28 bg-[#334155] border-x-2 border-[#102040] flex flex-col items-center pt-3 gap-2">
              <div className="w-3.5 h-6 bg-[#102040] rounded-t-sm" />
              <div className="w-3 h-5 bg-[#102040] rounded-t-sm" />
            </div>
          </div>

          {/* Left & Right Flanking Turrets with Battlements */}
          <div className="w-36 h-20 bg-[#334155] border-t-2 border-x-2 border-[#102040] flex justify-between items-start -mt-18 px-2">
            {/* Left Turret Top */}
            <div className="flex flex-col items-center -mt-7">
              <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[18px] border-b-[#334155]" />
              <div className="w-7 h-3 bg-[#334155] border-x-2 border-[#102040]" />
              <div className="w-2.5 h-4 bg-[#102040] rounded-t-sm mt-1" />
            </div>

            {/* Castle Main Gate / Portcullis */}
            <div className="w-8 h-12 bg-[#102040] rounded-t-md self-end flex items-center justify-center">
              <div className="w-6 h-9 border-t border-x border-[#64748B] rounded-t-sm opacity-60" />
            </div>

            {/* Right Turret Top */}
            <div className="flex flex-col items-center -mt-7">
              <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[18px] border-b-[#334155]" />
              <div className="w-7 h-3 bg-[#334155] border-x-2 border-[#102040]" />
              <div className="w-2.5 h-4 bg-[#102040] rounded-t-sm mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
