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
  | 'falling'
  | 'touchdown'
  | 'complete';

export const GameIntroOverlay: React.FC<GameIntroOverlayProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>('blue');
  const [marioPose, setMarioPose] = useState<MarioPose>('run-1');
  const [marioX, setMarioX] = useState<number>(-16); // Percentage across screen (-16% to ~75%)
  const [marioY, setMarioY] = useState<number>(33);  // Percentage down screen (33% logo level -> 88% ground)
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
    // 0.12s: Strong Hero Logo drops in
    const tLogoEnter = setTimeout(() => {
      setStage('logo_enter');
    }, 120);

    // 0.55s: Logo settles centered
    const tLogoSettled = setTimeout(() => {
      setStage('logo_settled');
    }, 550);

    // 0.95s: Mario enters running from off-screen left (gives user ~400ms to register large logo)
    const tMarioEnter = setTimeout(() => {
      setStage('mario_run');
    }, 950);

    // 1.40s: Mario accelerates into high-speed DASH pose with speed puffs
    const tMarioDash = setTimeout(() => {
      setStage('mario_dash');
      setMarioPose('dash');
    }, 1400);

    // 1.70s: IMPACT! Mario smashes directly through the center of the logo
    const tImpact = setTimeout(() => {
      setStage('impact');
      setScreenShake(true);
    }, 1700);

    // 1.84s: Screen shake settles; Mario starts falling down toward the ground world
    const tShakeStop = setTimeout(() => {
      setScreenShake(false);
      setStage('falling');
    }, 1840);

    // 2.45s: Mario hits the ground with tiny squash & dust
    const tTouchdown = setTimeout(() => {
      setStage('touchdown');
    }, 2450);

    // 2.58s: Seamless handoff to the ground character (exact same Mario in PixelWorld)
    const tComplete = setTimeout(() => {
      completeIntro();
    }, 2580);

    return () => {
      clearTimeout(tLogoEnter);
      clearTimeout(tLogoSettled);
      clearTimeout(tMarioEnter);
      clearTimeout(tMarioDash);
      clearTimeout(tImpact);
      clearTimeout(tShakeStop);
      clearTimeout(tTouchdown);
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

    // Sprite stride legs toggle for running phases
    let stepCount = 0;
    const stepInterval = setInterval(() => {
      if (stage === 'mario_run' || (stage === 'falling' && marioPose !== 'jump')) {
        stepCount = (stepCount + 1) % 3;
        setMarioPose(stepCount === 0 ? 'run-1' : stepCount === 1 ? 'run-2' : 'run-3');
      }
    }, 80);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const groundTargetX = isMobile ? 68 : 75;
    const groundTargetY = isMobile ? 86 : 88;

    const animateMovement = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (stage === 'mario_run') {
        // Accelerating run from -16% to 20%
        const progress = Math.min(1, elapsed / 450);
        const currentX = -16 + (progress * progress) * 36;
        setMarioX(currentX);
        setMarioY(33);
      } else if (stage === 'mario_dash') {
        // High speed dash from 20% to 48% (into logo center)
        const progress = Math.min(1, elapsed / 300);
        const currentX = 20 + Math.pow(progress, 1.7) * 28;
        setMarioX(currentX);
        setMarioY(33);
      } else if (stage === 'impact') {
        // Impact hit at center
        setMarioX(48);
        setMarioY(33);
      } else if (stage === 'falling') {
        // Natural gravity fall from (48%, 33%) down to (groundTargetX, groundTargetY)
        const duration = 610;
        const progress = Math.min(1, elapsed / duration);

        // First 320ms: Super Mario jump pose (fist raised high!)
        if (elapsed < 320) {
          setMarioPose('jump');
        } else {
          // Approaching ground: feet down ready to touch down
          setMarioPose('run-1');
        }

        // Horizontal forward momentum
        const currentX = 48 + Math.pow(progress, 0.85) * (groundTargetX - 48);
        // Realistic gravity curve: y drops with power acceleration
        const currentY = 33 + Math.pow(progress, 1.6) * (groundTargetY - 33);

        setMarioX(currentX);
        setMarioY(currentY);

        // Camera tracks down alongside Mario
        setCameraProgress(progress);
      } else if (stage === 'touchdown') {
        setMarioX(groundTargetX);
        setMarioY(groundTargetY);
        setCameraProgress(1);
        setMarioPose('run-1');
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

  const isShattered = stage === 'impact' || stage === 'falling' || stage === 'touchdown';
  const showLogo = stage !== 'blue';
  const showMario = stage !== 'blue' && stage !== 'logo_enter' && stage !== 'logo_settled';

  // Camera follow effect: As Mario falls, the solid blue curtain rolls up & fades away
  const backdropOpacity = Math.max(0, 1 - cameraProgress * 1.25);
  const backdropTranslateY = -cameraProgress * 50;

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
      {/* TITLE LOGO ARENA (Positioned at 33% height where smash occurs)      */}
      {/* =================================================================== */}
      {showLogo && (
        <div
          className="absolute inset-x-0 flex items-center justify-center px-4"
          style={{
            top: '33%',
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
      {/* Follows Mario from logo smash down to the ground pipe               */}
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
          {/* Dash speed puffs behind feet during dash */}
          {stage === 'mario_dash' && (
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-white opacity-85 anim-dust-puff" />
              <div className="w-2.5 h-2.5 rounded-full bg-white opacity-65 anim-dust-puff" style={{ animationDelay: '0.04s' }} />
              <div className="w-2 h-2 rounded-full bg-white opacity-45 anim-dust-puff" style={{ animationDelay: '0.08s' }} />
            </div>
          )}

          {/* Touchdown ground dust puff when landing */}
          {(stage === 'touchdown' || (stage === 'falling' && cameraProgress > 0.92)) && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-3 h-2 bg-white rounded-full opacity-90 animate-ping" />
              <div className="w-3 h-2 bg-white rounded-full opacity-90 animate-ping" />
            </div>
          )}

          {/* Mario Sprite: Plays landing squash when stage is touchdown */}
          <div
            className={`w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 flex items-center justify-center ${
              stage === 'touchdown' ? 'anim-mario-squash' : ''
            }`}
          >
            <PixelMario
              size={cameraProgress > 0.7 ? 54 : 96}
              pose={marioPose}
              className="origin-bottom transition-all duration-150"
            />
          </div>
        </div>
      )}
    </div>
  );
};
