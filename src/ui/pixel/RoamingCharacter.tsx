import React from 'react';
import { PixelPoly } from './PixelPoly';

export interface RoamingCharacterProps {
  size?: number;
  bubbleText?: string;
  isCheering?: boolean;
  className?: string;
}

export const RoamingCharacter: React.FC<RoamingCharacterProps> = ({
  size = 52,
  bubbleText,
  isCheering = false,
  className = '',
}) => {
  return (
    <div
      data-phase="idle"
      className={`relative select-none pointer-events-none flex flex-col items-center z-20 ${className}`}
      aria-hidden="true"
    >
      {/* Motion Track (Paces back and forth along ground) */}
      <div
        className={`founder-motion-track relative flex flex-col items-center ${
          isCheering ? 'anim-poly-hop' : 'anim-founder-idle-bob anim-founder-roam'
        }`}
      >
        {/* Speech Bubble (Always faces upright, moves with character) */}
        {bubbleText && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
            <div className="bg-white border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-1 text-center max-w-[140px] sm:max-w-none">
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#102040] font-bold block truncate">
                {bubbleText}
              </span>
            </div>
            {/* Bubble Tail */}
            <div className="w-1.5 h-1 bg-[#102040]" />
          </div>
        )}

        {/* Facing Direction Controller */}
        <div className="founder-character-container flex items-center justify-center">
          <PixelPoly
            size={size}
            animation={isCheering ? 'hop' : 'idle'}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
