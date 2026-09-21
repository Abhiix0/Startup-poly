import React from 'react';

export const LiveIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#102040] border-2 border-[#22B14C] rounded-sm shadow-[2px_2px_0px_#102040] select-none ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full bg-[#22C55E] anim-live-dot shrink-0"
        aria-hidden="true"
      />
      <span className="font-pixel text-[9px] sm:text-[10px] text-[#FFFBEB] tracking-wider font-bold uppercase">
        LIVE SCOREBOARD
      </span>
    </div>
  );
};
