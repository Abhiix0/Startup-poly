export interface ClockSyncResult {
  offsetMs: number;
  rttMs: number;
}

export interface ClockSample {
  offsetMs: number;
  rttMs: number;
  timestamp: number;
}

/**
 * Fetches current server time via an RPC or endpoint, measuring round-trip time (RTT)
 * and calculating the clock offset (serverNow - clientNow).
 */
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

/**
 * Adds a new clock sample to a rolling sample buffer (max 3 by default).
 */
export function addClockSample(
  samples: ClockSample[],
  newSample: ClockSyncResult,
  maxSamples = 3
): ClockSample[] {
  const updated = [...samples, { ...newSample, timestamp: Date.now() }];
  if (updated.length > maxSamples) {
    return updated.slice(updated.length - maxSamples);
  }
  return updated;
}

/**
 * Selects the clock sample with the lowest RTT from the rolling buffer.
 * Lower RTT minimizes one-way network asymmetry error.
 */
export function selectBestClockSample(samples: ClockSample[]): ClockSample | null {
  if (!samples || samples.length === 0) return null;
  let best = samples[0];
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].rttMs < best.rttMs) {
      best = samples[i];
    }
  }
  return best;
}

export function getServerNow(offsetMs: number): number {
  return Date.now() + offsetMs;
}
