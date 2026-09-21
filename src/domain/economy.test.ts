import { describe, it, expect } from 'vitest';
import {
  OFFICIAL_BUSINESSES,
  upgradeCost,
  upgradeCvGain,
  rentFor,
  landingCvFor,
  startReward,
  cvContribution,
  resaleValue,
  canAddBusiness,
  formatINR,
} from './economy';

describe('Official Rulebook Economy Domain Logic', () => {
  it('contains exactly 10 official businesses', () => {
    expect(OFFICIAL_BUSINESSES).toHaveLength(10);
  });

  describe('Upgrade Costs and CV Gains', () => {
    OFFICIAL_BUSINESSES.forEach((b) => {
      it(`calculates upgrade costs and gains for ${b.name}`, () => {
        // Level 0 -> 1
        expect(upgradeCost(b, 0)).toBe(b.u1_cost);
        expect(upgradeCvGain(b, 0)).toBe(300);

        // Level 1 -> 2
        expect(upgradeCost(b, 1)).toBe(b.u2_cost);
        expect(upgradeCvGain(b, 1)).toBe(400);

        // Max Level 2
        expect(upgradeCost(b, 2)).toBe(0);
        expect(upgradeCvGain(b, 2)).toBe(0);
      });
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

  describe('Landing CV (50%, 75%, 100% of Initial CV)', () => {
    it('calculates landing CV correctly for EdTech (150 initial CV)', () => {
      const edtech = OFFICIAL_BUSINESSES.find((b) => b.key === 'edtech')!;
      expect(landingCvFor(edtech, 0)).toBe(75);
      expect(landingCvFor(edtech, 1)).toBe(113); // round(150 * 0.75) = 113
      expect(landingCvFor(edtech, 2)).toBe(150);
    });

    it('calculates landing CV correctly for SaaS (180 initial CV)', () => {
      const saas = OFFICIAL_BUSINESSES.find((b) => b.key === 'saas')!;
      expect(landingCvFor(saas, 0)).toBe(90);
      expect(landingCvFor(saas, 1)).toBe(135);
      expect(landingCvFor(saas, 2)).toBe(180);
    });
  });

  describe('CV Contribution', () => {
    it('calculates cumulative CV contribution per business', () => {
      const saas = OFFICIAL_BUSINESSES.find((b) => b.key === 'saas')!;
      expect(cvContribution(saas, 0)).toBe(180);
      expect(cvContribution(saas, 1)).toBe(180 + 300); // 480
      expect(cvContribution(saas, 2)).toBe(180 + 300 + 400); // 880
    });
  });

  describe('START Lap Rewards', () => {
    it('gives +₹200 and 0 CV with 0 or 1 business', () => {
      expect(startReward(0)).toEqual({ cash: 200, cv: 0 });
      expect(startReward(1)).toEqual({ cash: 200, cv: 0 });
    });

    it('gives +₹200 and +200 CV with 2 businesses', () => {
      expect(startReward(2)).toEqual({ cash: 200, cv: 200 });
    });

    it('gives +₹200 and +500 CV with 3 or more businesses', () => {
      expect(startReward(3)).toEqual({ cash: 200, cv: 500 });
      expect(startReward(4)).toEqual({ cash: 200, cv: 500 });
    });
  });

  describe('Business Cap and Resale', () => {
    it('enforces maximum 3 businesses per team', () => {
      expect(canAddBusiness(0)).toBe(true);
      expect(canAddBusiness(1)).toBe(true);
      expect(canAddBusiness(2)).toBe(true);
      expect(canAddBusiness(3)).toBe(false);
      expect(canAddBusiness(4)).toBe(false);
    });

    it('calculates resale value equal to purchase cost', () => {
      const fintech = OFFICIAL_BUSINESSES.find((b) => b.key === 'fintech')!;
      expect(resaleValue(fintech)).toBe(400);
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
