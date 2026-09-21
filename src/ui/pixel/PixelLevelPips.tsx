import React from 'react';

export interface PixelLevelPipsProps {
  level: number;
  className?: string;
}

export const PixelLevelPips: React.FC<PixelLevelPipsProps> = ({ level, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Pip 1 (Level >= 1) */}
      <div
        title={level >= 1 ? 'Level 1 Upgrade Active' : 'Level 1 Locked'}
        className={`
          w-4 h-4 border-2 border-[#102040] shadow-[1px_1px_0px_#102040] flex items-center justify-center font-pixel text-[8px]
          ${level >= 1 ? 'bg-[#22B14C] text-white' : 'bg-[#FAF8F5] text-[#CBD5E1]'}
        `}
      >
        {level >= 1 ? '★' : '·'}
      </div>

      {/* Pip 2 (Level >= 2) */}
      <div
        title={level >= 2 ? 'Level 2 Upgrade Active' : 'Level 2 Locked'}
        className={`
          w-4 h-4 border-2 border-[#102040] shadow-[1px_1px_0px_#102040] flex items-center justify-center font-pixel text-[8px]
          ${level >= 2 ? 'bg-[#FFCC00] text-[#102040]' : 'bg-[#FAF8F5] text-[#CBD5E1]'}
        `}
      >
        {level >= 2 ? '★' : '·'}
      </div>
    </div>
  );
};
