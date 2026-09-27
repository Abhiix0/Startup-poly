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
        <PixelStar size={starSizes[size]} className="anim-star-twinkle" />
        <StartupolyLogo size={size} />
        <PixelStar size={starSizes[size]} className="anim-star-twinkle" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Subtitle Badge: DREAM · BUILD · GROW */}
      {showSubtitle && (
        <div
          className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-brand-navy border-2 border-brand-gold rounded-sm shadow-[2px_2px_0px_var(--color-brand-brick)]"
        >
          <span className="font-pixel text-[10px] md:text-xs text-brand-white tracking-widest font-bold">
            ★ DREAM · BUILD · GROW ★
          </span>
        </div>
      )}
    </div>
  );
};
