import { useEffect, useRef } from 'react';

/**
 * usePointerParallax
 * Desktop-only pointer parallax listener that sets --px and --py CSS variables (-1 to 1)
 * on the container element via requestAnimationFrame without triggering React re-renders.
 * Completely disabled on touch devices and under prefers-reduced-motion.
 */
export function usePointerParallax(containerRef: React.RefObject<HTMLElement | null>) {
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    // Check for fine pointer (desktop mouse) and absence of reduced-motion preference
    try {
      const hasFinePointer = window.matchMedia?.('(pointer: fine) and (hover: hover)')?.matches ?? false;
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

      if (!hasFinePointer || prefersReducedMotion) {
        container.style.setProperty('--px', '0');
        container.style.setProperty('--py', '0');
        return;
      }
    } catch {
      // Gracefully skip if matchMedia fails
      return;
    }

    let targetPx = 0;
    let targetPy = 0;

    const updateCssVars = () => {
      if (container) {
        container.style.setProperty('--px', targetPx.toFixed(3));
        container.style.setProperty('--py', targetPy.toFixed(3));
      }
      rafIdRef.current = null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalize to -1 to 1
      const normalizedX = (x / rect.width) * 2 - 1;
      const normalizedY = (y / rect.height) * 2 - 1;

      targetPx = Math.max(-1, Math.min(1, normalizedX));
      targetPy = Math.max(-1, Math.min(1, normalizedY));

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateCssVars);
      }
    };

    const handlePointerLeave = () => {
      targetPx = 0;
      targetPy = 0;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateCssVars);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [containerRef]);
}
