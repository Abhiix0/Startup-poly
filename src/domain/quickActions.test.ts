import { describe, it, expect } from 'vitest';
import {
  computeRent,
  computeSteal,
  computeBonus,
  computeCrisis,
  computeLoseFeature,
  TeamState,
} from './quickActions';

describe('quickActions domain calculations', () => {
  const mockPayer: TeamState = {
    id: 't-payer',
    name: 'Payer Team',
    color: '#E52521',
    cash: 500,
    version: 1,
    businesses: [],
  };

  const mockOwner: TeamState = {
    id: 't-owner',
    name: 'Owner Team',
    color: '#0099FF',
    cash: 800,
    version: 2,
    businesses: [
      { business_key: 'saas', name: 'SaaS', level: 0, cost: 300 },
      { business_key: 'edtech', name: 'EdTech', level: 1, cost: 200 },
      { business_key: 'fintech', name: 'FinTech', level: 2, cost: 400 },
    ],
  };

  describe('computeRent', () => {
    it('calculates Level 0 rent (50% of cost)', () => {
      const preview = computeRent(mockPayer, 'saas', mockOwner);
      expect(preview.label).toBe('RENT');
      // SaaS: cost 300 -> rent 150
      expect(preview.changes[0].cashDelta).toBe(-150);
      expect(preview.changes[0].cashAfter).toBe(350);
      expect(preview.changes[1].cashDelta).toBe(150);
      expect(preview.hasShortfall).toBe(false);
      expect(preview.ruleExplanation).toContain('50% of ₹300 = ₹150');
    });

    it('calculates Level 1 rent (75% of cost)', () => {
      const preview = computeRent(mockPayer, 'edtech', mockOwner);
      // EdTech: cost 200 -> rent 150
      expect(preview.changes[0].cashDelta).toBe(-150);
      expect(preview.changes[1].cashDelta).toBe(150);
    });

    it('calculates Level 2 rent (100% of cost)', () => {
      const preview = computeRent(mockPayer, 'fintech', mockOwner);
      // FinTech: cost 400 -> rent 400
      expect(preview.changes[0].cashDelta).toBe(-400);
      expect(preview.changes[1].cashDelta).toBe(400);
    });

    it('detects shortfall when rent exceeds payer cash', () => {
      const poorPayer: TeamState = { ...mockPayer, cash: 100 };
      // FinTech rent is 400 -> shortfall is 300
      const preview = computeRent(poorPayer, 'fintech', mockOwner);
      expect(preview.hasShortfall).toBe(true);
      expect(preview.shortfallTeam?.shortfall).toBe(300);
      expect(preview.changes[0].shortfall).toBe(300);
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
    });

    it('computes Card #2: +₹300 cash', () => {
      const res = computeBonus(mockPayer, 2);
      expect(res.changes[0].cashDelta).toBe(300);
    });

    it('computes Card #3: +₹200 cash', () => {
      const res = computeBonus(mockPayer, 3);
      expect(res.changes[0].cashDelta).toBe(200);
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

    it('computes Card #2: −₹300 cash', () => {
      const res = computeCrisis(mockPayer, 2);
      expect(res.changes[0].cashDelta).toBe(-300);
    });

    it('computes Card #3: −₹200 cash', () => {
      const res = computeCrisis(mockPayer, 3);
      expect(res.changes[0].cashDelta).toBe(-200);
    });

    it('computes Card #4: −₹100 × businesses owned', () => {
      const res = computeCrisis(mockOwner, 4); // 3 businesses -> -300
      expect(res.changes[0].cashDelta).toBe(-300);
    });

    it('computes Card #5: −₹100 cash', () => {
      const res = computeCrisis(mockPayer, 5);
      expect(res.changes[0].cashDelta).toBe(-100);
    });

    it('computes Card #6: −₹500 cash with shortfall detection', () => {
      const poorTeam: TeamState = { ...mockPayer, cash: 200 };
      const res = computeCrisis(poorTeam, 6); // needs 500, has 200 -> shortfall 300
      expect(res.changes[0].cashDelta).toBe(-500);
      expect(res.hasShortfall).toBe(true);
      expect(res.shortfallTeam?.shortfall).toBe(300);
    });
  });

  describe('computeLoseFeature (Action C)', () => {
    it('charges ₹200 cash to the Bank', () => {
      const res = computeLoseFeature(mockPayer);
      expect(res.changes[0].cashDelta).toBe(-200);
      expect(res.changes[0].cashAfter).toBe(300);
      expect(res.hasShortfall).toBe(false);
    });

    it('reports a shortfall when the team cannot pay', () => {
      const res = computeLoseFeature({ ...mockPayer, cash: 150 });
      expect(res.hasShortfall).toBe(true);
      expect(res.shortfallTeam?.shortfall).toBe(50);
    });
  });
});
