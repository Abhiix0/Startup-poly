import { useState, useEffect } from 'react';

/**
 * useDelayedFlag: Returns true only after condition has remained true for delayMs.
 * Prevents loading state flashing on ultra-fast network/cache transitions.
 */
export function useDelayedFlag(condition: boolean, delayMs = 250): boolean {
  const [shouldShow, setShouldShow] = useState(() => Boolean(condition && delayMs <= 0));

  useEffect(() => {
    if (!condition) {
      setShouldShow(false);
      return;
    }

    if (delayMs <= 0) {
      setShouldShow(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [condition, delayMs]);

  return shouldShow;
}
