import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppError, CODE_CLASS, classifyRpcError } from './errors';
import { lifecycleAlreadyDone } from './lifecycle';

const pg = (message: string, code = 'P0001') => ({ message, code, details: '{}' });

describe('classifyRpcError', () => {
  const table: Array<[string, ReturnType<typeof classifyRpcError>]> = [
    ['VERSION_CONFLICT', 'CONFLICT'],
    ['BUSINESS_OWNED', 'CONFLICT'],
    ['NOT_ADMIN', 'NOT_ADMIN'],
    ['NOT_AUTHENTICATED', 'SESSION_EXPIRED'],
    ['ROOM_NOT_EDITABLE', 'ROOM_NOT_ACTIVE'],
    ['ROOM_ALREADY_EXPIRED', 'ROOM_NOT_ACTIVE'],
    ['INVALID_TRANSITION', 'ROOM_NOT_ACTIVE'],
    ['INSUFFICIENT_CASH', 'DEFINITELY_FAILED'],
    ['INVALID_VALUE', 'DEFINITELY_FAILED'],
    ['REQUEST_ID_REUSED', 'DEFINITELY_FAILED'],
    ['TOO_MANY_ATTEMPTS', 'DEFINITELY_FAILED'],
  ];
  it.each(table)('%s -> %s', (code, expected) => {
    expect(classifyRpcError(pg(code))).toBe(expected);
  });

  it('treats anything the server did not raise on purpose as an unknown outcome', () => {
    expect(classifyRpcError(new TypeError('Failed to fetch'))).toBe('OUTCOME_UNKNOWN');
    expect(classifyRpcError(pg('canceling statement due to statement timeout', '57014'))).toBe('OUTCOME_UNKNOWN');
    expect(classifyRpcError(pg('upstream connect error', '502'))).toBe('OUTCOME_UNKNOWN');
    expect(classifyRpcError(new AppError('NETWORK_ERROR'))).toBe('OUTCOME_UNKNOWN');
    expect(classifyRpcError(undefined)).toBe('OUTCOME_UNKNOWN');
  });

  it('classifies an expired JWT as a session problem', () => {
    expect(classifyRpcError(pg('JWT expired', 'PGRST301'))).toBe('SESSION_EXPIRED');
  });

  it('classifies every error code the migrations raise (a new RAISE must be classified here)', () => {
    const dir = join(process.cwd(), 'supabase', 'migrations');
    const codes = new Set<string>();
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.sql'))) {
      const sql = readFileSync(join(dir, f), 'utf8');
      for (const m of sql.matchAll(/raise_error\(\s*'([A-Z_]+)'/g)) codes.add(m[1]);
      for (const m of sql.matchAll(/RAISE EXCEPTION\s+'([A-Z_]+)'/g)) codes.add(m[1]);
    }
    expect(codes.size).toBeGreaterThan(15);
    const missing = [...codes].filter((c) => !(c in CODE_CLASS));
    expect(missing).toEqual([]);
  });
});

describe('lifecycleAlreadyDone', () => {
  const at = (status: string) => async () => status;

  it('counts an INVALID_TRANSITION as success when the room is already in the target state', async () => {
    expect(await lifecycleAlreadyDone(pg('INVALID_TRANSITION'), 'r', 'ACTIVE', at('ACTIVE'))).toBe(true);
  });
  it('counts a lost response as success when the room reached the target', async () => {
    expect(await lifecycleAlreadyDone(new TypeError('Failed to fetch'), 'r', 'LOBBY', at('LOBBY'))).toBe(true);
  });
  it('is not success when the room is somewhere else', async () => {
    expect(await lifecycleAlreadyDone(pg('INVALID_TRANSITION'), 'r', 'ACTIVE', at('LOBBY'))).toBe(false);
  });
  it('never turns a definite failure into success', async () => {
    expect(await lifecycleAlreadyDone(pg('TEAMS_NOT_JOINED'), 'r', 'ACTIVE', at('ACTIVE'))).toBe(false);
  });
  it('is not success when the status cannot be read', async () => {
    const boom = async () => {
      throw new Error('offline');
    };
    expect(await lifecycleAlreadyDone(pg('INVALID_TRANSITION'), 'r', 'ACTIVE', boom)).toBe(false);
  });
});
