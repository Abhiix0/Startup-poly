import { supabase } from './client';
import { parseRpcError } from '../lib/errors';
import { Database, Json } from './database.types';

type FunctionName = keyof Database['public']['Functions'];

async function callRpc<T>(fnName: FunctionName, args?: Record<string, unknown>): Promise<T> {
  try {
    // supabase.rpc types match the database definitions
    const { data, error } = await (supabase.rpc as any)(fnName, args);
    if (error) {
      throw parseRpcError(error);
    }
    return data as T;
  } catch (err) {
    throw parseRpcError(err);
  }
}

// 1. Core / Public
export async function rpcServerTime(): Promise<string> {
  return callRpc<string>('server_time');
}

// 2. Team Endpoints
export async function rpcGetLobby(code: string) {
  return callRpc<{
    status: string;
    team_count: number;
    teams: Array<{ slot: number; name: string; color: string; claimed: boolean }>;
  }>('get_lobby', { code });
}

export async function rpcJoinTeam(code: string, slot: number, pin: string) {
  return callRpc<{ team_id: string; room_id: string }>('join_team', { code, slot, pin });
}

export async function rpcGetMyState() {
  return callRpc<{
    room: { status: string; started_at: string | null; ends_at: string | null; server_now: string };
    team: { slot: number; name: string; color: string; cash: number; cv: number; is_bankrupt: boolean };
    businesses: Array<{
      business_key: string;
      name: string;
      level: number;
      cost: number;
      initial_cv: number;
      cv_contribution: number;
    }>;
    leaderboard: Array<{
      rank: number;
      name: string;
      color: string;
      cv: number;
      cash: number;
      business_count: number;
      is_bankrupt: boolean;
    }> | null;
  } | null>('get_my_state');
}

// 3. Admin Setup & Lifecycle
export async function rpcAdminCreateRoom(team_count: number, teams: Array<{ name: string; color: string }>) {
  return callRpc<any>('admin_create_room', { team_count, teams: teams as unknown as Json });
}

export async function rpcAdminUpdateTeamConfig(team_id: string, name: string, color: string) {
  return callRpc<any>('admin_update_team_config', { team_id, name, color });
}

export async function rpcAdminOpenLobby(room_id: string) {
  return callRpc<any>('admin_open_lobby', { room_id });
}

export async function rpcAdminReleaseTeam(team_id: string) {
  return callRpc<{ team_id: string; released: boolean }>('admin_release_team', { team_id });
}

export async function rpcAdminStartGame(room_id: string, force = false) {
  return callRpc<any>('admin_start_game', { room_id, force });
}

// 4. Admin Edits
export async function rpcAdminSetTeamValues(params: {
  team_id: string;
  cash?: number | null;
  cv?: number | null;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return callRpc<any>('admin_set_team_values', params);
}

export async function rpcAdminAdjust(params: {
  changes: Array<{ team_id: string; cash_delta: number; cv_delta: number; expected_version: number }>;
  label: string;
  note?: string;
  request_id?: string;
}) {
  return callRpc<any>('admin_adjust', {
    changes: params.changes as unknown as Json,
    label: params.label,
    note: params.note,
    request_id: params.request_id,
  });
}

export async function rpcAdminAddBusiness(params: {
  team_id: string;
  business_key: string;
  apply_purchase?: boolean;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return callRpc<any>('admin_add_business', params);
}

export async function rpcAdminSetBusinessLevel(params: {
  team_id: string;
  business_key: string;
  new_level: number;
  apply_upgrade?: boolean;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return callRpc<any>('admin_set_business_level', params);
}

export async function rpcAdminRemoveBusiness(params: {
  team_id: string;
  business_key: string;
  reason: 'FORCED_SALE' | 'BANKRUPTCY' | 'CORRECTION';
  credit_resale?: boolean;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return callRpc<any>('admin_remove_business', params);
}

export async function rpcAdminSetBankrupt(params: {
  team_id: string;
  value: boolean;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return callRpc<any>('admin_set_bankrupt', params);
}

export async function rpcAdminSetTiebreak(room_id: string, ordered_team_ids: string[], note?: string) {
  return callRpc<any>('admin_set_tiebreak', { room_id, ordered_team_ids, note });
}

export interface AdminRoomSnapshot {
  room: {
    id: string;
    code: string;
    status: 'CREATED' | 'LOBBY' | 'ACTIVE' | 'TIME_EXPIRED' | 'FINALIZED' | string;
    team_count: number;
    started_at: string | null;
    ends_at: string | null;
    created_at: string;
    created_by: string;
    finalized_at?: string | null;
    winner_team_id?: string | null;
    duration_seconds?: number;
  };
  server_now: string;
  teams: Array<{
    id: string;
    slot: number;
    name: string;
    color: string;
    cash: number;
    cv: number;
    is_bankrupt: boolean;
    version: number;
    tiebreak_order: number | null;
    claimed: boolean;
    pin?: string | null;
    businesses: Array<{
      business_key: string;
      name: string;
      level: number;
      cost: number;
      initial_cv: number;
    }>;
  }>;
  events: Array<{
    id: number;
    team_id: string | null;
    group_id: string | null;
    type: string;
    business_key?: string | null;
    prev: any;
    new: any;
    note?: string | null;
    is_correction: boolean;
    created_at: string;
  }>;
}

// 5. Admin Inspection, Standings & History
export async function rpcGetAdminSnapshot(room_id: string): Promise<AdminRoomSnapshot> {
  return callRpc<AdminRoomSnapshot>('get_admin_snapshot', { room_id });
}

export async function rpcGetStandings(room_id: string) {
  return callRpc<{
    standings: any[];
    has_unresolved_tie: boolean;
  }>('get_standings', { p_room_id: room_id });
}

export async function rpcAdminFinalize(room_id: string) {
  return callRpc<{
    room_id: string;
    winner_team_id: string | null;
    standings: any[];
  }>('admin_finalize', { p_room_id: room_id });
}

export async function rpcListHistory() {
  return callRpc<any[]>('list_history');
}

export async function rpcGetHistoryDetail(room_id: string) {
  return callRpc<{
    room: any;
    results: any[];
    events: any[];
  }>('get_history_detail', { room_id });
}

// Aliases and Convenience Types
export const getMyStateRpc = rpcGetMyState;
export const joinTeamRpc = rpcJoinTeam;
export const getLobbyRpc = rpcGetLobby;
export type TeamStateResponse = NonNullable<Awaited<ReturnType<typeof rpcGetMyState>>>;
