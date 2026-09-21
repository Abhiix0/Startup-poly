export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'NOT_ADMIN'
  | 'UNKNOWN';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message || code);
    this.name = 'AuthError';
    this.code = code;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export function mapSupabaseAuthError(error: any): AuthError {
  if (!error) {
    return new AuthError('UNKNOWN', 'Unknown authentication error.');
  }

  if (error instanceof AuthError) {
    return error;
  }

  const code = (error.code || '').toLowerCase();
  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.statusCode;

  // Rate limiting
  if (
    status === 429 ||
    code === 'over_request_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  ) {
    return new AuthError('RATE_LIMITED', 'Too many attempts. Wait a minute and try again.');
  }

  // Invalid credentials
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid email or password') ||
    msg.includes('invalid credentials')
  ) {
    return new AuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Network / Fetch errors
  if (
    error.name === 'AuthRetryableFetchError' ||
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network error') ||
    msg.includes('can\'t reach the server') ||
    msg.includes('connection refused')
  ) {
    return new AuthError('NETWORK', "Can't reach the server. Check your connection.");
  }

  if (code === 'not_admin' || msg.includes('not authorized for admin access')) {
    return new AuthError('NOT_ADMIN', 'This account is not authorized for admin access.');
  }

  return new AuthError('UNKNOWN', error.message || 'Sign-in failed. Try again.');
}
