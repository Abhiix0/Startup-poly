import React, { useState, useEffect } from 'react';
import { PixelMario } from './PixelMario';

export interface RoamingCharacterProps {
  size?: number;
  bubbleText?: string;
  isCheering?: boolean;
  className?: string;
  variant?: 'admin' | 'player';
}

const DEFAULT_ADMIN_SLOGANS = [
  'ADMIN READY!',
  'TEAMS JOINING!',
  'ROOM CODE ACTIVE!',
  'READY TO PLAY?',
  'MONITOR AUDIT!',
  'CHECK TEAM CV!',
  'MANAGE CRISIS!',
  'LET’S ROLL!',
];

const DEFAULT_PLAYER_SLOGANS = [
  "LET'S PLAY!",
  'JOIN YOUR TEAM!',
  'READY TO ROLL?',
  'BUILD YOUR MVP!',
  'STARTUPOLY!',
  'AVOID CRISIS!',
  'UNICORN STATUS!',
];

export const RoamingCharacter: React.FC<RoamingCharacterProps> = ({
  size = 48,
  bubbleText,
  isCheering = false,
  className = '',
  variant = 'admin',
}) => {
  const slogans = variant === 'player' ? DEFAULT_PLAYER_SLOGANS : DEFAULT_ADMIN_SLOGANS;
  const [sloganIndex, setSloganIndex] = useState(0);

  // Constantly cycle speech bubble message every 3.2s
  useEffect(() => {
    if (bubbleText) return;
    const interval = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [bubbleText, slogans.length]);

  const activeMessage = bubbleText || slogans[sloganIndex];

  return (
    <div
      data-phase="idle"
      className={`relative select-none pointer-events-none flex flex-col items-center z-20 ${className}`}
      aria-hidden="true"
    >
      {/* Motion Track (Paces smoothly back and forth along ground) */}
      <div
        className={`founder-motion-track relative flex flex-col items-center ${
          isCheering ? 'anim-poly-hop' : 'anim-founder-idle-bob anim-founder-roam'
        }`}
      >
        {/* Speech Bubble (Always faces upright, moves with character) */}
        {activeMessage && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex flex-col items-center pointer-events-none whitespace-nowrap z-30 transition-all duration-150">
            <div className="bg-white border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-0.5 text-center max-w-[160px] sm:max-w-none">
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#102040] font-bold block truncate tracking-wider">
                {activeMessage}
              </span>
            </div>
            {/* Bubble Tail */}
            <div className="w-1.5 h-1 bg-[#102040]" />
          </div>
        )}

        {/* Facing Direction Controller & Mario Sprite */}
        <div className="founder-character-container flex items-center justify-center">
          <PixelMario
            size={size}
            isStrip={true}
            stripAnimation={isCheering ? 'hop' : 'walk'}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
