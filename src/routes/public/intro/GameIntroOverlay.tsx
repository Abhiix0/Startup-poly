import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PixelMario, MarioPose } from '../../../ui/pixel/PixelMario';
import { LogoShatter } from './LogoShatter';

export interface GameIntroOverlayProps {
  onComplete: () => void;
}

export type IntroStage =
  | 'blue'
  | 'logo_enter'
  | 'logo_settled'
  | 'mario_run'
  | 'mario_dash'
  | 'impact'
  | 'follow_descent'
  | 'landed'
  | 'complete';

export const GameIntroOverlay: React.FC<GameIntroOverlayProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>('blue');
  const [marioPose, setMarioPose] = useState<MarioPose>('run-1');
  const [marioX, setMarioX] = useState<number>(-16); // Percentage across screen (-16% to 75%)
  const [marioY, setMarioY] = useState<number>(36);  // Percentage down screen (36% logo level -> 86% ground)
  const [cameraProgress, setCameraProgress] = useState<number>(0); // 0 (intro title) to 1 (ground world)
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);

  // Complete handler ensures onComplete only called once
  const completeIntro = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setStage('complete');
    onComplete();
  }, [onComplete]);

  // Fast-forward on Escape or Space
  const handleFastForward = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFastForward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFastForward]);

  // Master Intro & Camera Sequence Timeline
  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const t1 = setTimeout(() => setStage('logo_enter'), 80);
      const t2 = setTimeout(() => setCameraProgress(1), 900);
      const t3 = setTimeout(() => completeIntro(), 1300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    // 0.0s: Blue screen
    // 0.12s: Logo drops in
    const tLogoEnter = setTimeout(() => {
      setStage('logo_enter');
    }, 120);

    // 0.55s: Logo settles
    const tLogoSettled = setTimeout(() => {
      setStage('logo_settled');
    }, 550);

    // 0.82s: Mario enters running from off-screen left
    const tMarioEnter = setTimeout(() => {
      setStage('mario_run');
    }, 820);

    // 1.30s: Mario accelerates into high-speed DASH pose
    const tMarioDash = setTimeout(() => {
      setStage('mario_dash');
      setMarioPose('dash');
    }, 1300);

    // 1.62s: IMPACT! Mario smashes directly through the logo center
    const tImpact = setTimeout(() => {
      setStage('impact');
      setScreenShake(true);
    }, 1620);

    // 1.76s: Shake settles, Mario enters follow-descent towards the ground
    const tShakeStop = setTimeout(() => {
      setScreenShake(false);
      setStage('follow_descent');
    }, 1760);

    // 2.36s: Mario touches ground right beside the warp pipe
    const tLanded = setTimeout(() => {
      setStage('landed');
    }, 2360);

    // 2.42s: Clean continuous handoff to the landing world
    const tComplete = setTimeout(() => {
      completeIntro();
    }, 2420);

    return () => {
      clearTimeout(tLogoEnter);
      clearTimeout(tLogoSettled);
      clearTimeout(tMarioEnter);
      clearTimeout(tMarioDash);
      clearTimeout(tImpact);
      clearTimeout(tShakeStop);
      clearTimeout(tLanded);
      clearTimeout(tComplete);
    };
  }, [completeIntro]);

  // Continuous Camera & Mario Flight Path Animation
  useEffect(() => {
    if (stage === 'blue' || stage === 'logo_enter' || stage === 'logo_settled' || stage === 'complete') {
      return;
    }

    let animationFrameId: number;
    let startTime: number | null = null;

    // Sprite stride legs toggle
    let stepCount = 0;
    const stepInterval = setInterval(() => {
      if (stage === 'mario_run' || (stage === 'follow_descent' && marioPose !== 'jump')) {
        stepCount = (stepCount + 1) % 3;
        setMarioPose(stepCount === 0 ? 'run-1' : stepCount === 1 ? 'run-2' : 'run-3');
      }
    }, 80);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const groundTargetX = isMobile ? 68 : 74;
    const groundTargetY = isMobile ? 86 : 88;

    const animateMovement = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (stage === 'mario_run') {
        // Run from -16% to 22%
        const progress = Math.min(1, elapsed / 480);
        const currentX = -16 + (progress * progress) * 38;
        setMarioX(currentX);
        setMarioY(36);
      } else if (stage === 'mario_dash') {
        // High speed dash from 22% to 48% (into logo center)
        const progress = Math.min(1, elapsed / 320);
        const currentX = 22 + Math.pow(progress, 1.7) * 26;
        setMarioX(currentX);
        setMarioY(36);
      } else if (stage === 'impact') {
        // Blast through center
        setMarioX(49);
        setMarioY(36);
      } else if (stage === 'follow_descent') {
        // Continuous follow shot: Mario arcs down to groundTargetX, groundTargetY
        const duration = 600;
        const progress = Math.min(1, elapsed / duration);

        // First 250ms: heroic jump pose flying through the air
        if (elapsed < 240) {
          setMarioPose('jump');
        }

        // Horizontal glide
        const currentX = 49 + Math.pow(progress, 0.85) * (groundTargetX - 49);
        // Vertical arc with realistic gravity
        const currentY = 36 + Math.pow(progress, 1.35) * (groundTargetY - 36);

        setMarioX(currentX);
        setMarioY(currentY);

        // Camera tracks down alongside Mario
        setCameraProgress(progress);
      } else if (stage === 'landed') {
        setMarioX(groundTargetX);
        setMarioY(groundTargetY);
        setCameraProgress(1);
      }

      animationFrameId = requestAnimationFrame(animateMovement);
    };

    animationFrameId = requestAnimationFrame(animateMovement);

    return () => {
      clearInterval(stepInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [stage, marioPose]);

  if (stage === 'complete') {
    return null;
  }

  const isShattered = stage === 'impact' || stage === 'follow_descent' || stage === 'landed';
  const showLogo = stage !== 'blue';
  const showMario = stage !== 'blue' && stage !== 'logo_enter' && stage !== 'logo_settled';

  // Camera follow effect: As Mario descends, the blue curtain scrolls up & dissolves
  const backdropOpacity = Math.max(0, 1 - cameraProgress * 1.15);
  const backdropTranslateY = -cameraProgress * 40; // Subtle camera tilt upward as world arrives

  return (
    <div
      role="dialog"
      aria-label="Game Intro"
      aria-modal="true"
      onClick={handleFastForward}
      className={`fixed inset-0 z-50 flex flex-col select-none overflow-hidden pointer-events-none ${
        screenShake ? 'anim-intro-screen-shake' : ''
      }`}
    >
      {/* =================================================================== */}
      {/* CAMERA BACKDROP: Solid retro blue that lifts/fades to reveal world  */}
      {/* =================================================================== */}
      <div
        className="absolute inset-0 bg-[#5C94FC] pointer-events-auto transition-transform ease-out"
        style={{
          opacity: backdropOpacity,
          transform: `translate3d(0, ${backdropTranslateY}px, 0)`,
          willChange: 'opacity, transform',
        }}
      />

      {/* =================================================================== */}
      {/* TITLE LOGO ARENA (Positioned at 36% height where smash occurs)      */}
      {/* =================================================================== */}
      {showLogo && (
        <div
          className="absolute inset-x-0 flex items-center justify-center px-4"
          style={{
            top: '36%',
            transform: 'translateY(-50%)',
            opacity: Math.max(0, 1 - cameraProgress * 1.8),
          }}
        >
          <div
            className={`relative z-10 ${
              stage === 'logo_enter' ? 'anim-intro-logo-drop' : ''
            }`}
          >
            <LogoShatter shattered={isShattered} />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* CONTINUOUS MARIO FLIGHT TRACK                                      */}
      {/* Follows Mario from logo smash smoothly down to the ground pipe      */}
      {/* =================================================================== */}
      {showMario && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${marioX}%`,
            top: `${marioY}%`,
            transform: 'translate(-50%, -50%)',
            willChange: 'left, top',
          }}
        >
          {/* Dash speed puffs behind feet */}
          {stage === 'mario_dash' && (
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-white opacity-85 anim-dust-puff" />
              <div className="w-2.5 h-2.5 rounded-full bg-white opacity-65 anim-dust-puff" style={{ animationDelay: '0.04s' }} />
              <div className="w-2 h-2 rounded-full bg-white opacity-45 anim-dust-puff" style={{ animationDelay: '0.08s' }} />
            </div>
          )}

          {/* Touchdown ground dust puff when landing */}
          {(stage === 'landed' || (stage === 'follow_descent' && cameraProgress > 0.9)) && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              <div className="w-2.5 h-2 bg-white rounded-full opacity-80 animate-ping" />
              <div className="w-2.5 h-2 bg-white rounded-full opacity-80 animate-ping" />
            </div>
          )}

          {/* Heroic Mario Sprite: transitions smoothly down to ground size */}
          <div className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 flex items-center justify-center">
            <PixelMario
              size={cameraProgress > 0.8 ? 58 : 88}
              pose={marioPose}
              className="origin-bottom transition-all duration-150"
            />
          </div>
        </div>
      )}
    </div>
  );
};
