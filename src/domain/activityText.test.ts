import { describe, it, expect } from 'vitest';
import { formatActivityEvent } from './activityText';

describe('formatActivityEvent', () => {
  const mockTeams = [
    { id: 'team-1', slot: 1, name: 'Alpha Rockets', color: '#E52521' },
    { id: 'team-2', slot: 2, name: 'Beta Builders', color: '#0099FF' },
  ];

  it('formats CASH_SET events with positive and negative deltas', () => {
    const eventUp = {
      id: 1,
      team_id: 'team-1',
      group_id: null,
      type: 'CASH_SET',
      prev: { cash: 1000 },
      new: { cash: 1200 },
      created_at: new Date().toISOString(),
    };
    const resUp = formatActivityEvent(eventUp, mockTeams);
    expect(resUp.sentence).toBe('Alpha Rockets cash ₹1,000 → ₹1,200');
    expect(resUp.deltaText).toBe('+₹200');
    expect(resUp.isPositive).toBe(true);

    const eventDown = {
      id: 2,
      team_id: 'team-1',
      group_id: null,
      type: 'CASH_SET',
      prev: { cash: 1000 },
      new: { cash: 850 },
      created_at: new Date().toISOString(),
    };
    const resDown = formatActivityEvent(eventDown, mockTeams);
    expect(resDown.sentence).toBe('Alpha Rockets cash ₹1,000 → ₹850');
    expect(resDown.deltaText).toBe('−₹150');
    expect(resDown.isNegative).toBe(true);
  });

  it('formats CV_SET events', () => {
    const event = {
      id: 3,
      team_id: 'team-2',
      group_id: null,
      type: 'CV_SET',
      prev: { cv: 200 },
      new: { cv: 500 },
      created_at: new Date().toISOString(),
    };
    const res = formatActivityEvent(event, mockTeams);
    expect(res.sentence).toBe('Beta Builders CV ₹200 → ₹500');
    expect(res.deltaText).toBe('+₹300');
  });

  it('formats BUSINESS_ADDED with and without apply_purchase', () => {
    const buyEvent = {
      id: 4,
      team_id: 'team-1',
      group_id: null,
      type: 'BUSINESS_ADDED',
      business_key: 'saas',
      new: { apply_purchase: true },
      created_at: new Date().toISOString(),
    };
    const resBuy = formatActivityEvent(buyEvent, mockTeams);
    expect(resBuy.sentence).toBe('Alpha Rockets bought SaaS');
    expect(resBuy.deltaText).toBe('−₹300');

    const manualEvent = {
      id: 5,
      team_id: 'team-1',
      group_id: null,
      type: 'BUSINESS_ADDED',
      business_key: 'saas',
      new: { apply_purchase: false },
      created_at: new Date().toISOString(),
    };
    const resManual = formatActivityEvent(manualEvent, mockTeams);
    expect(resManual.sentence).toBe('Alpha Rockets added SaaS (manual)');
  });

  it('formats BUSINESS_LEVEL_SET with upgrade vs manual', () => {
    const upgradeEvent = {
      id: 6,
      team_id: 'team-2',
      group_id: null,
      type: 'BUSINESS_LEVEL_SET',
      business_key: 'fintech',
      new: { level: 1, apply_upgrade: true },
      created_at: new Date().toISOString(),
    };
    const resUpgrade = formatActivityEvent(upgradeEvent, mockTeams);
    expect(resUpgrade.sentence).toBe('Beta Builders upgraded FinTech to Level 1');

    const manualEvent = {
      id: 7,
      team_id: 'team-2',
      group_id: null,
      type: 'BUSINESS_LEVEL_SET',
      business_key: 'fintech',
      new: { level: 2, apply_upgrade: false },
      created_at: new Date().toISOString(),
    };
    const resManual = formatActivityEvent(manualEvent, mockTeams);
    expect(resManual.sentence).toBe('Beta Builders set FinTech to Level 2');
  });

  it('formats BUSINESS_REMOVED for forced sale, bankruptcy, and correction', () => {
    const forcedEvent = {
      id: 8,
      team_id: 'team-1',
      group_id: null,
      type: 'BUSINESS_REMOVED',
      business_key: 'edtech',
      new: { reason: 'FORCED_SALE', credit_resale: true },
      created_at: new Date().toISOString(),
    };
    const resForced = formatActivityEvent(forcedEvent, mockTeams);
    expect(resForced.sentence).toBe('Alpha Rockets forced sale of EdTech');
    expect(resForced.deltaText).toBe('+₹200');

    const bankruptEvent = {
      id: 9,
      team_id: 'team-1',
      group_id: null,
      type: 'BUSINESS_REMOVED',
      business_key: 'edtech',
      new: { reason: 'BANKRUPTCY' },
      created_at: new Date().toISOString(),
    };
    const resBankrupt = formatActivityEvent(bankruptEvent, mockTeams);
    expect(resBankrupt.sentence).toBe('EdTech liquidated (bankruptcy)');

    const correctionEvent = {
      id: 10,
      team_id: 'team-1',
      group_id: null,
      type: 'BUSINESS_REMOVED',
      business_key: 'edtech',
      new: { reason: 'CORRECTION' },
      is_correction: true,
      note: 'Admin typo',
      created_at: new Date().toISOString(),
    };
    const resCorrection = formatActivityEvent(correctionEvent, mockTeams);
    expect(resCorrection.sentence).toBe('Alpha Rockets removed EdTech (correction)');
    expect(resCorrection.isCorrection).toBe(true);
    expect(resCorrection.note).toBe('Admin typo');
  });

  it('formats BANKRUPTCY_SET events', () => {
    const event = {
      id: 11,
      team_id: 'team-2',
      group_id: null,
      type: 'BANKRUPTCY_SET',
      new: { is_bankrupt: true },
      created_at: new Date().toISOString(),
    };
    const res = formatActivityEvent(event, mockTeams);
    expect(res.sentence).toBe('Beta Builders declared BANKRUPT');
    expect(res.isNegative).toBe(true);
  });

  it('formats system events', () => {
    expect(formatActivityEvent({ id: 12, team_id: null, group_id: null, type: 'GAME_STARTED', created_at: '' }).sentence)
      .toBe('Game started (50-minute match)');
    expect(formatActivityEvent({ id: 13, team_id: null, group_id: null, type: 'GAME_EXPIRED', created_at: '' }).sentence)
      .toBe('Game time expired — scores frozen');
  });
});
