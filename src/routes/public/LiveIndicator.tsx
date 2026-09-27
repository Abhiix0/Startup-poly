import React from 'react';

export interface LiveIndicatorProps {
  className?: string;
  isFirstVisit?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  className = '',
  isFirstVisit = false,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-nes-navy border border-nes-green rounded-sm shadow-[1px_1px_0px_var(--color-nes-navy)] select-none ${
        isFirstVisit ? 'anim-boot-live-indicator' : ''
      } ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-nes-green anim-live-dot shrink-0"
        aria-hidden="true"
      />
      <span className="font-pixel text-[8px] sm:text-[9px] text-parchment-light tracking-wider font-bold uppercase">
        LIVE
      </span>
    </div>
  );
};
