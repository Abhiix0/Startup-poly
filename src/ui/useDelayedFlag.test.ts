import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDelayedFlag } from './useDelayedFlag';

describe('useDelayedFlag hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays false until delayMs elapses when condition is true', () => {
    const { result, rerender } = renderHook(({ cond, delay }) => useDelayedFlag(cond, delay), {
      initialProps: { cond: true, delay: 250 },
    });

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe(true);

    // Resetting condition to false should reset flag immediately
    rerender({ cond: false, delay: 250 });
    expect(result.current).toBe(false);
  });

  it('resolves immediately when delayMs is 0', () => {
    const { result } = renderHook(() => useDelayedFlag(true, 0));
    expect(result.current).toBe(true);
  });
});
