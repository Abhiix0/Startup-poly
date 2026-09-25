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
  | 'mario_approach'
  | 'impact'
  | 'falling'
  | 'touchdown'
  | 'complete';

export const GameIntroOverlay: React.FC<GameIntroOverlayProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>('blue');
  const [marioPose, setMarioPose] = useState<MarioPose>('run-1');
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

  // Master Director Timeline: Driven by clean keyframe milestones
  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const t1 = setTimeout(() => setStage('logo_enter'), 80);
      const t2 = setTimeout(() => setStage('falling'), 900);
      const t3 = setTimeout(() => completeIntro(), 1300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    // 0.0s: Solid retro blue
    // 0.12s: Strong Hero Logo drops in
    const tLogoEnter = setTimeout(() => {
      setStage('logo_enter');
    }, 120);

    // 0.55s: Logo settles centered at the top arena
    const tLogoSettled = setTimeout(() => {
      setStage('logo_settled');
    }, 550);

    // 0.95s: Mario enters running from left (gives user ~400ms clear view of large logo)
    const tMarioEnter = setTimeout(() => {
      setStage('mario_approach');
      setMarioPose('run-1');
    }, 950);

    // 1.45s: Mario enters DASH pose with speed puffs
    const tMarioDash = setTimeout(() => {
      setMarioPose('dash');
    }, 1450);

    // 1.75s: IMPACT! Mario smashes directly into the logo
    const tImpact = setTimeout(() => {
      setStage('impact');
      setScreenShake(true);
    }, 1750);

    // 1.86s: Screen shake stops; Mario begins diving downward towards the brick ground
    const tDive = setTimeout(() => {
      setScreenShake(false);
      setStage('falling');
      setMarioPose('jump');
    }, 1860);

    // 2.25s: Nearing ground: feet drop into run stride
    const tFeetDown = setTimeout(() => {
      setMarioPose('run-1');
    }, 2250);

    // 2.48s: Touchdown on brick ground with squash & dust puff
    const tTouchdown = setTimeout(() => {
      setStage('touchdown');
    }, 2480);

    // 2.65s: Seamless handoff to the ground character (exact same Mario in PixelWorld)
    const tComplete = setTimeout(() => {
      completeIntro();
    }, 2650);

    return () => {
      clearTimeout(tLogoEnter);
      clearTimeout(tLogoSettled);
      clearTimeout(tMarioEnter);
      clearTimeout(tMarioDash);
      clearTimeout(tImpact);
      clearTimeout(tDive);
      clearTimeout(tFeetDown);
      clearTimeout(tTouchdown);
      clearTimeout(tComplete);
    };
  }, [completeIntro]);

  // Sprite stride legs toggle for running phases (80ms cycle)
  useEffect(() => {
    if (stage !== 'mario_approach') {
      return;
    }

    let stepCount = 0;
    const stepInterval = setInterval(() => {
      stepCount = (stepCount + 1) % 3;
      setMarioPose(stepCount === 0 ? 'run-1' : stepCount === 1 ? 'run-2' : 'run-3');
    }, 85);

    return () => clearInterval(stepInterval);
  }, [stage]);

  if (stage === 'complete') {
    return null;
  }

  const isShattered = stage === 'impact' || stage === 'falling' || stage === 'touchdown';
  const showLogo = stage !== 'blue';
  const isBackdropFading = stage === 'falling' || stage === 'touchdown';

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
      {/* CAMERA BACKDROP: Solid retro blue that dissolves to reveal world    */}
      {/* =================================================================== */}
      <div
        className={`absolute inset-0 bg-[#5C94FC] pointer-events-auto ${
          isBackdropFading ? 'anim-intro-backdrop-fade' : ''
        }`}
      />

      {/* =================================================================== */}
      {/* TITLE LOGO ARENA (Positioned in the top hero area)                 */}
      {/* =================================================================== */}
      {showLogo && (
        <div
          className={`absolute inset-x-0 flex items-center justify-center px-4 transition-opacity duration-300 ${
            isBackdropFading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ top: 'clamp(50px, 14vh, 100px)' }}
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
      {/* Smooth GPU CSS flight from off-screen -> smash -> fall to ground    */}
      {/* =================================================================== */}
      {stage !== 'blue' && stage !== 'logo_enter' && stage !== 'logo_settled' && (
        <div
          className={`absolute z-20 pointer-events-none ${
            stage === 'mario_approach'
              ? 'anim-intro-mario-approach'
              : stage === 'falling'
              ? 'anim-intro-mario-dive'
              : stage === 'impact'
              ? 'left-[calc(50vw-20px)]'
              : 'right-[calc(100vw-165px)]'
          }`}
          style={{
            top: 'clamp(50px, 14vh, 100px)',
            // When touchdown, lock exactly to the ground target
            transform:
              stage === 'touchdown'
                ? 'translate3d(calc(100vw - 165px), calc(100vh - 16vh - 65px), 0)'
                : undefined,
          }}
        >
          {/* Dash speed puffs during dash */}
          {marioPose === 'dash' && stage === 'mario_approach' && (
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-white opacity-85 anim-dust-puff" />
              <div className="w-2.5 h-2.5 rounded-full bg-white opacity-65 anim-dust-puff" style={{ animationDelay: '0.04s' }} />
              <div className="w-2 h-2 rounded-full bg-white opacity-45 anim-dust-puff" style={{ animationDelay: '0.08s' }} />
            </div>
          )}

          {/* Touchdown ground dust puff when landing */}
          {stage === 'touchdown' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-3 h-2 bg-white rounded-full opacity-90 animate-ping" />
              <div className="w-3 h-2 bg-white rounded-full opacity-90 animate-ping" />
            </div>
          )}

          {/* Mario Sprite: Plays landing squash when touchdown */}
          <div
            className={`w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 flex items-center justify-center ${
              stage === 'touchdown' ? 'anim-mario-squash' : ''
            }`}
          >
            <PixelMario
              size={stage === 'falling' || stage === 'touchdown' ? 56 : 96}
              pose={marioPose}
              className="origin-bottom transition-all duration-150"
            />
          </div>
        </div>
      )}
    </div>
  );
};
