import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useServerClock } from './useServerClock';

describe('useServerClock', () => {
  const mockFetchTime = vi.fn(async () => new Date().toISOString());

  beforeEach(() => {
    vi.useFakeTimers();
    mockFetchTime.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders 00:00 when room is TIME_EXPIRED or FINALIZED', () => {
    const { result } = renderHook(() =>
      useServerClock({
        endsAt: new Date(Date.now() + 60000).toISOString(),
        status: 'TIME_EXPIRED',
        fetchTimeFn: mockFetchTime,
      })
    );

    expect(result.current.formatted).toBe('00:00');
    expect(result.current.isExpired).toBe(true);
    expect(result.current.isRunning).toBe(false);
  });

  it('renders 50:00 when room is LOBBY or CREATED with null endsAt', () => {
    const { result } = renderHook(() =>
      useServerClock({
        endsAt: null,
        status: 'LOBBY',
        fetchTimeFn: mockFetchTime,
      })
    );

    expect(result.current.formatted).toBe('50:00');
    expect(result.current.isPaused).toBe(true);
    expect(result.current.isRunning).toBe(false);
  });

  it('counts down correctly when room is ACTIVE', () => {
    const now = Date.now();
    // 10 minutes from now = 600 seconds
    const endsAt = new Date(now + 600 * 1000).toISOString();

    const { result } = renderHook(() =>
      useServerClock({
        endsAt,
        status: 'ACTIVE',
        fetchTimeFn: mockFetchTime,
      })
    );

    expect(result.current.formatted).toBe('10:00');
    expect(result.current.isRunning).toBe(true);

    // Advance 60 seconds
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.formatted).toBe('09:00');
  });

  it('triggers onExpire callback when timer hits zero', () => {
    const onExpire = vi.fn();
    const now = Date.now();
    // 2 seconds remaining
    const endsAt = new Date(now + 2000).toISOString();

    const { result } = renderHook(() =>
      useServerClock({
        endsAt,
        status: 'ACTIVE',
        onExpire,
        fetchTimeFn: mockFetchTime,
      })
    );

    expect(result.current.formatted).toBe('00:02');

    // Advance 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.formatted).toBe('00:00');
    expect(result.current.isExpired).toBe(true);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
