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
  const [marioProgress, setMarioProgress] = useState<number>(-15); // Percentage across screen (-15% to 115%)
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);

  // Complete handler ensures onComplete only called once
  const completeIntro = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setStage('complete');
    onComplete();
  }, [onComplete]);

  // Skip handler on tap/click or keypress
  const handleSkip = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  // Listen for Escape / Space keys to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Main Intro Sequence Director
  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Gentle accessible sequence for reduced motion users
      const t1 = setTimeout(() => setStage('logo_enter'), 100);
      const t2 = setTimeout(() => setStage('fade_out'), 1200);
      const t3 = setTimeout(() => completeIntro(), 1600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    // Standard Retro Game Cinematic Sequence
    // 0.0s: Blue screen
    // 0.15s: Logo enters
    const tLogoEnter = setTimeout(() => {
      setStage('logo_enter');
    }, 150);

    // 0.65s: Logo settles
    const tLogoSettled = setTimeout(() => {
      setStage('logo_settled');
    }, 650);

    // 0.95s: Mario enters running from left
    const tMarioEnter = setTimeout(() => {
      setStage('mario_run');
    }, 950);

    // 1.55s: Mario enters DASH mode (smoke puff, forward lean)
    const tMarioDash = setTimeout(() => {
      setStage('mario_dash');
      setMarioPose('dash');
    }, 1550);

    // 1.88s: IMPACT! Mario rams through logo center
    const tImpact = setTimeout(() => {
      setStage('impact');
      setScreenShake(true);
    }, 1880);

    // Settle screen shake after 180ms
    const tShakeStop = setTimeout(() => {
      setScreenShake(false);
    }, 2080);

    // 2.20s: Begin smooth fade out
    const tFadeOut = setTimeout(() => {
      setStage('fade_out');
    }, 2200);

    // 2.50s: Overlay complete, unmount
    const tComplete = setTimeout(() => {
      completeIntro();
    }, 2500);

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
    }, 90);

    const animateMovement = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (stage === 'mario_run') {
        // Accelerating entry from -12% to 18% over 600ms
        const progress = Math.min(1, elapsed / 600);
        // Ease in quad
        const currentPos = -12 + (progress * progress) * 30;
        setMarioProgress(currentPos);
      } else if (stage === 'mario_dash') {
        // High speed dash from 18% to 50% (collision point) over 330ms
        const progress = Math.min(1, elapsed / 330);
        // Exponential burst acceleration
        const currentPos = 18 + Math.pow(progress, 1.8) * 32;
        setMarioProgress(currentPos);
      } else if (stage === 'impact' || stage === 'fade_out') {
        // Blasts through from 50% to 110% over 400ms
        const progress = Math.min(1, elapsed / 400);
        const currentPos = 50 + progress * 60;
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
      onClick={handleSkip}
      className={`fixed inset-0 z-50 bg-[#5C94FC] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-opacity duration-300 ${
        stage === 'fade_out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${screenShake ? 'anim-intro-screen-shake' : ''}`}
    >
      {/* Top right subtle skip affordance */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        aria-label="Skip Intro Animation"
        className="absolute top-4 right-4 z-50 font-pixel text-[9px] sm:text-[10px] text-[#FFCC00] bg-[#102040] border-2 border-[#FFCC00] px-2 py-1 shadow-[2px_2px_0px_#B84418] hover:scale-105 active:scale-95 transition-transform"
      >
        SKIP ❯
      </button>

      {/* Main Center Arena (Logo & Mario Collision Path) */}
      <div className="relative w-full max-w-5xl h-64 sm:h-80 flex items-center justify-center">
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
            className="absolute z-20 pointer-events-none transition-transform"
            style={{
              left: `${marioProgress}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Speed dust clouds during dash */}
            {stage === 'mario_dash' && (
              <div className="absolute top-1/2 -left-6 -translate-y-1/2 flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-white opacity-80 anim-dust-puff" />
                <div className="w-2 h-2 rounded-full bg-white opacity-60 anim-dust-puff" style={{ animationDelay: '0.04s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 anim-dust-puff" style={{ animationDelay: '0.08s' }} />
              </div>
            )}

            {/* Responsive Mario: 56px on mobile, 72px on tablet, 80px on desktop */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center">
              <PixelMario
                size={72}
                pose={marioPose}
                className="scale-90 sm:scale-110 md:scale-125 origin-center"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
