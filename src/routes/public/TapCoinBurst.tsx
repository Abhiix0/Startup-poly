import React, { useState, useEffect, useRef } from 'react';
import { PixelCoin } from '../../ui/pixel';

export interface Burst {
  id: number;
  x: number;
  y: number;
}

export interface TapCoinBurstProps {
  isBooting?: boolean;
}

let burstCounter = 0;

export const TapCoinBurst: React.FC<TapCoinBurstProps> = ({ isBooting = false }) => {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // 1. Guard against boot sequence
      if (isBooting) return;

      // 2. Defensive check for Element instance
      if (!(e.target instanceof Element)) return;

      // 3. Ignore interactive elements and their children
      if (e.target.closest('a, button, input, textarea, select, [role="button"], [tabindex]')) {
        return;
      }

      // 4. Guard against reduced motion (zero DOM nodes created)
      if (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      // 5. Throttle triggers (180ms window)
      const now = Date.now();
      if (now - lastTapRef.current < 180) {
        return;
      }
      lastTapRef.current = now;

      // 6. Cap concurrent bursts to max 3
      const newBurst: Burst = {
        id: ++burstCounter,
        x: e.clientX,
        y: e.clientY,
      };

      setBursts((prev) => (prev.length >= 3 ? prev : [...prev, newBurst]));
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isBooting]);

  const handleBurstEnd = (id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  };

  if (bursts.length === 0) return null;

  return (
    <div
      data-testid="tap-burst-overlay"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none"
      aria-hidden="true"
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          data-testid="tap-coin-burst"
          className="absolute anim-tap-burst flex gap-1.5 items-center pointer-events-none"
          style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
          onAnimationEnd={() => handleBurstEnd(burst.id)}
        >
          <PixelCoin size={14} className="opacity-95" />
          <PixelCoin size={10} className="opacity-80 -mt-2" />
        </div>
      ))}
    </div>
  );
};
