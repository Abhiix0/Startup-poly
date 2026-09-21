export interface ClockSyncResult {
  offsetMs: number;
  rttMs: number;
}

export async function fetchServerOffset(fetchTimeFn: () => Promise<string>): Promise<ClockSyncResult> {
  const t0 = Date.now();
  const serverTimeIso = await fetchTimeFn();
  const t1 = Date.now();
  const rttMs = Math.max(0, t1 - t0);
  const serverTimeMs = new Date(serverTimeIso).getTime();
  const estimatedClientMidpoint = t0 + rttMs / 2;
  const offsetMs = serverTimeMs - estimatedClientMidpoint;

  return { offsetMs, rttMs };
}

export function getServerNow(offsetMs: number): number {
  return Date.now() + offsetMs;
}
