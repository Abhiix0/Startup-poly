/**
 * Shared host guard for every script that can mutate data.
 * Passes only for localhost / 127.0.0.1. A remote target needs BOTH the
 * `--allow-remote` flag and the env var I_UNDERSTAND_THIS_IS_REMOTE=1.
 */

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export function checkTarget(
  url: string,
  args: readonly string[],
  env: Record<string, string | undefined>,
): { ok: true } | { ok: false; reason: string } {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return { ok: false, reason: `Target URL "${url}" is not a valid URL.` };
  }
  if (LOCAL_HOSTS.has(host)) return { ok: true };
  if (args.includes('--allow-remote') && env.I_UNDERSTAND_THIS_IS_REMOTE === '1') return { ok: true };
  return {
    ok: false,
    reason:
      `Target host "${host}" is not localhost/127.0.0.1. ` +
      'A remote run needs --allow-remote AND I_UNDERSTAND_THIS_IS_REMOTE=1.',
  };
}

export function assertLocal(url: string, args: readonly string[] = process.argv.slice(2)): void {
  const result = checkTarget(url, args, process.env);
  if (!result.ok) {
    console.error(`⛔ SAFETY ABORT: ${result.reason}`);
    process.exit(1);
  }
  console.log(`Target host check passed: ${new URL(url).host}`);
}
