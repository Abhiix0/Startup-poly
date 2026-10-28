import { describe, it, expect } from 'vitest';
import {
  OFFICIAL_BUSINESSES,
  upgradeCost,
  rentFor,
  startReward,
  resaleValue,
  forcedSaleValue,
  canAddBusiness,
  RENT_TABLE,
  UPGRADE_COST_TABLE,
  MAX_BUSINESSES_PER_TEAM,
  formatINR,
} from './economy';

describe('Official Rulebook Economy Domain Logic', () => {
  it('contains exactly 10 official businesses', () => {
    expect(OFFICIAL_BUSINESSES).toHaveLength(10);
  });

  describe('Upgrade Costs', () => {
    OFFICIAL_BUSINESSES.forEach((b) => {
      it(`calculates upgrade costs for ${b.name}`, () => {
        // Level 0 -> 1
        expect(upgradeCost(b, 0)).toBe(b.u1_cost);

        // Level 1 -> 2
        expect(upgradeCost(b, 1)).toBe(b.u2_cost);

        // Max Level 2
        expect(upgradeCost(b, 2)).toBe(0);
      });
    });
  });

  describe('Approved rent and upgrade tables', () => {
    it.each([
      [200, [100, 150, 200], [100, 150]],
      [300, [150, 225, 300], [150, 200]],
      [400, [200, 300, 400], [200, 250]],
      [500, [250, 375, 500], [250, 300]],
    ])('cost %i tier', (cost, rent, upgrades) => {
      expect(RENT_TABLE[cost]).toEqual(rent);
      expect(UPGRADE_COST_TABLE[cost]).toEqual(upgrades);
      for (const b of OFFICIAL_BUSINESSES.filter((x) => x.cost === cost)) {
        expect([rentFor(b, 0), rentFor(b, 1), rentFor(b, 2)]).toEqual(rent);
        expect([upgradeCost(b, 0), upgradeCost(b, 1), upgradeCost(b, 2)]).toEqual([...upgrades, 0]);
        expect([b.u1_cost, b.u2_cost]).toEqual(upgrades);
      }
    });
  });

  describe('Rent Calculations (50%, 75%, 100%)', () => {
    it('calculates rent correctly for EdTech (200 cost)', () => {
      const edtech = OFFICIAL_BUSINESSES.find((b) => b.key === 'edtech')!;
      expect(rentFor(edtech, 0)).toBe(100);
      expect(rentFor(edtech, 1)).toBe(150);
      expect(rentFor(edtech, 2)).toBe(200);
    });

    it('calculates rent correctly for SaaS (300 cost)', () => {
      const saas = OFFICIAL_BUSINESSES.find((b) => b.key === 'saas')!;
      expect(rentFor(saas, 0)).toBe(150);
      expect(rentFor(saas, 1)).toBe(225);
      expect(rentFor(saas, 2)).toBe(300);
    });

    it('calculates rent correctly for AI / DeepTech (500 cost)', () => {
      const ai = OFFICIAL_BUSINESSES.find((b) => b.key === 'ai_deeptech')!;
      expect(rentFor(ai, 0)).toBe(250);
      expect(rentFor(ai, 1)).toBe(375);
      expect(rentFor(ai, 2)).toBe(500);
    });
  });

  describe('START Lap Rewards', () => {
    it('is a flat +₹200 cash with no other component', () => {
      expect(startReward()).toEqual({ cash: 200 });
    });
  });

  describe('Business Cap and Resale', () => {
    it('enforces maximum 2 businesses per team', () => {
      expect(MAX_BUSINESSES_PER_TEAM).toBe(2);
      expect(canAddBusiness(0)).toBe(true);
      expect(canAddBusiness(1)).toBe(true);
      expect(canAddBusiness(2)).toBe(false);
      expect(canAddBusiness(3)).toBe(false);
    });

    it('pays 50% of the purchase cost on a forced sale, whatever the upgrade level', () => {
      const fintech = OFFICIAL_BUSINESSES.find((b) => b.key === 'fintech')!;
      expect(resaleValue(fintech)).toBe(200);
      expect([200, 300, 400, 500].map(forcedSaleValue)).toEqual([100, 150, 200, 250]);
    });
  });

  describe('Formatters', () => {
    it('formats Indian Rupee amounts correctly', () => {
      expect(formatINR(1000)).toBe('₹1,000');
      expect(formatINR(150000)).toBe('₹1,50,000');
      expect(formatINR(-200)).toBe('-₹200');
      expect(formatINR(0)).toBe('₹0');
    });
  });
});
