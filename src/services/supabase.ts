import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { MatchState, RollAnimationEvent, GameTransaction } from '../types/game';

// Supabase Project configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local');
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

let activeChannel: RealtimeChannel | null = null;

/**
 * Fetch match state from Supabase database
 */
export async function fetchRemoteMatchState(matchCode: string): Promise<MatchState | null> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('state_json')
      .eq('id', matchCode)
      .single();

    if (error || !data) {
      return null;
    }

    return (data.state_json as MatchState) || null;
  } catch (err) {
    console.warn('Supabase fetch error, using local state:', err);
    return null;
  }
}

/**
 * Save match state to Supabase database
 */
export async function saveRemoteMatchState(state: MatchState): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('matches')
      .upsert({
        id: state.matchCode,
        status: state.status,
        seconds_remaining: state.secondsRemaining,
        timer_running: state.timerRunning,
        active_team_index: state.activeTeamIndex,
        turn_rolls: state.turnRolls,
        settings: state.settings,
        pending_landing: state.pendingLanding || null,
        pending_sale: state.pendingSale || null,
        latest_roll_animation: state.latestRollAnimation || null,
        state_json: state,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Supabase save exception:', err);
    return false;
  }
}

/**
 * Log transaction event to Supabase
 */
export async function logRemoteMatchEvent(matchCode: string, tx: GameTransaction): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('match_events')
      .insert({
        id: tx.id,
        match_id: matchCode,
        time_formatted: tx.timeFormatted,
        action_type: tx.actionType,
        team_index: tx.teamIndex,
        team_name: tx.teamName,
        description: tx.description,
        cash_delta: tx.cashDelta ?? null,
        cv_delta: tx.cvDelta ?? null,
        snapshot_before: tx.snapshotBefore || null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase event log error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Supabase event log exception:', err);
    return false;
  }
}

/**
 * Subscribe to realtime match channel for multi-phone live synchronization
 */
export function subscribeToMatchSync(
  matchCode: string,
  callbacks: {
    onStateSync: (remoteState: MatchState) => void;
    onRollAnimation: (anim: RollAnimationEvent) => void;
    onConnectionChange: (connected: boolean) => void;
  }
): () => void {
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }

  const channelName = `startupoly_room_${matchCode}`;
  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false },
      presence: { key: matchCode },
    },
  });

  // Listen to broadcast events from Game Master
  channel
    .on('broadcast', { event: 'state_sync' }, (payload) => {
      if (payload?.payload?.state) {
        callbacks.onStateSync(payload.payload.state as MatchState);
      }
    })
    .on('broadcast', { event: 'roll_animation' }, (payload) => {
      if (payload?.payload?.animation) {
        callbacks.onRollAnimation(payload.payload.animation as RollAnimationEvent);
      }
    })
    // Listen to database row updates
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchCode}`,
      },
      (payload) => {
        if (payload?.new && (payload.new as any).state_json) {
          callbacks.onStateSync((payload.new as any).state_json as MatchState);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        callbacks.onConnectionChange(true);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        callbacks.onConnectionChange(false);
      }
    });

  activeChannel = channel;

  return () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel);
      activeChannel = null;
    }
  };
}

/**
 * Broadcast realtime state update from Admin to all connected player devices
 */
export function broadcastStateUpdate(matchCode: string, state: MatchState) {
  if (activeChannel) {
    activeChannel.send({
      type: 'broadcast',
      event: 'state_sync',
      payload: { state, timestamp: Date.now() },
    });
  }
}

/**
 * Broadcast realtime roll animation event
 */
export function broadcastRollAnimation(matchCode: string, animation: RollAnimationEvent) {
  if (activeChannel) {
    activeChannel.send({
      type: 'broadcast',
      event: 'roll_animation',
      payload: { animation, timestamp: Date.now() },
    });
  }
}
