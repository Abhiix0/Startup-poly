// Drift guard: business_catalog costs must equal the domain tables the UI uses.
import { describe, it, expect } from 'vitest';
import { harnessEnabled, localUrl } from '../concurrency/harness';
import { OFFICIAL_BUSINESSES } from '../../../src/domain/economy';

const run = harnessEnabled ? describe : describe.skip;

run('business_catalog parity with src/domain/economy.ts', () => {
  it('matches cost, upgrade costs and order for all ten businesses', async () => {
    const key = process.env.LOCAL_SERVICE_KEY!;
    const res = await fetch(`${localUrl()}/rest/v1/business_catalog?select=key,cost,u1_cost,u2_cost&order=key`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const rows = (await res.json()) as Array<{ key: string; cost: number; u1_cost: number; u2_cost: number }>;
    const expected = OFFICIAL_BUSINESSES.map(({ key: k, cost, u1_cost, u2_cost }) => ({ key: k, cost, u1_cost, u2_cost }))
      .sort((a, b) => a.key.localeCompare(b.key));
    expect(rows).toEqual(expected);
  });
});
