import { describe, it, expect } from 'vitest';
import { parseRpcError, AppError, ERROR_MAP } from './errors';

describe('parseRpcError', () => {
  it('parses known Postgres error codes properly', () => {
    const error = { message: 'INSUFFICIENT_CASH' };
    const appError = parseRpcError(error);

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.code).toBe('INSUFFICIENT_CASH');
    expect(appError.message).toBe(ERROR_MAP.INSUFFICIENT_CASH.message);
    expect(appError.retryable).toBe(false);
  });

  it('parses VERSION_CONFLICT as retryable error', () => {
    const error = { message: 'VERSION_CONFLICT' };
    const appError = parseRpcError(error);

    expect(appError.code).toBe('VERSION_CONFLICT');
    expect(appError.retryable).toBe(true);
    expect(appError.message).toBe(ERROR_MAP.VERSION_CONFLICT.message);
  });

  it('parses error with embedded JSON detail', () => {
    const error = {
      message: 'BUSINESS_ALREADY_OWNED',
      details: '{"owner_id": "abc-123"}',
    };
    const appError = parseRpcError(error);

    expect(appError.detail).toEqual({ owner_id: 'abc-123' });
  });

  it('handles unknown error messages with fallback', () => {
    const error = { message: 'Database connection dropped unexpectedly' };
    const appError = parseRpcError(error);

    expect(appError.code).toBe('UNKNOWN_ERROR');
    expect(appError.message).toBe('Database connection dropped unexpectedly');
    expect(appError.retryable).toBe(true);
  });

  it('handles null/undefined error objects gracefully', () => {
    const appError = parseRpcError(null);
    expect(appError.code).toBe('UNKNOWN_ERROR');
    expect(appError.message).toBe('An unexpected error occurred. Please try again.');
  });
});
