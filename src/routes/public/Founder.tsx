import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PixelMario, MarioExpression } from '../../ui/pixel';
import { useFirstVisit } from '../../lib/useFirstVisit';

export interface FounderProps {
  size?: number;
  className?: string;
  initialPhase?: 'enter' | 'idle';
  isPaused?: boolean;
  platformOffset?: number;
  maxDistance?: number;
}

const SLOGANS = [
  "LET'S GO!",
  "BUILD YOUR DREAM!",
  "READY TO PLAY?",
  "STARTUPOLY!",
];

const SLOGAN_TO_EXPRESSION: Record<string, MarioExpression> = {
  "LET'S GO!": 'wave',
  "BUILD YOUR DREAM!": 'confident',
  "READY TO PLAY?": 'point',
  "STARTUPOLY!": 'celebrate',
};

export const Founder: React.FC<FounderProps> = React.memo(({
  size = 40,
  className = '',
  initialPhase,
  isPaused = false,
  platformOffset = 180,
  maxDistance = 280,
}) => {
  const { isFirstVisit } = useFirstVisit();
  const [phase, setPhase] = useState<'enter' | 'idle'>(() =>
    initialPhase !== undefined ? initialPhase : (isFirstVisit ? 'enter' : 'idle')
  );
  const [sloganIndex, setSloganIndex] = useState(0);
  const [marioTransform, setMarioTransform] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);

  // Position, direction, and timing refs (immune to cursor movements and parent re-renders)
  const currentXRef = useRef<number>(0);
  const directionRef = useRef<1 | -1>(1);
  const lastTimeRef = useRef<number | null>(null);
  const lastJumpStateRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  // Store latest bounds in refs so RAF always sees current responsive values without restarting
  const boundsRef = useRef({ platformOffset, maxDistance });
  useEffect(() => {
    boundsRef.current = { platformOffset, maxDistance };
  }, [platformOffset, maxDistance]);

  // Safety fallback: switch to idle if animationend never fires
  useEffect(() => {
    if (phase === 'enter' && !isPaused) {
      const timer = setTimeout(() => {
        setPhase('idle');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, isPaused]);

  const handleAnimationEnd = useCallback(() => {
    setPhase('idle');
  }, []);

  // Continuous animation loop: independent of cursor movement, mouse events, or CTA hovers
  useEffect(() => {
    if (isPaused || phase !== 'idle') return;

    const SPEED = 135; // Pixels per second: brisk, smooth retro platformer running pace

    const updateFrame = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      const { maxDistance: maxDist, platformOffset: pOffset } = boundsRef.current;
      const jumpStart = pOffset - 28;
      const jumpEnd = pOffset + 52 + 10;
      const jumpSpan = jumpEnd - jumpStart; // 90px obstacle jump span

      let x = currentXRef.current + directionRef.current * SPEED * dt;
      let dir = directionRef.current;

      // Smooth corner-to-corner reversal
      if (dir === 1 && x >= maxDist) {
        x = maxDist;
        directionRef.current = -1;
        setFacingLeft(true);
      } else if (dir === -1 && x <= 0) {
        x = 0;
        directionRef.current = 1;
        setFacingLeft(false);
      }

      currentXRef.current = x;

      // Jump behavior: Mario jumps ONLY at the actual green platform obstacle
      let jumping = false;
      let y = 0;

      if (x >= jumpStart && x <= jumpEnd) {
        jumping = true;
        let p = 0;
        if (dir === 1) {
          p = (x - jumpStart) / jumpSpan;
        } else {
          p = (jumpEnd - x) / jumpSpan;
        }
        p = Math.max(0, Math.min(1, p));
        // Parabolic arc: peak elevation 46px directly over platform center
        y = -Math.sin(p * Math.PI) * 46;
      } else {
        jumping = false;
        y = 0;
      }

      // Landing transition: when Mario lands after jumping, rotate to next slogan & expression
      if (lastJumpStateRef.current && !jumping) {
        setSloganIndex((prev) => (prev + 1) % SLOGANS.length);
      }
      lastJumpStateRef.current = jumping;

      setMarioTransform({ x, y });
      setIsJumping(jumping);

      rafIdRef.current = requestAnimationFrame(updateFrame);
    };

    rafIdRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [isPaused, phase]);

  const currentSlogan = SLOGANS[sloganIndex];
  const currentExpression = SLOGAN_TO_EXPRESSION[currentSlogan] || 'normal';

  return (
    <div
      data-phase={phase}
      data-paused={isPaused ? 'true' : undefined}
      className={`founder-wrapper relative select-none pointer-events-none flex flex-col items-center ${className}`}
      aria-hidden="true"
    >
      {/* Mario Motion Track: translated position driven continuously across ground */}
      <div
        onAnimationEnd={handleAnimationEnd}
        className={`founder-motion-track relative flex flex-col items-center ${
          isPaused
            ? ''
            : phase === 'enter'
            ? 'anim-founder-walk-in'
            : 'anim-founder-idle-bob'
        }`}
        style={
          phase === 'idle'
            ? {
                transform: `translate3d(${marioTransform.x}px, ${marioTransform.y}px, 0)`,
                transition: 'none',
              }
            : undefined
        }
      >
        {/* Speech Bubble Anchor (moves with Character, hidden during jump) */}
        <div
          className={`founder-bubble-anchor absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex flex-col items-center pointer-events-none z-30 transition-all duration-150 ${
            isJumping ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`}
          style={{
            visibility: isJumping ? 'hidden' : 'visible',
          }}
        >
          {/* Cheerful Speech Bubble with Slogan matching Hand Movement */}
          <div className="bg-white border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-0.5 text-center whitespace-nowrap z-20">
            <span className="font-pixel text-[9px] sm:text-[10px] text-[#102040] font-bold tracking-wider">
              {currentSlogan}
            </span>
          </div>

          {/* Test hooks / reactive speech bubble variations */}
          <div className="sr-only founder-bubble-intro">Let's build!</div>
          <div className="sr-only founder-bubble-join">Let's go!</div>
          <div className="sr-only founder-bubble-admin">Control room</div>

          {/* Bubble Speech Tail */}
          <div className="founder-bubble-tail w-2 h-1 bg-[#102040]" />
        </div>

        {/* Character Facing Direction & Sprite Container */}
        <div className="founder-character-container flex items-center justify-center">
          <PixelMario
            size={size}
            isStrip={true}
            stripAnimation={isJumping ? 'hop' : 'walk'}
            flipX={facingLeft}
            expression={currentExpression}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
});

Founder.displayName = 'Founder';
