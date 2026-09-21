/**
 * Structured Logger for STARTUPOLY Scoreboard.
 * Provides contextual logging with production payload sanitization and credential masking.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function isProduction(): boolean {
  try {
    return import.meta.env.PROD === true;
  } catch {
    return false;
  }
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > 500 ? `${value.slice(0, 500)}...[TRUNCATED]` : value;
  }
  if (Array.isArray(value)) {
    if (isProduction() && value.length > 20) {
      return `[Array(${value.length})]`;
    }
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase();
      if (
        lowerKey.includes('pin') ||
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token')
      ) {
        cleaned[k] = '***REDACTED***';
      } else if (isProduction() && typeof v === 'object' && v !== null && Object.keys(v).length > 20) {
        cleaned[k] = '[Object(keys > 20)]';
      } else {
        cleaned[k] = sanitizeValue(v);
      }
    }
    return cleaned;
  }
  return value;
}

function log(level: LogLevel, context: string, message: string, ...args: unknown[]) {
  const prod = isProduction();
  if (level === 'debug' && prod) {
    return;
  }

  const prefix = `[STARTUPOLY:${context}]`;
  const sanitizedArgs = prod ? args.map(sanitizeValue) : args;

  switch (level) {
    case 'debug':
      console.debug(prefix, message, ...sanitizedArgs);
      break;
    case 'info':
      console.info(prefix, message, ...sanitizedArgs);
      break;
    case 'warn':
      console.warn(prefix, message, ...sanitizedArgs);
      break;
    case 'error':
      console.error(prefix, message, ...sanitizedArgs);
      break;
  }
}

export const logger = {
  debug: (context: string, message: string, ...args: unknown[]) => log('debug', context, message, ...args),
  info: (context: string, message: string, ...args: unknown[]) => log('info', context, message, ...args),
  warn: (context: string, message: string, ...args: unknown[]) => log('warn', context, message, ...args),
  error: (context: string, message: string, ...args: unknown[]) => log('error', context, message, ...args),
};
