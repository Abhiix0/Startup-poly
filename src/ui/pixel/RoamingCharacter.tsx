import React, { useState, useEffect, useRef } from 'react';
import { PixelMario } from './PixelMario';

export interface RoamingCharacterProps {
  size?: number;
  bubbleText?: string;
  isCheering?: boolean;
  className?: string;
  variant?: 'admin' | 'player';
  hasObstacle?: boolean;
  obstacleX?: number;
  obstacleWidth?: number;
  minX?: number;
  maxX?: number;
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
  hasObstacle = false,
  obstacleX,
  obstacleWidth = 60,
  minX,
  maxX,
}) => {
  const slogans = variant === 'player' ? DEFAULT_PLAYER_SLOGANS : DEFAULT_ADMIN_SLOGANS;
  const [sloganIndex, setSloganIndex] = useState(0);
  const [facingLeft, setFacingLeft] = useState(hasObstacle);
  const [marioTransform, setMarioTransform] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);

  // Position, direction, and RAF refs
  const currentXRef = useRef<number>(
    hasObstacle
      ? typeof window !== 'undefined'
        ? Math.min(Math.max(window.innerWidth * 0.45, 160), 400)
        : 220
      : 0
  );
  const directionRef = useRef<1 | -1>(hasObstacle ? -1 : 1);
  const lastTimeRef = useRef<number | null>(null);
  const lastSloganTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Responsive boundary references
  const configRef = useRef({
    hasObstacle,
    obstacleX,
    obstacleWidth,
    minX,
    maxX,
    size,
  });

  useEffect(() => {
    configRef.current = {
      hasObstacle,
      obstacleX,
      obstacleWidth,
      minX,
      maxX,
      size,
    };
  }, [hasObstacle, obstacleX, obstacleWidth, minX, maxX, size]);

  useEffect(() => {
    if (isCheering) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    const SPEED = 105; // Smooth retro walking pace (px/sec)

    const updateFrame = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // Rotate slogan every 3.2s
      if (!bubbleText) {
        if (lastSloganTimeRef.current === 0) {
          lastSloganTimeRef.current = now;
        } else if (now - lastSloganTimeRef.current >= 3200) {
          lastSloganTimeRef.current = now;
          setSloganIndex((prev) => (prev + 1) % slogans.length);
        }
      }

      const cfg = configRef.current;
      const winW = typeof window !== 'undefined' ? window.innerWidth : 500;

      // Safe screen boundaries ensuring Mario stays strictly in-frame at all times
      const effectiveMinX = cfg.minX !== undefined ? cfg.minX : cfg.hasObstacle ? 12 : 0;
      const effectiveMaxX =
        cfg.maxX !== undefined
          ? cfg.maxX
          : cfg.hasObstacle
          ? Math.max(winW - cfg.size - 16, 200)
          : Math.min(Math.max(winW * 0.45, 260), 550);

      let x = currentXRef.current + directionRef.current * SPEED * dt;
      let dir = directionRef.current;

      // Turn around cleanly at screen bounds (never go out of frame)
      if (dir === 1 && x >= effectiveMaxX) {
        x = effectiveMaxX;
        directionRef.current = -1;
        setFacingLeft(true);
      } else if (dir === -1 && x <= effectiveMinX) {
        x = effectiveMinX;
        directionRef.current = 1;
        setFacingLeft(false);
      }

      currentXRef.current = x;

      // JUMP ONLY WHEN ENCOUNTERING AN OBSTACLE
      let jumping = false;
      let y = 0;

      if (cfg.hasObstacle) {
        // Warp pipe obstacle center on left side
        const pipeLeft =
          cfg.obstacleX !== undefined
            ? cfg.obstacleX
            : winW >= 1024
            ? 40
            : winW >= 640
            ? 24
            : 8;
        const pipeWidth = cfg.obstacleWidth;
        const jumpStart = pipeLeft + pipeWidth + 12;
        const jumpEnd = Math.max(effectiveMinX, pipeLeft - 10);
        const jumpSpan = Math.max(jumpStart - jumpEnd, 30);

        if (x >= jumpEnd && x <= jumpStart) {
          jumping = true;
          const p = dir === 1 ? (x - jumpEnd) / jumpSpan : (jumpStart - x) / jumpSpan;
          const clampedP = Math.max(0, Math.min(1, p));
          // Clean parabolic jump clearing the pipe
          y = -Math.sin(clampedP * Math.PI) * 50;
        } else {
          jumping = false;
          y = 0;
        }
      } else {
        // Flat ground walking (e.g. admin console) -> ZERO random jumps
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
  }, [isCheering, bubbleText, slogans.length]);

  const activeMessage = bubbleText || slogans[sloganIndex];

  return (
    <div
      data-phase="idle"
      className={`relative select-none pointer-events-none flex flex-col z-20 ${className}`}
      aria-hidden="true"
    >
      {/* Motion Track (Paces smoothly back and forth along ground, jumps ONLY at obstacle) */}
      <div
        className={`founder-motion-track relative flex flex-col items-center will-change-transform ${
          isCheering ? 'anim-poly-hop' : ''
        }`}
        style={{
          transform: `translate3d(${marioTransform.x}px, ${marioTransform.y}px, 0)`,
        }}
      >
        {/* Speech Bubble (Always upright, moves smoothly with Mario) */}
        {activeMessage && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex flex-col items-center pointer-events-none whitespace-nowrap z-30 transition-all duration-150">
            <div className="bg-white border-2 border-[#102040] shadow-[2px_2px_0px_#102040] px-2.5 py-0.5 text-center max-w-[170px] sm:max-w-none">
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#102040] font-bold block truncate tracking-wider">
                {activeMessage}
              </span>
            </div>
            {/* Bubble Tail */}
            <div className="w-1.5 h-1 bg-[#102040]" />
          </div>
        )}

        {/* Facing Direction Controller & Mario Sprite */}
        <div
          className="founder-character-container flex items-center justify-center transition-transform duration-75"
          style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
        >
          <PixelMario
            size={size}
            isStrip={true}
            stripAnimation={isCheering || isJumping ? 'hop' : 'walk'}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
