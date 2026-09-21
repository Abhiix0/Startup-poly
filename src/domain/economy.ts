import { Business, Level, StartReward } from './types';
export { formatINR } from '../lib/format';

export const OFFICIAL_BUSINESSES: Business[] = [
  { key: 'edtech', name: 'EdTech', cost: 200, initial_cv: 150, u1_cost: 150, u2_cost: 200, u1_cv: 300, u2_cv: 400, is_provisional: false, sort_order: 1 },
  { key: 'saas', name: 'SaaS', cost: 300, initial_cv: 180, u1_cost: 200, u2_cost: 250, u1_cv: 300, u2_cv: 400, is_provisional: false, sort_order: 2 },
  { key: 'ecommerce', name: 'E-Commerce', cost: 300, initial_cv: 180, u1_cost: 200, u2_cost: 250, u1_cv: 300, u2_cv: 400, is_provisional: false, sort_order: 3 },
  { key: 'fintech', name: 'FinTech', cost: 400, initial_cv: 200, u1_cost: 250, u2_cost: 300, u1_cv: 300, u2_cv: 400, is_provisional: false, sort_order: 4 },
  { key: 'healthtech', name: 'HealthTech', cost: 400, initial_cv: 200, u1_cost: 250, u2_cost: 300, u1_cv: 300, u2_cv: 400, is_provisional: false, sort_order: 5 },
  { key: 'ai_deeptech', name: 'AI / DeepTech', cost: 500, initial_cv: 250, u1_cost: 300, u2_cost: 350, u1_cv: 300, u2_cv: 400, is_provisional: false, sort_order: 6 },
  { key: 'devtools', name: 'DevTools / Infrastructure', cost: 300, initial_cv: 190, u1_cost: 200, u2_cost: 250, u1_cv: 300, u2_cv: 400, is_provisional: true, sort_order: 7 },
  { key: 'cybersecurity', name: 'Cybersecurity', cost: 400, initial_cv: 220, u1_cost: 250, u2_cost: 300, u1_cv: 300, u2_cv: 400, is_provisional: true, sort_order: 8 },
  { key: 'cleantech', name: 'CleanTech / Energy', cost: 500, initial_cv: 240, u1_cost: 300, u2_cost: 350, u1_cv: 300, u2_cv: 400, is_provisional: true, sort_order: 9 },
  { key: 'robotics', name: 'Robotics & IoT', cost: 500, initial_cv: 250, u1_cost: 300, u2_cost: 350, u1_cv: 300, u2_cv: 400, is_provisional: true, sort_order: 10 },
];

export function upgradeCost(b: Business, currentLevel: Level): number {
  if (currentLevel === 0) return b.u1_cost;
  if (currentLevel === 1) return b.u2_cost;
  return 0;
}

export function upgradeCvGain(b: Business, currentLevel: Level): number {
  if (currentLevel === 0) return b.u1_cv;
  if (currentLevel === 1) return b.u2_cv;
  return 0;
}

export function rentFor(b: Business, level: Level): number {
  if (level === 0) return Math.round(b.cost * 0.5);
  if (level === 1) return Math.round(b.cost * 0.75);
  return b.cost;
}

export function landingCvFor(b: Business, level: Level): number {
  if (level === 0) return Math.round(b.initial_cv * 0.5);
  if (level === 1) return Math.round(b.initial_cv * 0.75);
  return b.initial_cv;
}

export function startReward(businessCount: number): StartReward {
  let cv = 0;
  if (businessCount >= 3) {
    cv = 500;
  } else if (businessCount === 2) {
    cv = 200;
  }
  return { cash: 200, cv };
}

export function cvContribution(b: Business, level: Level): number {
  return b.initial_cv + (level >= 1 ? b.u1_cv : 0) + (level >= 2 ? b.u2_cv : 0);
}

export function resaleValue(b: Business): number {
  return b.cost;
}

export function canAddBusiness(count: number): boolean {
  return count < 3;
}
