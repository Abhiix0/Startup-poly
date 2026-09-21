import { useState, useCallback } from 'react';

const STORAGE_KEY = 'startupoly:landing-seen';

export interface UseFirstVisitResult {
  isFirstVisit: boolean;
  markSeen: () => void;
}

/**
 * Hook to check and track if the user is visiting the landing page for the first time in this session.
 * Fully resilient to disabled/blocked sessionStorage.
 */
export function useFirstVisit(): UseFirstVisitResult {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return true;
      }
      return sessionStorage.getItem(STORAGE_KEY) === null;
    } catch {
      return true;
    }
  });

  const markSeen = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch {
      // Swallowed safely
    }
    setIsFirstVisit(false);
  }, []);

  return { isFirstVisit, markSeen };
}
