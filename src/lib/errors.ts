export interface ErrorMeta {
  message: string;
  retryable: boolean;
}

export class AppError extends Error {
  readonly code: string;
  readonly detail: Record<string, unknown> | null;
  readonly retryable: boolean;

  constructor(code: string, message?: string, detail: Record<string, unknown> | null = null) {
    const meta = ERROR_MAP[code];
    super(message || meta?.message || `An error occurred: ${code}`);
    this.name = 'AppError';
    this.code = code;
    this.detail = detail;
    this.retryable = meta ? meta.retryable : code === 'UNKNOWN_ERROR' || code === 'NETWORK_ERROR';
  }
}

export const ERROR_MAP: Record<string, ErrorMeta> = {
  NOT_ADMIN: {
    message: 'Access denied: Admin credentials required.',
    retryable: false,
  },
  NOT_AUTHENTICATED: {
    message: 'Authentication session missing or expired. Please sign in or rejoin.',
    retryable: true,
  },
  ROOM_NOT_FOUND: {
    message: 'Match room not found or invalid room code.',
    retryable: false,
  },
  INVALID_TRANSITION: {
    message: 'Invalid room status transition requested.',
    retryable: false,
  },
  NOTE_REQUIRED: {
    message: 'A note explaining this change is required.',
    retryable: false,
  },
  TEAMS_NOT_JOINED: {
    message: 'Some teams have not joined yet. Use Force Start to proceed.',
    retryable: false,
  },
  ROOM_FINALIZED: {
    message: 'This match is finalized and can no longer change.',
    retryable: false,
  },
  IMMUTABLE: {
    message: 'This record is permanent and cannot be changed.',
    retryable: false,
  },
  ROOM_ALREADY_EXPIRED: {
    message: 'The match clock has run out. Finalize the result instead of aborting.',
    retryable: false,
  },
  REQUEST_ID_REUSED: {
    message: 'This action was already used for a different change. Please try again.',
    retryable: false,
  },
  INVALID_INITIAL_STATE: {
    message: 'The lobby is not in its starting state. Reset the room before starting.',
    retryable: false,
  },
  ROOM_NOT_EDITABLE: {
    message: 'Edits are not permitted in the current room status.',
    retryable: false,
  },
  VERSION_CONFLICT: {
    message: 'Team values were modified elsewhere. Please refresh and retry.',
    retryable: true,
  },
  INVALID_VALUE: {
    message: 'Invalid input value provided.',
    retryable: false,
  },
  INSUFFICIENT_CASH: {
    message: 'Insufficient cash: Team cannot afford this transaction without a forced sale.',
    retryable: false,
  },
  BUSINESS_CAP: {
    message: 'Business cap reached: Teams can own at most 3 businesses.',
    retryable: false,
  },
  BUSINESS_OWNED: {
    message: 'Business already owned: This business is currently owned by another team.',
    retryable: false,
  },
  BUSINESS_NOT_FOUND: {
    message: 'Business key not recognized in business catalog.',
    retryable: false,
  },
  BUSINESS_NOT_OWNED: {
    message: 'Team does not own this business.',
    retryable: false,
  },
  ALREADY_MAX_LEVEL: {
    message: 'Business is already at maximum upgrade level (Level 2).',
    retryable: false,
  },
  CANNOT_UPGRADE_ZERO_LEVEL: {
    message: 'Business must be owned before upgrading.',
    retryable: false,
  },
  TEAM_BANKRUPT: {
    message: 'Action rejected: Team is bankrupt.',
    retryable: false,
  },
  UNRESOLVED_TIE: {
    message: 'Tiebreak required: Teams share identical metrics. Set tiebreak order first.',
    retryable: false,
  },
  TEAM_ALREADY_CLAIMED: {
    message: 'This team is already connected on another phone. Ask the organiser to release it before rejoining.',
    retryable: false,
  },
  BAD_CODE_OR_PIN: {
    message: 'Invalid match code, team slot, or 4-digit PIN.',
    retryable: true,
  },
  TOO_MANY_ATTEMPTS: {
    message: 'Too many failed join attempts. Please wait 60 seconds before retrying.',
    retryable: true,
  },
  NON_FINAL_ROOM_EXISTS: {
    message: 'Another active match room exists. Finalize it before creating a new match.',
    retryable: false,
  },
  NETWORK_ERROR: {
    message: 'Network communication failure. Please check your connection.',
    retryable: true,
  },
};

export function parseRpcError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }

  if (typeof err === 'object' && err !== null) {
    const pgErr = err as { message?: string; code?: string; details?: string; hint?: string };
    const rawMsg = pgErr.message || '';
    let detail: Record<string, unknown> | null = null;

    if (pgErr.details) {
      try {
        detail = JSON.parse(pgErr.details);
      } catch {
        detail = { raw: pgErr.details };
      }
    }

    if (rawMsg in ERROR_MAP) {
      return new AppError(rawMsg, ERROR_MAP[rawMsg].message, detail);
    }

    return new AppError(
      pgErr.code || 'UNKNOWN_ERROR',
      rawMsg || 'An unexpected error occurred. Please try again.',
      detail
    );
  }

  return new AppError(
    'UNKNOWN_ERROR',
    err ? String(err) : 'An unexpected error occurred. Please try again.'
  );
}

export function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof AppError && err.code === 'NETWORK_ERROR') return true;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('load failed') ||
    msg.includes('timeout') ||
    msg.includes('connection refused') ||
    msg.includes('econnrefused') ||
    msg.includes('offline')
  );
}

export function isBusinessError(err: unknown): boolean {
  if (err instanceof AppError) {
    // Known business codes are explicitly non-network domain violations
    return err.code in ERROR_MAP && err.code !== 'NETWORK_ERROR';
  }
  return false;
}

/**
 * What a failed RPC means for the caller. COMMITTED is not an error class: it is what a successful call or a
 * request_id replay returns, listed so UI code can name all outcomes in one place.
 *  DEFINITELY_FAILED  the server rejected it and nothing was written
 *  CONFLICT           someone else changed the data first (refetch, then retry with fresh values)
 *  SESSION_EXPIRED    sign in again
 *  NOT_ADMIN          this account may not do that
 *  ROOM_NOT_ACTIVE    the room's status no longer allows it (the state may already be the one you wanted)
 *  OUTCOME_UNKNOWN    no trustworthy answer (network drop, timeout, 5xx): it may or may not have been applied
 */
export type RpcFailureClass =
  | 'DEFINITELY_FAILED'
  | 'CONFLICT'
  | 'SESSION_EXPIRED'
  | 'NOT_ADMIN'
  | 'ROOM_NOT_ACTIVE'
  | 'OUTCOME_UNKNOWN';
export type RpcOutcome = RpcFailureClass | 'COMMITTED';

// Every code the migrations raise must appear here (errors.test.ts greps the migrations and fails otherwise).
export const CODE_CLASS: Record<string, RpcFailureClass> = {
  BAD_CODE_OR_PIN: 'DEFINITELY_FAILED',
  BUSINESS_CAP: 'DEFINITELY_FAILED',
  BUSINESS_NOT_OWNED: 'DEFINITELY_FAILED',
  BUSINESS_OWNED: 'CONFLICT',
  INSUFFICIENT_CASH: 'DEFINITELY_FAILED',
  INVALID_INITIAL_STATE: 'DEFINITELY_FAILED',
  INVALID_TRANSITION: 'ROOM_NOT_ACTIVE',
  INVALID_VALUE: 'DEFINITELY_FAILED',
  NON_FINAL_ROOM_EXISTS: 'DEFINITELY_FAILED',
  NOT_ADMIN: 'NOT_ADMIN',
  NOT_AUTHENTICATED: 'SESSION_EXPIRED',
  NOTE_REQUIRED: 'DEFINITELY_FAILED',
  REQUEST_ID_REUSED: 'DEFINITELY_FAILED',
  ROOM_ALREADY_EXPIRED: 'ROOM_NOT_ACTIVE',
  ROOM_NOT_EDITABLE: 'ROOM_NOT_ACTIVE',
  ROOM_NOT_FOUND: 'DEFINITELY_FAILED',
  TEAM_ALREADY_CLAIMED: 'DEFINITELY_FAILED',
  TEAM_BANKRUPT: 'DEFINITELY_FAILED',
  TEAMS_NOT_JOINED: 'DEFINITELY_FAILED',
  TOO_MANY_ATTEMPTS: 'DEFINITELY_FAILED',
  UNRESOLVED_TIE: 'DEFINITELY_FAILED',
  VERSION_CONFLICT: 'CONFLICT',
  IMMUTABLE: 'ROOM_NOT_ACTIVE',
  ROOM_FINALIZED: 'ROOM_NOT_ACTIVE',
  OUTCOME_UNKNOWN: 'OUTCOME_UNKNOWN',
  PGRST301: 'SESSION_EXPIRED', // PostgREST: JWT expired
};

export function classifyRpcError(err: unknown): RpcFailureClass {
  // The server's raise_error code arrives as the message; read it directly so a code the client has no
  // friendly text for is still classified (parseRpcError would report the SQLSTATE P0001 instead).
  const raw = (err as { message?: unknown } | null | undefined)?.message;
  if (typeof raw === 'string' && raw in CODE_CLASS) return CODE_CLASS[raw];
  // Anything else (network drop, timeout, 5xx, unknown) could have committed.
  return CODE_CLASS[parseRpcError(err).code] ?? 'OUTCOME_UNKNOWN';
}
