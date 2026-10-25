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
  "LET'S PLAY!",
  "BUILD YOUR DREAM!",
  "ROLL THE DICE!",
  "STARTUPOLY!",
  "RAISE CAPITAL!",
  "BUILD YOUR MVP!",
  "AVOID CRISIS!",
  "UNICORN STATUS!",
  "CHECK THE RULES!",
  "PIVOT FAST!",
  "SCALE UP!",
];

const SLOGAN_TO_EXPRESSION: Record<string, MarioExpression> = {
  "LET'S PLAY!": 'wave',
  "BUILD YOUR DREAM!": 'confident',
  "ROLL THE DICE!": 'point',
  "STARTUPOLY!": 'celebrate',
  "RAISE CAPITAL!": 'confident',
  "BUILD YOUR MVP!": 'wave',
  "AVOID CRISIS!": 'point',
  "UNICORN STATUS!": 'celebrate',
  "CHECK THE RULES!": 'point',
  "PIVOT FAST!": 'wave',
  "SCALE UP!": 'confident',
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

  // Position, direction, and timing refs (100% independent of mouse cursor)
  const currentXRef = useRef<number>(0);
  const directionRef = useRef<1 | -1>(1);
  const lastTimeRef = useRef<number | null>(null);
  const lastSloganTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Intentional jump physics state
  const jumpProgressRef = useRef<number | null>(null);
  const nextScriptedJumpTimeRef = useRef<number>(0);

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

  // Intentional keyboard jump control (Space or ArrowUp triggers an authentic high jump)
  useEffect(() => {
    if (isPaused || phase !== 'idle') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        // Trigger intentional jump only if currently grounded
        if (jumpProgressRef.current === null) {
          jumpProgressRef.current = 0;
          setIsJumping(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, phase]);

  // Autonomous animation loop: smooth, natural walking independent of mouse cursor
  useEffect(() => {
    if (isPaused || phase !== 'idle') return;

    const SPEED = 165; // Brisk, natural retro platformer run pace (slightly faster)
    const JUMP_DURATION = 0.55; // 550ms crisp parabolic jump duration

    const updateFrame = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
        nextScriptedJumpTimeRef.current = now + 9000; // First intentional jump in 9s
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // Constantly cycle speech bubble message every 3.2s
      if (lastSloganTimeRef.current === 0) {
        lastSloganTimeRef.current = now;
      } else if (now - lastSloganTimeRef.current >= 3200) {
        lastSloganTimeRef.current = now;
        setSloganIndex((prev) => (prev + 1) % SLOGANS.length);
      }

      const { maxDistance: maxDist } = boundsRef.current;
      let x = currentXRef.current + directionRef.current * SPEED * dt;
      let dir = directionRef.current;

      // Consistent walking boundaries with guaranteed correct sprite orientation
      if (dir === 1 && x >= maxDist) {
        x = maxDist;
        directionRef.current = -1;
        setFacingLeft(true); // Facing left when moving left
      } else if (dir === -1 && x <= 0) {
        x = 0;
        directionRef.current = 1;
        setFacingLeft(false); // Facing right when moving right
      }

      currentXRef.current = x;

      // Intentional jump behavior (controlled scripted jumps or user keypress)
      // Occasional scripted jump every 12 seconds
      if (jumpProgressRef.current === null && now >= nextScriptedJumpTimeRef.current) {
        jumpProgressRef.current = 0;
        nextScriptedJumpTimeRef.current = now + 12000;
      }

      let y = 0;
      let jumping = false;

      if (jumpProgressRef.current !== null) {
        jumping = true;
        jumpProgressRef.current += dt / JUMP_DURATION;
        const p = Math.min(1, jumpProgressRef.current);
        // Clean authentic parabolic arc with gravity feel (peak: -48px)
        y = -Math.sin(p * Math.PI) * 48;

        if (jumpProgressRef.current >= 1) {
          // Landed firmly on turf
          jumpProgressRef.current = null;
          jumping = false;
          y = 0;
          setSloganIndex((prev) => (prev + 1) % SLOGANS.length);
        }
      } else {
        // Flat ground walking: zero random hops
        jumping = false;
        y = 0;
      }

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
      {/* Mario Motion Track: translated position driven smoothly across ground */}
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
          {/* Cheerful Speech Bubble with Slogan */}
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

        {/* Character Facing Direction & Sprite Container (flips correctly with walking direction) */}
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
