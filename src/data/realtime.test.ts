import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRealtimeSubscription } from './realtime';
import { supabase } from './client';

describe('createRealtimeSubscription', () => {
  let mockChannel: any;
  let subscribeCallback: ((status: string, err?: any) => void) | null = null;
  let postgresChangeHandlers: Record<string, () => void> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    subscribeCallback = null;
    postgresChangeHandlers = {};

    mockChannel = {
      on: vi.fn().mockImplementation((_event: string, filterConfig: any, handler: () => void) => {
        postgresChangeHandlers[filterConfig.table] = handler;
        return mockChannel;
      }),
      subscribe: vi.fn().mockImplementation((cb) => {
        subscribeCallback = cb;
        if (cb) cb('SUBSCRIBED');
        return mockChannel;
      }),
      unsubscribe: vi.fn().mockResolvedValue('ok'),
    };

    vi.spyOn(supabase, 'channel').mockImplementation(() => mockChannel);
    vi.spyOn(supabase, 'removeChannel').mockReturnValue(Promise.resolve('ok') as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('creates a channel with unique prefix/room topic and registers table listeners', () => {
    const onChange = vi.fn();
    const onStatusChange = vi.fn();

    const sub = createRealtimeSubscription({
      prefix: 'test-hook',
      roomId: 'room-abc',
      tables: [
        { table: 'rooms', filter: 'id=eq.room-abc' },
        { table: 'teams', filter: 'room_id=eq.room-abc' },
      ],
      onChange,
      onStatusChange,
    });

    expect(supabase.channel).toHaveBeenCalledWith(expect.stringMatching(/^test-hook-room-abc-/));
    expect(mockChannel.on).toHaveBeenCalledTimes(2);
    expect(sub.getStatus()).toBe('LIVE');

    // Trigger table change event
    postgresChangeHandlers['teams']?.();
    expect(onChange).toHaveBeenCalledTimes(1);

    sub.unsubscribe();
  });

  it('cleans up channel and cancels timers on unsubscribe', () => {
    const sub = createRealtimeSubscription({
      prefix: 'cleanup-test',
      tables: [{ table: 'teams' }],
      onChange: vi.fn(),
    });

    expect(supabase.channel).toHaveBeenCalledTimes(1);

    sub.unsubscribe();
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('handles CHANNEL_ERROR with exponential backoff and retries', () => {
    const onStatusChange = vi.fn();
    const onReconnect = vi.fn();

    const sub = createRealtimeSubscription({
      prefix: 'backoff-test',
      tables: [{ table: 'rooms' }],
      onChange: vi.fn(),
      onStatusChange,
      onReconnect,
    });

    expect(sub.getStatus()).toBe('LIVE');

    // Simulate channel disconnect
    subscribeCallback?.('CHANNEL_ERROR', new Error('Connection failed'));
    expect(sub.getStatus()).toBe('RECONNECTING');

    // Advance fake timer to trigger backoff reconnect (1000ms + jitter < 1600ms)
    vi.advanceTimersByTime(1600);

    // Channel should have been re-created
    expect(supabase.channel).toHaveBeenCalledTimes(2);

    // After reconnecting, onReconnect should be fired
    expect(onReconnect).toHaveBeenCalledTimes(1);
    expect(sub.getStatus()).toBe('LIVE');

    sub.unsubscribe();
  });

  it('triggers immediate resubscribe on window online event', () => {
    const onReconnect = vi.fn();

    const sub = createRealtimeSubscription({
      prefix: 'online-test',
      tables: [{ table: 'rooms' }],
      onChange: vi.fn(),
      onReconnect,
    });

    // Simulate going offline then back online
    window.dispatchEvent(new Event('offline'));
    expect(sub.getStatus()).toBe('OFFLINE');

    window.dispatchEvent(new Event('online'));
    expect(supabase.channel).toHaveBeenCalledTimes(2);
    expect(onReconnect).toHaveBeenCalledTimes(1);

    sub.unsubscribe();
  });
});
