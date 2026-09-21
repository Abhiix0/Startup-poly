import React, { useState, useEffect, useCallback } from 'react';
import { PixelPoly } from '../../ui/pixel';
import { useFirstVisit } from '../../lib/useFirstVisit';

export interface FounderProps {
  size?: number;
  className?: string;
}

export const Founder: React.FC<FounderProps> = ({
  size = 40,
  className = '',
}) => {
  const { isFirstVisit } = useFirstVisit();
  const [phase, setPhase] = useState<'enter' | 'idle'>(() =>
    isFirstVisit ? 'enter' : 'idle'
  );

  // Safety fallback: switch to idle if animationend never fires (e.g. background tab)
  useEffect(() => {
    if (phase === 'enter') {
      const timer = setTimeout(() => {
        setPhase('idle');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleAnimationEnd = useCallback(() => {
    setPhase('idle');
  }, []);

  return (
    <div
      data-phase={phase}
      className={`founder-wrapper relative select-none pointer-events-none flex flex-col items-center ${className}`}
      aria-hidden="true"
    >
      {/* Speech Bubble Anchor */}
      <div className="founder-bubble-anchor absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center">
        {/* Intro speech bubble ("Let's build!") */}
        <div className="founder-bubble-intro bg-white border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-1 text-center whitespace-nowrap">
          <span className="font-pixel text-[10px] text-[#102040] font-bold">
            Let's build!
          </span>
        </div>

        {/* Join reaction speech bubble ("Let's go!") */}
        <div className="founder-bubble-join bg-white border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-1 text-center whitespace-nowrap">
          <span className="font-pixel text-[10px] text-[#102040] font-bold">
            Let's go!
          </span>
        </div>

        {/* Admin reaction speech bubble ("Control room") */}
        <div className="founder-bubble-admin bg-white border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-1 text-center whitespace-nowrap">
          <span className="font-pixel text-[10px] text-[#102040] font-bold">
            Control room
          </span>
        </div>

        {/* Bubble Speech Tail */}
        <div className="founder-bubble-tail w-2 h-1 bg-[#102040]" />
      </div>

      {/* Poly Walk-in / Idle Motion Wrapper */}
      <div
        onAnimationEnd={handleAnimationEnd}
        className={`founder-motion-track ${phase === 'enter' ? 'anim-founder-walk-in' : 'anim-founder-idle-bob'}`}
      >
        <PixelPoly
          size={size}
          animation={phase === 'enter' ? 'walk' : 'idle'}
          className="shrink-0"
        />
      </div>
    </div>
  );
};
