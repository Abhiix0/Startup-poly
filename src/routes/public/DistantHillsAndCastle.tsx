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
          d="M 0,280 L 0,200 Q 140,120 280,195 T 560,160 T 840,210 T 1120,165 T 1400,200 L 1440,200 L 1440,280 Z"
          fill="url(#greenHillsGrad)"
        />
      </svg>

      {/* ======================================================================= */}
      {/* LAYER: Distant Castle Fortress Silhouette (Far Right)                    */}
      {/* ======================================================================= */}
      <div className="hidden md:block absolute bottom-14 sm:bottom-18 lg:bottom-20 right-6 sm:right-12 lg:right-18 opacity-80">
        <div className="relative flex flex-col items-center">
          {/* Main Central Castle Tower */}
          <div className="relative flex flex-col items-center">
            {/* Waving Red Flag atop Tower */}
            <div className="flex items-center -mb-0.5 self-start ml-2">
              <div className="w-4 h-3 bg-[#D32F2F] border border-[#102040] anim-flag-flutter" />
              <div className="w-0.5 h-4 bg-[#102040]" />
            </div>

            {/* Conical Roof / Battlements */}
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[20px] border-b-[#334155]" />
            <div className="w-9 h-3.5 bg-[#334155] border-x-2 border-[#102040] flex justify-between px-0.5">
              <div className="w-1.5 h-1.5 bg-[#102040]" />
              <div className="w-1.5 h-1.5 bg-[#102040]" />
            </div>

            {/* Tower Body with Arched Window */}
            <div className="w-8 h-16 bg-[#334155] border-x-2 border-[#102040] flex flex-col items-center pt-2">
              <div className="w-2.5 h-5 bg-[#102040] rounded-t-sm" />
            </div>
          </div>

          {/* Left & Right Flanking Turrets */}
          <div className="w-24 h-12 bg-[#334155] border-t-2 border-x-2 border-[#102040] flex justify-between items-start -mt-10 px-1">
            {/* Left Turret Top */}
            <div className="flex flex-col items-center -mt-5">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-[#334155]" />
              <div className="w-5 h-2.5 bg-[#334155] border border-[#102040]" />
            </div>
            {/* Castle Gate Slit */}
            <div className="w-5 h-7 bg-[#102040] rounded-t-sm self-end" />
            {/* Right Turret Top */}
            <div className="flex flex-col items-center -mt-5">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-[#334155]" />
              <div className="w-5 h-2.5 bg-[#334155] border border-[#102040]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
