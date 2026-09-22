import React from 'react';

export const LiveIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#102040] border border-[#22B14C] rounded-sm shadow-[1px_1px_0px_#102040] select-none ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#22C55E] anim-live-dot shrink-0"
        aria-hidden="true"
      />
      <span className="font-pixel text-[8px] sm:text-[9px] text-[#FFFBEB] tracking-wider font-bold uppercase">
        LIVE
      </span>
    </div>
  );
};
