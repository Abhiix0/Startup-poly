import { supabase } from './client';
import { AppError, parseRpcError, isNetworkError, isBusinessError, classifyRpcError } from '../lib/errors';
import { intentKey, intentRequestId, settleIntent } from '../lib/intent';
import { Database, Json } from './database.types';
import { logger } from '../lib/logger';

type FunctionName = keyof Database['public']['Functions'];

const READ_ONLY_RPCS = new Set<FunctionName>([
  'server_time',
  'get_lobby',
  'get_my_state',
  'get_admin_snapshot',
  'list_history',
  'get_history_detail',
  'get_standings',
]);

function canRetrySafely(fnName: FunctionName, args?: Record<string, unknown>): boolean {
  // Reads can be retried. Mutations require an idempotency key; otherwise a
  // lost response could apply a cash/business mutation twice.
  return READ_ONLY_RPCS.has(fnName) || typeof args?.request_id === 'string';
}

async function callRpc<T>(fnName: FunctionName, args?: Record<string, unknown>, retryOnNetwork = true): Promise<T> {
  const retryAllowed = retryOnNetwork && canRetrySafely(fnName, args);
  try {
    const { data, error } = await (supabase.rpc as any)(fnName, args);
    if (error) {
      const parsed = parseRpcError(error);
      if (retryAllowed && isNetworkError(error) && !isBusinessError(parsed)) {
        logger.warn('RPC', `Network failure calling ${fnName}. Retrying safe request once...`);
        await new Promise((r) => setTimeout(r, 600));
        return callRpc<T>(fnName, args, false);
      }
      throw parsed;
    }
    return data as T;
  } catch (err) {
    const parsed = parseRpcError(err);
    if (retryAllowed && isNetworkError(err) && !isBusinessError(parsed)) {
      logger.warn('RPC', `Network error calling ${fnName}. Retrying safe request once...`);
      await new Promise((r) => setTimeout(r, 600));
      return callRpc<T>(fnName, args, false);
    }
    throw parsed;
  }
}

// Mutations carry one request_id per user intent (see lib/intent.ts): a retry of the same action replays on the
// server instead of applying twice, and callRpc may then retry a dropped response safely.
async function mutate<T>(fnName: FunctionName, args: Record<string, unknown>): Promise<T> {
  const { request_id: given, ...identity } = args;
  if (typeof given === 'string') return callRpc<T>(fnName, args);
  const key = intentKey(fnName, identity);
  try {
    const result = await callRpc<T>(fnName, { ...args, request_id: intentRequestId(key) });
    settleIntent(key);
    return result;
  } catch (err) {
    if (classifyRpcError(err) !== 'OUTCOME_UNKNOWN') {
      settleIntent(key);
      throw err;
    }
    // Keep the intent open: a retry of the same action reuses the request_id and replays if it did commit.
    throw new AppError(
      'OUTCOME_UNKNOWN',
      'Connection lost. This may or may not have been saved. Check the latest values before repeating it.',
    );
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
  // join_team returns {error} for failed attempts (so the attempt row commits and the throttle counts it).
  const res = await callRpc<{ team_id?: string; room_id?: string; error?: string }>('join_team', { code, slot, pin });
  if (res.error) throw new AppError(res.error);
  return res as { team_id: string; room_id: string };
}

export async function rpcLeaveTeam() {
  return callRpc<{ success: boolean; team_id?: string; slot?: number }>('leave_team');
}

export async function rpcGetMyState() {
  return callRpc<{
    room: { status: string; started_at: string | null; ends_at: string | null; server_now: string };
    team: { slot: number; name: string; color: string; cash: number; is_bankrupt: boolean };
    businesses: Array<{
      business_key: string;
      name: string;
      level: number;
      cost: number;
    }>;
    final_result: {
      rank: number;
      cash: number;
      business_count: number;
      is_bankrupt: boolean;
    } | null;
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
  return mutate<any>('admin_open_lobby', { room_id });
}

export async function rpcAdminReleaseTeam(team_id: string) {
  return callRpc<{ team_id: string; released: boolean }>('admin_release_team', { team_id });
}

export async function rpcAdminStartGame(room_id: string, force = false) {
  return mutate<any>('admin_start_game', { room_id, force });
}

export async function rpcAdminAbortGame(room_id: string, note: string) {
  return mutate<any>('admin_abort_game', { p_room_id: room_id, note });
}

export async function rpcAdminCancelRoom(room_id: string, note = 'Cancelled by organizer') {
  return mutate<{
    room_id: string;
    status: string;
    cancelled: boolean;
  }>('admin_cancel_room', { p_room_id: room_id, note });
}

export async function rpcAdminExtendGame(room_id: string, additional_seconds = 600) {
  return mutate<{
    room_id: string;
    status: string;
    ends_at: string;
    duration_seconds: number;
  }>('admin_extend_game', { p_room_id: room_id, p_additional_seconds: additional_seconds });
}

// 4. Admin Edits
export async function rpcAdminSetTeamValues(params: {
  team_id: string;
  cash?: number | null;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return mutate<any>('admin_set_team_values', params);
}

export async function rpcAdminAdjust(params: {
  changes: Array<{ team_id: string; cash_delta: number; expected_version: number }>;
  label: string;
  note?: string;
  request_id?: string;
}) {
  return mutate<any>('admin_adjust', {
    changes: params.changes as unknown as Json,
    label: params.label,
    note: params.note,
    request_id: params.request_id,
  });
}

export async function rpcAdminChargeRent(params: {
  payer_team_id: string;
  business_key: string;
  payer_expected_version: number;
  owner_expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return mutate<any>('admin_charge_rent', params);
}

export async function rpcAdminAddBusiness(params: {
  team_id: string;
  business_key: string;
  apply_purchase?: boolean;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return mutate<any>('admin_add_business', params);
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
  return mutate<any>('admin_set_business_level', params);
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
  return mutate<any>('admin_remove_business', params);
}

export async function rpcAdminSetBankrupt(params: {
  team_id: string;
  value: boolean;
  expected_version: number;
  request_id?: string;
  note?: string;
}) {
  return mutate<any>('admin_set_bankrupt', params);
}

export async function rpcAdminMoveTeam(params: {
  team_id: string;
  steps: number;
  expected_version: number;
  request_id?: string;
}) {
  return mutate<any>('admin_move_team', params);
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
    board_position?: number;
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

export interface StandingsRow {
  team_id: string;
  slot: number;
  name: string;
  rank: number;
  is_bankrupt: boolean;
  cash: number;
  business_count: number;
  business_cost: number;
  upgrade_count: number;
}

export interface StandingsResponse {
  standings: StandingsRow[];
}

export interface HistoryRoomSummary {
  room_id: string;
  code: string;
  created_at: string;
  finalized_at: string;
  winner_name: string | null;
  winner_color: string | null;
  team_count: number;
}

export interface HistoryDetailResult {
  team_id: string;
  rank: number;
  name: string;
  color: string;
  cash: number;
  business_count: number;
  is_bankrupt: boolean;
}

export interface HistoryDetailResponse {
  room: {
    id: string;
    code: string;
    status: string;
    team_count: number;
    started_at: string | null;
    ends_at: string | null;
    created_at: string;
    finalized_at: string | null;
    winner_team_id: string | null;
    tiebreak_note?: string | null;
  };
  results: HistoryDetailResult[];
  events: AdminRoomSnapshot['events'];
}

// 5. Admin Inspection, Standings & History
export async function rpcGetAdminSnapshot(room_id: string): Promise<AdminRoomSnapshot> {
  return callRpc<AdminRoomSnapshot>('get_admin_snapshot', { room_id });
}

export async function rpcGetStandings(room_id: string): Promise<StandingsResponse> {
  return callRpc<StandingsResponse>('get_standings', { p_room_id: room_id });
}

export async function rpcAdminFinalize(room_id: string) {
  return mutate<{
    room_id: string;
    winner_team_id: string | null;
    standings: StandingsRow[];
  }>('admin_finalize', { p_room_id: room_id });
}

/** Current room status straight from the server (used to settle lifecycle calls whose outcome is unclear). */
export async function rpcRoomStatus(room_id: string): Promise<string> {
  return (await rpcGetAdminSnapshot(room_id)).room.status;
}

export async function rpcListHistory(): Promise<HistoryRoomSummary[]> {
  return callRpc<HistoryRoomSummary[]>('list_history');
}

export async function rpcGetHistoryDetail(room_id: string): Promise<HistoryDetailResponse> {
  return callRpc<HistoryDetailResponse>('get_history_detail', { room_id });
}

// Convenience Types
export type TeamStateResponse = NonNullable<Awaited<ReturnType<typeof rpcGetMyState>>>;
