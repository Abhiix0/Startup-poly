import React from 'react';
import { PixelPoly, PixelBrickTile } from './pixel';
import { useDelayedFlag } from './useDelayedFlag';

export interface PixelLoaderProps {
  label?: string;
  delayMs?: number;
  className?: string;
}

export const PixelLoader: React.FC<PixelLoaderProps> = ({
  label = 'LOADING GAME WORLD…',
  delayMs = 250,
  className = '',
}) => {
  const isReadyToShow = useDelayedFlag(true, delayMs);

  if (!isReadyToShow) {
    return null;
  }

  return (
    <div
      className={`min-h-screen bg-nes-sky flex items-center justify-center p-4 selection:bg-[#FFCC00] selection:text-[#102040] ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="bg-[#FAF8F5] border-4 border-[#102040] shadow-[6px_6px_0px_#102040] p-6 max-w-sm w-full text-center flex flex-col items-center">
        {/* Header Wordmark */}
        <span
          className="font-pixel text-xs sm:text-sm text-[#FFCC00] uppercase tracking-wider mb-3 select-none"
          style={{
            textShadow: '2px 2px 0 #B84418, 3px 3px 0 #102040',
          }}
        >
          STARTUPOLY
        </span>

        {/* Mascot walking on brick strip */}
        <div className="relative mb-3 flex flex-col items-center">
          <PixelPoly size={44} animation="walk" />
          <div className="w-24 mt-1">
            <PixelBrickTile hasGrass={true} className="h-4 w-full" />
          </div>
        </div>

        {/* Stepped 10-Segment Indeterminate Progress Bar */}
        <div
          className="w-full max-w-[200px] h-5 bg-[#102040] border-2 border-[#102040] p-0.5 mb-3 flex gap-0.5 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-full bg-[#FFCC00] anim-progress-segment"
              style={{
                animationDelay: `${idx * 120}ms`,
              }}
            />
          ))}
        </div>

        {/* Label */}
        <p className="font-pixel text-[10px] text-[#102040] uppercase tracking-wider loader-label">
          {label}
        </p>
      </div>
    </div>
  );
};
