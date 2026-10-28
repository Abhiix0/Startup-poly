import { OFFICIAL_BUSINESSES, rentFor } from './economy';
import { Level } from './types';

export interface TeamState {
  id: string;
  name: string;
  slot?: number;
  color: string;
  cash: number;
  is_bankrupt?: boolean;
  version: number;
  businesses: Array<{
    business_key: string;
    name: string;
    level: number;
    cost: number;
  }>;
}

export interface TeamChangePreview {
  teamId: string;
  teamName: string;
  teamColor: string;
  expectedVersion: number;
  cashBefore: number;
  cashDelta: number;
  cashAfter: number;
  shortfall: number;
}

export interface QuickActionPreview {
  label: string;
  ruleExplanation: string;
  changes: TeamChangePreview[];
  hasShortfall: boolean;
  shortfallTeam?: {
    id: string;
    name: string;
    shortfall: number;
  };
}

function buildChange(
  team: TeamState,
  cashDelta: number
): TeamChangePreview {
  const cashAfter = team.cash + cashDelta;
  const shortfall = cashAfter < 0 ? Math.abs(cashAfter) : 0;

  return {
    teamId: team.id,
    teamName: team.name,
    teamColor: team.color,
    expectedVersion: team.version,
    cashBefore: team.cash,
    cashDelta,
    cashAfter,
    shortfall,
  };
}

// 1. RENT: Payer lands on Owner's business
export function computeRent(
  payer: TeamState,
  businessKey: string,
  owner: TeamState
): QuickActionPreview {
  const ownedBiz = owner.businesses.find((b) => b.business_key === businessKey);
  const catalogBiz = OFFICIAL_BUSINESSES.find((b) => b.key === businessKey);

  const level = (ownedBiz?.level ?? 0) as Level;
  const cost = catalogBiz?.cost ?? ownedBiz?.cost ?? 200;

  const defaultRent = catalogBiz ? rentFor(catalogBiz, level) : Math.round(cost * (level === 0 ? 0.5 : level === 1 ? 0.75 : 1));

  const rent = defaultRent;

  const pct = level === 0 ? '50%' : level === 1 ? '75%' : '100%';
  const ruleExplanation = `Rent = ${pct} of ₹${cost} = ₹${rent}`;

  const payerChange = buildChange(payer, -rent);
  const ownerChange = buildChange(owner, rent);

  const changes = [payerChange, ownerChange];
  const hasShortfall = payerChange.shortfall > 0;

  return {
    label: 'RENT',
    ruleExplanation,
    changes,
    hasShortfall,
    shortfallTeam: hasShortfall
      ? { id: payer.id, name: payer.name, shortfall: payerChange.shortfall }
      : undefined,
  };
}

// 3. STEAL TALENT: Chosen team takes up to ₹100 from victim
export function computeSteal(
  thief: TeamState,
  victim: TeamState,
  customAmount?: number
): QuickActionPreview {
  const maxSteal = Math.min(100, Math.max(0, victim.cash));
  const amount = customAmount !== undefined ? Math.max(0, customAmount) : maxSteal;

  const ruleExplanation =
    victim.cash >= 100
      ? `Steal Talent: ${thief.name} takes ₹${amount} from ${victim.name}`
      : `Steal Talent: ${thief.name} takes ₹${amount} (all ${victim.name} had: ₹${victim.cash})`;

  const thiefChange = buildChange(thief, amount);
  const victimChange = buildChange(victim, amount === 0 ? 0 : -amount);

  const changes = [thiefChange, victimChange];
  const hasShortfall = victimChange.shortfall > 0;

  return {
    label: 'STEAL_TALENT',
    ruleExplanation,
    changes,
    hasShortfall,
    shortfallTeam: hasShortfall
      ? { id: victim.id, name: victim.name, shortfall: victimChange.shortfall }
      : undefined,
  };
}

// 4. BONUS CARD: Cards 1-6
export function computeBonus(
  team: TeamState,
  cardNo: number,
  rewardRoll?: number,
  customCash?: number
): QuickActionPreview {
  let defaultCash = 0;
  let ruleText = '';

  switch (cardNo) {
    case 1:
      defaultCash = 300;
      ruleText = 'Bonus #1: +₹300 cash';
      break;
    case 2:
      defaultCash = 300;
      ruleText = 'Bonus #2: +₹300 cash';
      break;
    case 3:
      defaultCash = 200;
      ruleText = 'Bonus #3: +₹200 cash';
      break;
    case 4: {
      const maxCost = team.businesses.reduce((acc, b) => Math.max(acc, b.cost), 0);
      defaultCash = maxCost;
      ruleText = `Bonus #4: +₹${maxCost} cash (most expensive owned business)`;
      break;
    }
    case 5: {
      defaultCash = 100 * team.businesses.length;
      ruleText = `Bonus #5: ₹100 × ${team.businesses.length} businesses = +₹${defaultCash} cash`;
      break;
    }
    case 6: {
      const roll = Math.min(6, Math.max(1, rewardRoll ?? 1));
      defaultCash = 100 * roll;
      ruleText = `Bonus #6 (Lucky Break): ₹100 × roll ${roll} = +₹${defaultCash} cash`;
      break;
    }
    default:
      ruleText = `Bonus #${cardNo}`;
  }

  const cashDelta = customCash !== undefined ? customCash : defaultCash;

  const teamChange = buildChange(team, cashDelta);

  return {
    label: `BONUS_CARD_${cardNo}`,
    ruleExplanation: ruleText,
    changes: [teamChange],
    hasShortfall: teamChange.shortfall > 0,
  };
}

// 5. CRISIS CARD: Cards 1-6
export function computeCrisis(
  team: TeamState,
  cardNo: number,
  customCash?: number
): QuickActionPreview {
  let defaultCash = 0;
  let ruleText = '';

  switch (cardNo) {
    case 1:
      defaultCash = -300;
      ruleText = 'Crisis #1: −₹300 cash';
      break;
    case 2:
      defaultCash = -300;
      ruleText = 'Crisis #2: −₹300 cash';
      break;
    case 3:
      defaultCash = -200;
      ruleText = 'Crisis #3: −₹200 cash';
      break;
    case 4: {
      defaultCash = -100 * team.businesses.length;
      ruleText = `Crisis #4: −₹100 × ${team.businesses.length} businesses = −₹${Math.abs(defaultCash)} cash`;
      break;
    }
    case 5:
      defaultCash = -100;
      ruleText = 'Crisis #5: −₹100 cash';
      break;
    case 6:
      defaultCash = -500;
      ruleText = 'Crisis #6: −₹500 cash';
      break;
    default:
      ruleText = `Crisis #${cardNo}`;
  }

  const cashDelta = customCash !== undefined ? customCash : defaultCash;

  const teamChange = buildChange(team, cashDelta);
  const hasShortfall = teamChange.shortfall > 0;

  return {
    label: `CRISIS_CARD_${cardNo}`,
    ruleExplanation: ruleText,
    changes: [teamChange],
    hasShortfall,
    shortfallTeam: hasShortfall
      ? { id: team.id, name: team.name, shortfall: teamChange.shortfall }
      : undefined,
  };
}

// 6. ACTION C (Lose the Feature): pay ₹200 cash to the Bank
export function computeLoseFeature(
  team: TeamState,
  customCash?: number
): QuickActionPreview {
  const cashDelta = customCash !== undefined ? customCash : -200;
  const teamChange = buildChange(team, cashDelta);
  const hasShortfall = teamChange.shortfall > 0;

  return {
    label: 'LOSE_FEATURE',
    ruleExplanation: 'Tech Debt Strike: pay ₹200 cash to the Bank',
    changes: [teamChange],
    hasShortfall,
    shortfallTeam: hasShortfall
      ? { id: team.id, name: team.name, shortfall: teamChange.shortfall }
      : undefined,
  };
}
