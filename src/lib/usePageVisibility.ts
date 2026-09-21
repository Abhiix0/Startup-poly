import { useEffect, useState } from 'react';

/**
 * Hook to pause background animations when page/tab is hidden.
 * Synchronizes document.documentElement.dataset.paused with document.hidden.
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return !document.hidden;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsVisible(!hidden);
      if (document.documentElement) {
        document.documentElement.dataset.paused = hidden ? 'true' : 'false';
      }
    };

    // Initialize dataset attribute
    document.documentElement.dataset.paused = document.hidden ? 'true' : 'false';

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
