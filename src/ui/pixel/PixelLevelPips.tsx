import React from 'react';

export interface PixelLevelPipsProps {
  level: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const PixelLevelPips: React.FC<PixelLevelPipsProps> = ({
  level,
  size = 'md',
  className = '',
}) => {
  const pipDim = size === 'sm' ? 'w-3 h-3 text-[7px]' : 'w-4 h-4 text-[8px]';

  return (
    <div className={`inline-flex items-center gap-1 select-none ${className}`}>
      {/* Pip 1 (Level >= 1) */}
      <div
        title={level >= 1 ? 'Level 1 Upgrade Active' : 'Level 1 Locked'}
        className={`
          ${pipDim} border border-[#102040] shadow-[1px_1px_0px_#102040] flex items-center justify-center font-pixel
          ${level >= 1 ? 'bg-[#22B14C] text-white' : 'bg-[#FAF8F5] text-[#CBD5E1]'}
        `}
      >
        {level >= 1 ? '★' : '·'}
      </div>

      {/* Pip 2 (Level >= 2) */}
      <div
        title={level >= 2 ? 'Level 2 Upgrade Active' : 'Level 2 Locked'}
        className={`
          ${pipDim} border border-[#102040] shadow-[1px_1px_0px_#102040] flex items-center justify-center font-pixel
          ${level >= 2 ? 'bg-[#FFCC00] text-[#102040]' : 'bg-[#FAF8F5] text-[#CBD5E1]'}
        `}
      >
        {level >= 2 ? '★' : '·'}
      </div>
    </div>
  );
};
