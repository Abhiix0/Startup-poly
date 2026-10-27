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

interface MarioFlightCoords {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

export const GameIntroOverlay: React.FC<GameIntroOverlayProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>('blue');
  const [marioPose, setMarioPose] = useState<MarioPose>('run-1');
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);

  // Dynamic measurement of the landing target (#founder-ground-target in PixelWorld)
  const [coords, setCoords] = useState<MarioFlightCoords>(() => {
    const isClient = typeof window !== 'undefined';
    const isDesktop = isClient && window.innerWidth >= 640;
    const w = isClient ? window.innerWidth : 1024;
    const h = isClient ? window.innerHeight : 768;
    const marioSize = isDesktop ? 46 : 41.4;

    const x0 = Math.round((w - marioSize) / 2);
    const y0 = Math.round((h - marioSize) / 2 - 10);
    const x3 = Math.round(w - (isDesktop ? 248 : 105));
    const y3 = Math.round(h - (isDesktop ? 102 : 96));

    return {
      x0,
      y0,
      x1: Math.round(x0 + (x3 - x0) * 0.28),
      y1: Math.round(y0 - 38),
      x2: Math.round(x0 + (x3 - x0) * 0.74),
      y2: Math.round(y0 + (y3 - y0) * 0.56),
      x3,
      y3,
    };
  });

  const measureLandingTarget = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isDesktop = window.innerWidth >= 640;
    const marioSize = isDesktop ? 46 : 41.4;

    const x0 = Math.round((window.innerWidth - marioSize) / 2);
    const y0 = Math.round((window.innerHeight - marioSize) / 2 - 10);

    let x3 = window.innerWidth - (isDesktop ? 248 : 105);
    let y3 = window.innerHeight - (isDesktop ? 102 : 96);

    const targetEl = document.getElementById('founder-ground-target');
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        x3 = Math.round(rect.left + (rect.width - marioSize) / 2);
        y3 = Math.round(rect.bottom - marioSize);
      }
    }

    const x1 = Math.round(x0 + (x3 - x0) * 0.28);
    const y1 = Math.round(y0 - 38);
    const x2 = Math.round(x0 + (x3 - x0) * 0.74);
    const y2 = Math.round(y0 + (y3 - y0) * 0.56);

    setCoords({ x0, y0, x1, y1, x2, y2, x3, y3 });
  }, []);

  // Measure on mount and window resize
  useEffect(() => {
    measureLandingTarget();
    window.addEventListener('resize', measureLandingTarget);
    return () => window.removeEventListener('resize', measureLandingTarget);
  }, [measureLandingTarget]);

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

    // 0.95s: Mario enters running from left (gives user clear view of large logo)
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
      measureLandingTarget();
    }, 1750);

    // 1.83s: Screen shake stops; Mario begins diving downward towards the brick ground
    const tDive = setTimeout(() => {
      setScreenShake(false);
      setStage('falling');
      setMarioPose('jump');
    }, 1830);

    // 2.38s: Nearing ground: feet drop into flat-foot stance ready for touchdown
    const tPrepareLand = setTimeout(() => {
      setMarioPose('idle');
    }, 2380);

    // 2.48s: Touchdown on brick ground with squash & dust puff (1830 + 650ms)
    const tTouchdown = setTimeout(() => {
      setStage('touchdown');
    }, 2480);

    // 2.64s: Seamless handoff to the ground character (exact same Mario in PixelWorld)
    const tComplete = setTimeout(() => {
      completeIntro();
    }, 2640);

    return () => {
      clearTimeout(tLogoEnter);
      clearTimeout(tLogoSettled);
      clearTimeout(tMarioEnter);
      clearTimeout(tMarioDash);
      clearTimeout(tImpact);
      clearTimeout(tDive);
      clearTimeout(tPrepareLand);
      clearTimeout(tTouchdown);
      clearTimeout(tComplete);
    };
  }, [completeIntro, measureLandingTarget]);

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
      {/* TITLE LOGO ARENA (Centered on the screen)                          */}
      {/* =================================================================== */}
      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none">
          <div
            className={`relative z-10 flex flex-col items-center justify-center ${
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
          style={
            {
              '--mario-x0': `${coords.x0}px`,
              '--mario-y0': `${coords.y0}px`,
              '--mario-x1': `${coords.x1}px`,
              '--mario-y1': `${coords.y1}px`,
              '--mario-x2': `${coords.x2}px`,
              '--mario-y2': `${coords.y2}px`,
              '--mario-x3': `${coords.x3}px`,
              '--mario-y3': `${coords.y3}px`,
            } as React.CSSProperties
          }
          className={`absolute top-0 left-0 pointer-events-none z-20 ${
            stage === 'mario_approach'
              ? 'anim-intro-mario-approach'
              : stage === 'impact'
              ? 'intro-mario-impact-pos'
              : stage === 'falling'
              ? 'anim-intro-mario-dive'
              : stage === 'touchdown'
              ? 'intro-mario-touchdown-pos'
              : ''
          }`}
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
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-between w-14 pointer-events-none">
              <div className="w-2.5 h-2 bg-white/90 rounded-sm anim-dust-puff-left" />
              <div className="w-2.5 h-2 bg-white/90 rounded-sm anim-dust-puff-right" />
            </div>
          )}

          {/* Mario Sprite: Plays landing squash when touchdown */}
          <div
            className={`w-[46px] h-[46px] flex items-end justify-center scale-90 sm:scale-100 origin-bottom ${
              stage === 'touchdown' ? 'anim-mario-squash' : ''
            }`}
          >
            <PixelMario
              size={46}
              pose={marioPose}
              className="origin-bottom"
            />
          </div>
        </div>
      )}
    </div>
  );
};
