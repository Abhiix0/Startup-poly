/**
 * STARTUPOLY Realtime Subscription Helper
 * 
 * Centralized utility for managing Supabase Realtime subscriptions with:
 * - Unique channel topics per instance to prevent collisions.
 * - StrictMode safety (guaranteed cleanup, zero zombie channels).
 * - Exponential backoff with jitter on channel failures.
 * - Automatic connection state mapping (LIVE, CONNECTING, RECONNECTING, OFFLINE).
 * - Automatic snapshot refetch trigger upon reconnect.
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './client';
import { ConnectionStatus } from '../ui/ConnectionPill';
import { logger } from '../lib/logger';

export interface RealtimeTableConfig {
  table: string;
  filter?: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
}

export interface RealtimeSubscriptionOptions {
  prefix: string;
  roomId?: string;
  tables: RealtimeTableConfig[];
  onChange: () => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onReconnect?: () => void;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
  getStatus: () => ConnectionStatus;
  resubscribe: () => void;
}

const BACKOFF_SCHEDULE_MS = [1000, 2000, 5000, 10000];

export function createRealtimeSubscription(
  options: RealtimeSubscriptionOptions
): RealtimeSubscription {
  const { prefix, roomId, tables, onChange, onStatusChange, onReconnect } = options;

  let currentChannel: RealtimeChannel | null = null;
  let isUnsubscribed = false;
  let hasSubscribedOnce = false;
  let backoffIndex = 0;
  let backoffTimer: ReturnType<typeof setTimeout> | null = null;
  let currentStatus: ConnectionStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'CONNECTING';

  function updateStatus(newStatus: ConnectionStatus) {
    if (isUnsubscribed) return;
    if (currentStatus !== newStatus) {
      currentStatus = newStatus;
      onStatusChange?.(newStatus);
    }
  }

  function getBackoffDelay(): number {
    const base = BACKOFF_SCHEDULE_MS[Math.min(backoffIndex, BACKOFF_SCHEDULE_MS.length - 1)];
    const jitter = Math.floor(Math.random() * 500);
    return base + jitter;
  }

  function scheduleReconnect(reason: string) {
    if (isUnsubscribed) return;
    if (backoffTimer) clearTimeout(backoffTimer);

    updateStatus('RECONNECTING');
    const delay = getBackoffDelay();
    logger.warn('Realtime', `Channel disconnected (${reason}). Reconnecting in ${delay}ms...`);
    backoffIndex = Math.min(backoffIndex + 1, BACKOFF_SCHEDULE_MS.length - 1);

    backoffTimer = setTimeout(() => {
      if (!isUnsubscribed) {
        setupChannel();
      }
    }, delay);
  }

  function setupChannel() {
    if (isUnsubscribed) return;

    // Clean up previous channel if any
    if (currentChannel) {
      try {
        supabase.removeChannel(currentChannel);
      } catch {
        // Ignored
      }
      currentChannel = null;
    }

    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const topic = `${prefix}-${roomId || 'all'}-${uniqueId}`;

    logger.debug('Realtime', `Creating channel ${topic}`);
    const channel = supabase.channel(topic);

    // Attach table listeners
    for (const conf of tables) {
      channel.on(
        'postgres_changes' as any,
        {
          event: conf.event || '*',
          schema: conf.schema || 'public',
          table: conf.table,
          ...(conf.filter ? { filter: conf.filter } : {}),
        },
        () => {
          if (!isUnsubscribed) {
            onChange();
          }
        }
      );
    }

    // Subscribe with status tracking
    channel.subscribe((status, err) => {
      if (isUnsubscribed) return;

      if (status === 'SUBSCRIBED') {
        logger.info('Realtime', `Channel subscribed: ${topic}`);
        const wasDisconnected = hasSubscribedOnce && currentStatus !== 'LIVE';
        hasSubscribedOnce = true;
        backoffIndex = 0;

        const isOnline = typeof navigator === 'undefined' || navigator.onLine;
        updateStatus(isOnline ? 'LIVE' : 'OFFLINE');

        if (wasDisconnected) {
          logger.info('Realtime', `Reconnected! Triggering full snapshot refetch for ${topic}`);
          onReconnect?.();
        }
      } else if (status === 'TIMED_OUT') {
        scheduleReconnect('TIMED_OUT');
      } else if (status === 'CHANNEL_ERROR') {
        scheduleReconnect(err?.message || 'CHANNEL_ERROR');
      } else if (status === 'CLOSED') {
        if (!isUnsubscribed) {
          scheduleReconnect('CLOSED');
        }
      }
    });

    currentChannel = channel;
  }

  // Handle browser online/offline events
  const handleOnline = () => {
    if (isUnsubscribed) return;
    logger.info('Realtime', 'Browser went online. Re-establishing connection...');
    updateStatus('RECONNECTING');
    if (backoffTimer) clearTimeout(backoffTimer);
    backoffIndex = 0;
    setupChannel();
  };

  const handleOffline = () => {
    if (isUnsubscribed) return;
    logger.warn('Realtime', 'Browser went offline.');
    updateStatus('OFFLINE');
    if (backoffTimer) clearTimeout(backoffTimer);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  // Initial channel establishment
  setupChannel();

  return {
    unsubscribe: () => {
      isUnsubscribed = true;
      if (backoffTimer) clearTimeout(backoffTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      if (currentChannel) {
        logger.debug('Realtime', `Removing channel in cleanup`);
        supabase.removeChannel(currentChannel);
        currentChannel = null;
      }
    },
    getStatus: () => currentStatus,
    resubscribe: () => {
      if (isUnsubscribed) return;
      backoffIndex = 0;
      setupChannel();
    },
  };
}
