import { Business, Level, StartReward } from './types';
export { formatINR } from '../lib/format';

export const OFFICIAL_BUSINESSES: Business[] = [
  { key: 'edtech', name: 'EdTech', cost: 200, u1_cost: 100, u2_cost: 150, is_provisional: false, sort_order: 1 },
  { key: 'saas', name: 'SaaS', cost: 300, u1_cost: 150, u2_cost: 200, is_provisional: false, sort_order: 2 },
  { key: 'ecommerce', name: 'E-Commerce', cost: 300, u1_cost: 150, u2_cost: 200, is_provisional: false, sort_order: 3 },
  { key: 'fintech', name: 'FinTech', cost: 400, u1_cost: 200, u2_cost: 250, is_provisional: false, sort_order: 4 },
  { key: 'healthtech', name: 'HealthTech', cost: 400, u1_cost: 200, u2_cost: 250, is_provisional: false, sort_order: 5 },
  { key: 'ai_deeptech', name: 'AI / DeepTech', cost: 500, u1_cost: 250, u2_cost: 300, is_provisional: false, sort_order: 6 },
  { key: 'devtools', name: 'DevTools / Infrastructure', cost: 300, u1_cost: 150, u2_cost: 200, is_provisional: true, sort_order: 7 },
  { key: 'cybersecurity', name: 'Cybersecurity', cost: 400, u1_cost: 200, u2_cost: 250, is_provisional: true, sort_order: 8 },
  { key: 'cleantech', name: 'CleanTech / Energy', cost: 500, u1_cost: 250, u2_cost: 300, is_provisional: true, sort_order: 9 },
  { key: 'robotics', name: 'Robotics & IoT', cost: 500, u1_cost: 250, u2_cost: 300, is_provisional: true, sort_order: 10 },
];

/** Approved rulebook tables, keyed by purchase cost: [base, level 1, level 2] rent and [upgrade 1, upgrade 2] cost. */
export const RENT_TABLE: Record<number, readonly [number, number, number]> = {
  200: [100, 150, 200], 300: [150, 225, 300], 400: [200, 300, 400], 500: [250, 375, 500],
};
export const UPGRADE_COST_TABLE: Record<number, readonly [number, number]> = {
  200: [100, 150], 300: [150, 200], 400: [200, 250], 500: [250, 300],
};
export const MAX_BUSINESSES_PER_TEAM = 2;

export function upgradeCost(b: Business, currentLevel: Level): number {
  return currentLevel === 2 ? 0 : UPGRADE_COST_TABLE[b.cost][currentLevel];
}

export function rentFor(b: Business, level: Level): number {
  return RENT_TABLE[b.cost][level];
}

export const START_REWARD = 200;

export function startReward(): StartReward {
  return { cash: START_REWARD };
}

export function resaleValue(b: Business): number {
  return b.cost;
}

export function canAddBusiness(count: number): boolean {
  return count < MAX_BUSINESSES_PER_TEAM;
}
