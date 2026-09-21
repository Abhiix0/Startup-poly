import { describe, it, expect } from 'vitest';
import {
  computeRent,
  computeStart,
  computeSteal,
  computeBonus,
  computeCrisis,
  computeLoseFeature,
  TeamState,
} from './quickActions';
import { OFFICIAL_BUSINESSES } from './economy';

describe('quickActions domain calculations', () => {
  const mockPayer: TeamState = {
    id: 't-payer',
    name: 'Payer Team',
    color: '#E52521',
    cash: 500,
    cv: 400,
    version: 1,
    businesses: [],
  };

  const mockOwner: TeamState = {
    id: 't-owner',
    name: 'Owner Team',
    color: '#0099FF',
    cash: 800,
    cv: 600,
    version: 2,
    businesses: [
      { business_key: 'saas', name: 'SaaS', level: 0, cost: 300, initial_cv: 180 },
      { business_key: 'edtech', name: 'EdTech', level: 1, cost: 200, initial_cv: 150 },
      { business_key: 'fintech', name: 'FinTech', level: 2, cost: 400, initial_cv: 200 },
    ],
  };

  describe('computeRent', () => {
    it('calculates Level 0 rent (50% cost and 50% initial CV)', () => {
      const preview = computeRent(mockPayer, 'saas', mockOwner);
      expect(preview.label).toBe('RENT');
      // SaaS: cost 300, initial_cv 180 -> rent 150, owner CV +90
      expect(preview.changes[0].cashDelta).toBe(-150);
      expect(preview.changes[0].cashAfter).toBe(350);
      expect(preview.changes[1].cashDelta).toBe(150);
      expect(preview.changes[1].cvDelta).toBe(90);
      expect(preview.hasShortfall).toBe(false);
      expect(preview.ruleExplanation).toContain('50% of ₹300 = ₹150');
    });

    it('calculates Level 1 rent (75% cost and 75% initial CV)', () => {
      const preview = computeRent(mockPayer, 'edtech', mockOwner);
      // EdTech: cost 200, initial_cv 150 -> rent 150, owner CV +113
      expect(preview.changes[0].cashDelta).toBe(-150);
      expect(preview.changes[1].cashDelta).toBe(150);
      expect(preview.changes[1].cvDelta).toBe(113);
    });

    it('calculates Level 2 rent (100% cost and 100% initial CV)', () => {
      const preview = computeRent(mockPayer, 'fintech', mockOwner);
      // FinTech: cost 400, initial_cv 200 -> rent 400, owner CV +200
      expect(preview.changes[0].cashDelta).toBe(-400);
      expect(preview.changes[1].cashDelta).toBe(400);
      expect(preview.changes[1].cvDelta).toBe(200);
    });

    it('detects shortfall when rent exceeds payer cash', () => {
      const poorPayer: TeamState = { ...mockPayer, cash: 100 };
      // FinTech rent is 400 -> shortfall is 300
      const preview = computeRent(poorPayer, 'fintech', mockOwner);
      expect(preview.hasShortfall).toBe(true);
      expect(preview.shortfallTeam?.shortfall).toBe(300);
      expect(preview.changes[0].shortfall).toBe(300);
    });

    it('allows custom override amounts', () => {
      const preview = computeRent(mockPayer, 'saas', mockOwner, 120, 80);
      expect(preview.changes[0].cashDelta).toBe(-120);
      expect(preview.changes[1].cashDelta).toBe(120);
      expect(preview.changes[1].cvDelta).toBe(80);
    });
  });

  describe('computeStart', () => {
    it('awards +200 cash and 0 CV for 0 or 1 businesses', () => {
      const p0 = computeStart({ ...mockPayer, businesses: [] });
      expect(p0.changes[0].cashDelta).toBe(200);
      expect(p0.changes[0].cvDelta).toBe(0);

      const p1 = computeStart({
        ...mockPayer,
        businesses: [{ business_key: 'saas', name: 'SaaS', level: 0, cost: 300, initial_cv: 180 }],
      });
      expect(p1.changes[0].cvDelta).toBe(0);
    });

    it('awards +200 cash and +200 CV for 2 businesses', () => {
      const p2 = computeStart({
        ...mockPayer,
        businesses: [
          { business_key: 'saas', name: 'SaaS', level: 0, cost: 300, initial_cv: 180 },
          { business_key: 'edtech', name: 'EdTech', level: 0, cost: 200, initial_cv: 150 },
        ],
      });
      expect(p2.changes[0].cashDelta).toBe(200);
      expect(p2.changes[0].cvDelta).toBe(200);
    });

    it('awards +200 cash and +500 CV for 3 businesses', () => {
      const p3 = computeStart(mockOwner);
      expect(p3.changes[0].cashDelta).toBe(200);
      expect(p3.changes[0].cvDelta).toBe(500);
    });
  });

  describe('computeSteal', () => {
    it('steals ₹100 when victim has ≥ ₹100', () => {
      const preview = computeSteal(mockPayer, mockOwner);
      expect(preview.changes[0].cashDelta).toBe(100);
      expect(preview.changes[1].cashDelta).toBe(-100);
      expect(preview.hasShortfall).toBe(false);
    });

    it('steals all victim cash when victim has less than ₹100', () => {
      const victim60: TeamState = { ...mockOwner, cash: 60 };
      const preview = computeSteal(mockPayer, victim60);
      expect(preview.changes[0].cashDelta).toBe(60);
      expect(preview.changes[1].cashDelta).toBe(-60);
      expect(preview.hasShortfall).toBe(false);
    });

    it('steals ₹0 when victim has ₹0 cash without triggering shortfall', () => {
      const brokeVictim: TeamState = { ...mockOwner, cash: 0 };
      const preview = computeSteal(mockPayer, brokeVictim);
      expect(preview.changes[0].cashDelta).toBe(0);
      expect(preview.changes[1].cashDelta).toBe(0);
      expect(preview.hasShortfall).toBe(false);
    });
  });

  describe('computeBonus', () => {
    it('computes Card #1: +₹300 cash', () => {
      const res = computeBonus(mockPayer, 1);
      expect(res.changes[0].cashDelta).toBe(300);
      expect(res.changes[0].cvDelta).toBe(0);
    });

    it('computes Card #2: +300 CV', () => {
      const res = computeBonus(mockPayer, 2);
      expect(res.changes[0].cashDelta).toBe(0);
      expect(res.changes[0].cvDelta).toBe(300);
    });

    it('computes Card #3: +₹200 and +200 CV', () => {
      const res = computeBonus(mockPayer, 3);
      expect(res.changes[0].cashDelta).toBe(200);
      expect(res.changes[0].cvDelta).toBe(200);
    });

    it('computes Card #4: purchase cost of most expensive owned business', () => {
      // mockOwner owns SaaS (300), EdTech (200), FinTech (400) -> max is 400
      const res = computeBonus(mockOwner, 4);
      expect(res.changes[0].cashDelta).toBe(400);

      // Team with no businesses gets 0
      const resZero = computeBonus(mockPayer, 4);
      expect(resZero.changes[0].cashDelta).toBe(0);
    });

    it('computes Card #5: ₹100 × businesses owned', () => {
      const res = computeBonus(mockOwner, 5); // 3 businesses
      expect(res.changes[0].cashDelta).toBe(300);
    });

    it('computes Card #6 Lucky Break: ₹100 × reward roll', () => {
      expect(computeBonus(mockPayer, 6, 4).changes[0].cashDelta).toBe(400);
      expect(computeBonus(mockPayer, 6, 6).changes[0].cashDelta).toBe(600);
      expect(computeBonus(mockPayer, 6, 1).changes[0].cashDelta).toBe(100);
    });
  });

  describe('computeCrisis', () => {
    it('computes Card #1: −₹300 cash', () => {
      const res = computeCrisis(mockPayer, 1);
      expect(res.changes[0].cashDelta).toBe(-300);
    });

    it('computes Card #2: −300 CV', () => {
      const res = computeCrisis(mockPayer, 2);
      expect(res.changes[0].cvDelta).toBe(-300);
    });

    it('computes Card #3: −₹200 and −200 CV', () => {
      const res = computeCrisis(mockPayer, 3);
      expect(res.changes[0].cashDelta).toBe(-200);
      expect(res.changes[0].cvDelta).toBe(-200);
    });

    it('computes Card #4: −₹100 × businesses owned', () => {
      const res = computeCrisis(mockOwner, 4); // 3 businesses -> -300
      expect(res.changes[0].cashDelta).toBe(-300);
    });

    it('computes Card #5: −₹100 cash and −200 CV', () => {
      const res = computeCrisis(mockPayer, 5);
      expect(res.changes[0].cashDelta).toBe(-100);
      expect(res.changes[0].cvDelta).toBe(-200);
    });

    it('computes Card #6: −₹500 cash with shortfall detection', () => {
      const poorTeam: TeamState = { ...mockPayer, cash: 200 };
      const res = computeCrisis(poorTeam, 6); // needs 500, has 200 -> shortfall 300
      expect(res.changes[0].cashDelta).toBe(-500);
      expect(res.hasShortfall).toBe(true);
      expect(res.shortfallTeam?.shortfall).toBe(300);
    });
  });

  describe('computeLoseFeature', () => {
    it('deducts 200 CV and clamps at 0', () => {
      const res = computeLoseFeature(mockPayer);
      expect(res.changes[0].cvDelta).toBe(-200);
      expect(res.changes[0].cvAfter).toBe(200); // 400 - 200 = 200

      const lowCvTeam: TeamState = { ...mockPayer, cv: 100 };
      const resClamped = computeLoseFeature(lowCvTeam);
      expect(resClamped.changes[0].cvAfter).toBe(0); // 100 - 200 clamped to 0
    });
  });
});
