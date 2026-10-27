import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PixelMario } from '../../ui/pixel';
import { useFirstVisit } from '../../lib/useFirstVisit';

export interface FounderProps {
  size?: number;
  className?: string;
  initialPhase?: 'enter' | 'idle';
  isPaused?: boolean;
  platformOffset?: number;
  maxDistance?: number;
  launchTarget?: 'join' | 'admin' | null;
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

export const Founder: React.FC<FounderProps> = React.memo(({
  size = 40,
  className = '',
  initialPhase,
  isPaused = false,
  platformOffset = 180,
  maxDistance = 280,
  launchTarget = null,
}) => {
  const { isFirstVisit } = useFirstVisit();
  const [phase, setPhase] = useState<'enter' | 'idle'>(() =>
    initialPhase !== undefined ? initialPhase : (isFirstVisit ? 'enter' : 'idle')
  );
  const [sloganIndex, setSloganIndex] = useState(0);
  const [marioTransform, setMarioTransform] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [launchStyle, setLaunchStyle] = useState<{
    transform: string;
    transition: string;
  } | null>(null);

  // Position, direction, and timing refs (immune to cursor movements and parent re-renders)
  const currentXRef = useRef<number>(0);
  const directionRef = useRef<1 | -1>(1);
  const lastTimeRef = useRef<number | null>(null);
  const lastJumpStateRef = useRef<boolean>(false);
  const lastSloganTimeRef = useRef<number>(0);
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

  // Handle Mario jumping up towards Team Phone or Admin Console upon click
  useEffect(() => {
    if (launchTarget) {
      const curX = currentXRef.current;
      const targetDeltaX = launchTarget === 'join' ? -70 : 180;
      setIsJumping(true);
      if (launchTarget === 'join') {
        setFacingLeft(true);
      } else {
        setFacingLeft(false);
      }
      const animId = requestAnimationFrame(() => {
        setLaunchStyle({
          transform: `translate3d(${curX + targetDeltaX}px, -400px, 0) scale(1.35) ${
            launchTarget === 'join' ? 'rotate(-8deg)' : 'rotate(8deg)'
          }`,
          transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
        });
      });
      return () => cancelAnimationFrame(animId);
    } else {
      setLaunchStyle(null);
    }
  }, [launchTarget]);

  // Continuous animation loop: independent of cursor movement, mouse events, or CTA hovers
  useEffect(() => {
    if (isPaused || phase !== 'idle' || launchTarget) return;

    const SPEED = 150; // Pixels per second: brisk, natural retro running pace

    const updateFrame = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // Cycle speech bubble slogan every 3.2s
      if (lastSloganTimeRef.current === 0) {
        lastSloganTimeRef.current = now;
      } else if (now - lastSloganTimeRef.current >= 3200) {
        lastSloganTimeRef.current = now;
        setSloganIndex((prev) => (prev + 1) % SLOGANS.length);
      }

      const { maxDistance: maxDist, platformOffset: pOffset } = boundsRef.current;
      // Obstacle bounds (green platform / pipe zone)
      const obstacleWidth = 56;
      const jumpStart = Math.max(24, pOffset - 20);
      const jumpEnd = jumpStart + obstacleWidth + 30;
      const jumpSpan = jumpEnd - jumpStart;

      let x = currentXRef.current + directionRef.current * SPEED * dt;
      let dir = directionRef.current;

      // Mario goes straight, hits the boundary, turns around, and returns
      if (dir === 1 && x >= maxDist) {
        x = maxDist;
        directionRef.current = -1;
        dir = -1;
        setFacingLeft(true);
      } else if (dir === -1 && x <= 0) {
        x = 0;
        directionRef.current = 1;
        dir = 1;
        setFacingLeft(false);
      }

      currentXRef.current = x;

      // Jump behavior: jumps smoothly ONLY when encountering the obstacle
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
        // Parabolic arc: peak elevation 42px directly over obstacle center
        y = -Math.sin(p * Math.PI) * 42;
      } else {
        jumping = false;
        y = 0;
      }

      // Maintain strictly accurate sprite facing orientation matching direction (no backward walking)
      if (dir === 1 && facingLeft) {
        setFacingLeft(false);
      } else if (dir === -1 && !facingLeft) {
        setFacingLeft(true);
      }

      // Rotate slogan upon landing
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
  }, [isPaused, phase, launchTarget]);

  const currentSlogan = SLOGANS[sloganIndex];

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
          launchStyle
            ? {
                transform: launchStyle.transform,
                transition: launchStyle.transition,
                willChange: 'transform',
              }
            : phase === 'idle'
            ? {
                transform: `translate3d(${marioTransform.x}px, ${marioTransform.y}px, 0)`,
                transition: 'none',
              }
            : undefined
        }
      >
        {/* Speech Bubble Anchor (moves with Character, stays visible and highlights during launch) */}
        <div
          className={`founder-bubble-anchor absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex flex-col items-center pointer-events-none z-30 transition-all duration-150 ${
            launchTarget
              ? 'opacity-100 scale-100'
              : isJumping
              ? 'opacity-0 scale-75'
              : 'opacity-100 scale-100'
          }`}
          style={{
            visibility: isJumping && !launchTarget ? 'hidden' : 'visible',
          }}
        >
          {/* Cheerful Speech Bubble with Slogan */}
          <div
            className={`border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-0.5 text-center whitespace-nowrap z-20 ${
              launchTarget ? 'bg-[#FFCC00] text-[#102040]' : 'bg-white text-[#102040]'
            }`}
          >
            <span className="font-pixel text-[9px] sm:text-[10px] font-bold tracking-wider">
              {launchTarget === 'join'
                ? "LET'S GO!! 🍄"
                : launchTarget === 'admin'
                ? 'WARP ADMIN! ⚡'
                : currentSlogan}
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
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
});

Founder.displayName = 'Founder';
