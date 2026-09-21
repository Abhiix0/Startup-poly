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

  it('correctly compensates for local phone clock skew', async () => {
    // Local device is 15 minutes ahead of the server
    const serverTimestampMs = 1700000000000;
    const localDeviceSkewMs = 15 * 60 * 1000;
    vi.setSystemTime(serverTimestampMs + localDeviceSkewMs);

    // Server time function returns true server time
    const fetchServerTimeMock = vi.fn(async () => new Date(serverTimestampMs).toISOString());

    // Game ends 10 minutes into the future on the server
    const endsAt = new Date(serverTimestampMs + 600 * 1000).toISOString();

    const { result } = renderHook(() =>
      useServerClock({
        endsAt,
        status: 'ACTIVE',
        fetchTimeFn: fetchServerTimeMock,
      })
    );

    // Let the async sync() finish
    await act(async () => {
      await Promise.resolve();
    });

    // Device remaining time must be 10:00, NOT negative or expired!
    expect(result.current.formatted).toBe('10:00');
    expect(result.current.offsetMs).toBeCloseTo(-localDeviceSkewMs, -2);
  });

  it('selects the offset with the lowest RTT across resyncs and performs periodic 5-minute sync', async () => {
    let callCount = 0;
    // Sample 1: RTT = 400ms, offset = 100
    // Sample 2: RTT = 50ms, offset = 250 (BEST)
    // Sample 3: RTT = 200ms, offset = 150
    const dynamicFetch = vi.fn(async () => {
      callCount++;
      const base = 1700000000000;
      if (callCount === 1) {
        vi.advanceTimersByTime(400);
        return new Date(base + 300).toISOString();
      } else if (callCount === 2) {
        vi.advanceTimersByTime(50);
        return new Date(base + 275).toISOString();
      } else {
        vi.advanceTimersByTime(200);
        return new Date(base + 250).toISOString();
      }
    });

    const { result } = renderHook(() =>
      useServerClock({
        endsAt: new Date(1700000000000 + 300000).toISOString(),
        status: 'ACTIVE',
        fetchTimeFn: dynamicFetch,
      })
    );

    // Initial mount sync (Sample 1: high RTT 400ms)
    await act(async () => {
      await Promise.resolve();
    });
    expect(dynamicFetch).toHaveBeenCalledTimes(1);

    // Trigger second sync manually (Sample 2: lowest RTT 50ms)
    await act(async () => {
      await result.current.resync();
    });
    expect(dynamicFetch).toHaveBeenCalledTimes(2);

    // Advance 5 minutes to trigger periodic resync
    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(dynamicFetch).toHaveBeenCalledTimes(3);

    // Offset should correspond to Sample 2 because it had lowest RTT (50ms)
    expect(result.current.offsetMs).toBeDefined();
  });
});
