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
  | 'fade_out'
  | 'complete';

export const GameIntroOverlay: React.FC<GameIntroOverlayProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>('blue');
  const [marioPose, setMarioPose] = useState<MarioPose>('run-1');
  const [marioProgress, setMarioProgress] = useState<number>(-16); // Percentage across screen (-16% to 115%)
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);

  // Complete handler ensures onComplete only called once
  const completeIntro = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setStage('complete');
    onComplete();
  }, [onComplete]);

  // Optional tap/click or keyboard fast-forward (no visible UI button)
  const handleFastForward = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  // Listen for Escape / Space keys
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

  // Main Intro Sequence Director
  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Gentle accessible sequence for reduced motion users
      const t1 = setTimeout(() => setStage('logo_enter'), 80);
      const t2 = setTimeout(() => setStage('fade_out'), 1000);
      const t3 = setTimeout(() => completeIntro(), 1400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    // Standard Retro Game Cinematic Sequence (Total ~2.2s)
    // 0.0s: Solid blue screen
    // 0.12s: Logo drops in with overshoot bounce
    const tLogoEnter = setTimeout(() => {
      setStage('logo_enter');
    }, 120);

    // 0.58s: Logo settles centered
    const tLogoSettled = setTimeout(() => {
      setStage('logo_settled');
    }, 580);

    // 0.85s: Mario enters running from left
    const tMarioEnter = setTimeout(() => {
      setStage('mario_run');
    }, 850);

    // 1.35s: Mario switches to high-speed DASH pose with smoke dust clouds
    const tMarioDash = setTimeout(() => {
      setStage('mario_dash');
      setMarioPose('dash');
    }, 1350);

    // 1.68s: IMPACT! Mario smashes directly through the logo center
    const tImpact = setTimeout(() => {
      setStage('impact');
      setScreenShake(true);
    }, 1680);

    // 1.84s: Settle screen shake quickly
    const tShakeStop = setTimeout(() => {
      setScreenShake(false);
    }, 1840);

    // 1.90s: Seamless transition - as fragments blast outward, the blue overlay
    // smoothly dissolves away to reveal the living landing page beneath
    const tFadeOut = setTimeout(() => {
      setStage('fade_out');
    }, 1900);

    // 2.25s: Overlay complete, unmount cleanly
    const tComplete = setTimeout(() => {
      completeIntro();
    }, 2250);

    return () => {
      clearTimeout(tLogoEnter);
      clearTimeout(tLogoSettled);
      clearTimeout(tMarioEnter);
      clearTimeout(tMarioDash);
      clearTimeout(tImpact);
      clearTimeout(tShakeStop);
      clearTimeout(tFadeOut);
      clearTimeout(tComplete);
    };
  }, [completeIntro]);

  // Mario Running Frame Cycle & Position Tracking
  useEffect(() => {
    if (stage === 'blue' || stage === 'logo_enter' || stage === 'logo_settled' || stage === 'complete') {
      return;
    }

    let animationFrameId: number;
    let startTime: number | null = null;

    // Running sprite leg toggle timer
    let stepCount = 0;
    const stepInterval = setInterval(() => {
      if (stage === 'mario_run') {
        stepCount = (stepCount + 1) % 3;
        setMarioPose(stepCount === 0 ? 'run-1' : stepCount === 1 ? 'run-2' : 'run-3');
      }
    }, 85);

    const animateMovement = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (stage === 'mario_run') {
        // Run from -16% to 22% over 500ms
        const progress = Math.min(1, elapsed / 500);
        const currentPos = -16 + (progress * progress) * 38;
        setMarioProgress(currentPos);
      } else if (stage === 'mario_dash') {
        // High speed sprint from 22% to 50% (logo center) over 330ms
        const progress = Math.min(1, elapsed / 330);
        const currentPos = 22 + Math.pow(progress, 1.7) * 28;
        setMarioProgress(currentPos);
      } else if (stage === 'impact' || stage === 'fade_out') {
        // Blasts straight through from 50% to 115% over 380ms
        const progress = Math.min(1, elapsed / 380);
        const currentPos = 50 + progress * 65;
        setMarioProgress(currentPos);
      }

      animationFrameId = requestAnimationFrame(animateMovement);
    };

    animationFrameId = requestAnimationFrame(animateMovement);

    return () => {
      clearInterval(stepInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [stage]);

  if (stage === 'complete') {
    return null;
  }

  const isShattered = stage === 'impact' || stage === 'fade_out';
  const showLogo = stage !== 'blue';
  const showMario = stage === 'mario_run' || stage === 'mario_dash' || stage === 'impact' || stage === 'fade_out';

  return (
    <div
      role="dialog"
      aria-label="Game Intro"
      aria-modal="true"
      onClick={handleFastForward}
      className={`fixed inset-0 z-50 bg-[#5C94FC] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-400 ease-out ${
        stage === 'fade_out' ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      } ${screenShake ? 'anim-intro-screen-shake' : ''}`}
    >
      {/* Main Center Arena (Logo & Mario Collision Path) */}
      <div className="relative w-full max-w-5xl h-64 sm:h-80 flex items-center justify-center px-4">
        {/* ================================================================= */}
        {/* STARTUPOLY LOGO                                                   */}
        {/* ================================================================= */}
        {showLogo && (
          <div
            className={`relative z-10 ${
              stage === 'logo_enter'
                ? 'anim-intro-logo-drop'
                : ''
            }`}
          >
            <LogoShatter shattered={isShattered} />
          </div>
        )}

        {/* ================================================================= */}
        {/* MARIO ACTOR & RUNNING TRACK                                       */}
        {/* ================================================================= */}
        {showMario && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${marioProgress}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Speed dust clouds trailing behind during dash */}
            {stage === 'mario_dash' && (
              <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-white opacity-85 anim-dust-puff" />
                <div className="w-2.5 h-2.5 rounded-full bg-white opacity-65 anim-dust-puff" style={{ animationDelay: '0.04s' }} />
                <div className="w-2 h-2 rounded-full bg-white opacity-45 anim-dust-puff" style={{ animationDelay: '0.08s' }} />
              </div>
            )}

            {/* Heroic Mario scale: 80px on mobile, 100px on tablet, 114px on desktop */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center">
              <PixelMario
                size={96}
                pose={marioPose}
                className="scale-85 sm:scale-105 md:scale-115 origin-center"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
