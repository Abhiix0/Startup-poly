import React from 'react';
import { PixelStar } from './PixelStar';
import { StartupolyLogo } from './StartupolyLogo';

export const PixelLogo: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}> = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const starSizes = {
    sm: 18,
    md: 26,
    lg: 36,
  };

  return (
    <div className={`flex flex-col items-center select-none text-center ${className}`}>
      {/* Wordmark Container */}
      <div className="relative inline-flex items-center gap-2 md:gap-3">
        <PixelStar size={starSizes[size]} className="animate-bounce" />
        <StartupolyLogo size={size} />
        <PixelStar size={starSizes[size]} className="animate-bounce" />
      </div>

      {/* Subtitle Badge: DREAM · BUILD · GROW */}
      {showSubtitle && (
        <div
          className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#102040] border-2 border-[#FFCC00] rounded-sm shadow-[2px_2px_0px_#B84418]"
        >
          <span className="font-pixel text-[10px] md:text-xs text-[#FFFBEB] tracking-widest font-bold">
            ★ DREAM · BUILD · GROW ★
          </span>
        </div>
      )}
    </div>
  );
};
