import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFirstVisit } from './useFirstVisit';

describe('useFirstVisit', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns isFirstVisit true on initial visit', () => {
    const { result } = renderHook(() => useFirstVisit());
    expect(result.current.isFirstVisit).toBe(true);
  });

  it('returns isFirstVisit false after markSeen is called', () => {
    const { result } = renderHook(() => useFirstVisit());
    expect(result.current.isFirstVisit).toBe(true);

    act(() => {
      result.current.markSeen();
    });

    expect(result.current.isFirstVisit).toBe(false);
    expect(sessionStorage.getItem('startupoly:landing-seen')).toBe('true');
  });

  it('returns isFirstVisit false if sessionStorage already has key', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    const { result } = renderHook(() => useFirstVisit());
    expect(result.current.isFirstVisit).toBe(false);
  });

  it('swallows storage access exceptions and treats as first visit without throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: The operation is insecure.');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError: The operation is insecure.');
    });

    const { result } = renderHook(() => useFirstVisit());
    expect(result.current.isFirstVisit).toBe(true);

    expect(() => {
      act(() => {
        result.current.markSeen();
      });
    }).not.toThrow();

    expect(result.current.isFirstVisit).toBe(false);
  });
});
