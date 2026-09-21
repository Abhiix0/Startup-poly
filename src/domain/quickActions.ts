import { OFFICIAL_BUSINESSES, rentFor, landingCvFor, startReward } from './economy';
import { Level } from './types';

export interface TeamState {
  id: string;
  name: string;
  slot?: number;
  color: string;
  cash: number;
  cv: number;
  is_bankrupt?: boolean;
  version: number;
  businesses: Array<{
    business_key: string;
    name: string;
    level: number;
    cost: number;
    initial_cv: number;
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
  cvBefore: number;
  cvDelta: number;
  cvAfter: number;
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
  cashDelta: number,
  cvDelta: number
): TeamChangePreview {
  const cashAfter = team.cash + cashDelta;
  const cvAfter = Math.max(0, team.cv + cvDelta);
  const shortfall = cashAfter < 0 ? Math.abs(cashAfter) : 0;

  return {
    teamId: team.id,
    teamName: team.name,
    teamColor: team.color,
    expectedVersion: team.version,
    cashBefore: team.cash,
    cashDelta,
    cashAfter,
    cvBefore: team.cv,
    cvDelta,
    cvAfter,
    shortfall,
  };
}

// 1. RENT: Payer lands on Owner's business
export function computeRent(
  payer: TeamState,
  businessKey: string,
  owner: TeamState,
  customRent?: number,
  customCv?: number
): QuickActionPreview {
  const ownedBiz = owner.businesses.find((b) => b.business_key === businessKey);
  const catalogBiz = OFFICIAL_BUSINESSES.find((b) => b.key === businessKey);

  const level = (ownedBiz?.level ?? 0) as Level;
  const cost = catalogBiz?.cost ?? ownedBiz?.cost ?? 200;
  const initialCv = catalogBiz?.initial_cv ?? ownedBiz?.initial_cv ?? 150;

  const defaultRent = catalogBiz ? rentFor(catalogBiz, level) : Math.round(cost * (level === 0 ? 0.5 : level === 1 ? 0.75 : 1));
  const defaultOwnerCv = catalogBiz ? landingCvFor(catalogBiz, level) : Math.round(initialCv * (level === 0 ? 0.5 : level === 1 ? 0.75 : 1));

  const rent = customRent !== undefined ? customRent : defaultRent;
  const ownerCv = customCv !== undefined ? customCv : defaultOwnerCv;

  const pct = level === 0 ? '50%' : level === 1 ? '75%' : '100%';
  const ruleExplanation = `Rent = ${pct} of ₹${cost} = ₹${rent}; owner CV +${ownerCv} (${pct} of ${initialCv})`;

  const payerChange = buildChange(payer, -rent, 0);
  const ownerChange = buildChange(owner, rent, ownerCv);

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

// 2. START LAP: Team passes or lands on START
export function computeStart(
  team: TeamState,
  customCash?: number,
  customCv?: number
): QuickActionPreview {
  const reward = startReward(team.businesses.length);
  const cashDelta = customCash !== undefined ? customCash : reward.cash;
  const cvDelta = customCv !== undefined ? customCv : reward.cv;

  const ruleExplanation = `START lap: +₹${cashDelta} cash; +${cvDelta} CV (${team.businesses.length} businesses owned)`;
  const teamChange = buildChange(team, cashDelta, cvDelta);

  return {
    label: 'START_LAP',
    ruleExplanation,
    changes: [teamChange],
    hasShortfall: false,
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

  const thiefChange = buildChange(thief, amount, 0);
  const victimChange = buildChange(victim, amount === 0 ? 0 : -amount, 0);

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
  customCash?: number,
  customCv?: number
): QuickActionPreview {
  let defaultCash = 0;
  let defaultCv = 0;
  let ruleText = '';

  switch (cardNo) {
    case 1:
      defaultCash = 300;
      defaultCv = 0;
      ruleText = 'Bonus #1: +₹300 cash';
      break;
    case 2:
      defaultCash = 0;
      defaultCv = 300;
      ruleText = 'Bonus #2: +300 CV';
      break;
    case 3:
      defaultCash = 200;
      defaultCv = 200;
      ruleText = 'Bonus #3: +₹200 cash, +200 CV';
      break;
    case 4: {
      const maxCost = team.businesses.reduce((acc, b) => Math.max(acc, b.cost), 0);
      defaultCash = maxCost;
      defaultCv = 0;
      ruleText = `Bonus #4: +₹${maxCost} cash (most expensive owned business)`;
      break;
    }
    case 5: {
      defaultCash = 100 * team.businesses.length;
      defaultCv = 0;
      ruleText = `Bonus #5: ₹100 × ${team.businesses.length} businesses = +₹${defaultCash} cash`;
      break;
    }
    case 6: {
      const roll = Math.min(6, Math.max(1, rewardRoll ?? 1));
      defaultCash = 100 * roll;
      defaultCv = 0;
      ruleText = `Bonus #6 (Lucky Break): ₹100 × roll ${roll} = +₹${defaultCash} cash`;
      break;
    }
    default:
      ruleText = `Bonus #${cardNo}`;
  }

  const cashDelta = customCash !== undefined ? customCash : defaultCash;
  const cvDelta = customCv !== undefined ? customCv : defaultCv;

  const teamChange = buildChange(team, cashDelta, cvDelta);

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
  customCash?: number,
  customCv?: number
): QuickActionPreview {
  let defaultCash = 0;
  let defaultCv = 0;
  let ruleText = '';

  switch (cardNo) {
    case 1:
      defaultCash = -300;
      defaultCv = 0;
      ruleText = 'Crisis #1: −₹300 cash';
      break;
    case 2:
      defaultCash = 0;
      defaultCv = -300;
      ruleText = 'Crisis #2: −300 CV';
      break;
    case 3:
      defaultCash = -200;
      defaultCv = -200;
      ruleText = 'Crisis #3: −₹200 cash, −200 CV';
      break;
    case 4: {
      defaultCash = -100 * team.businesses.length;
      defaultCv = 0;
      ruleText = `Crisis #4: −₹100 × ${team.businesses.length} businesses = −₹${Math.abs(defaultCash)} cash`;
      break;
    }
    case 5:
      defaultCash = -100;
      defaultCv = -200;
      ruleText = 'Crisis #5: −₹100 cash, −200 CV';
      break;
    case 6:
      defaultCash = -500;
      defaultCv = 0;
      ruleText = 'Crisis #6: −₹500 cash';
      break;
    default:
      ruleText = `Crisis #${cardNo}`;
  }

  const cashDelta = customCash !== undefined ? customCash : defaultCash;
  const cvDelta = customCv !== undefined ? customCv : defaultCv;

  const teamChange = buildChange(team, cashDelta, cvDelta);
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

// 6. LOSE FEATURE: −200 CV (floor 0)
export function computeLoseFeature(
  team: TeamState,
  customCv?: number
): QuickActionPreview {
  const cvDelta = customCv !== undefined ? customCv : -200;
  const ruleExplanation = 'Lose the Feature: −200 CV (floor 0)';
  const teamChange = buildChange(team, 0, cvDelta);

  return {
    label: 'LOSE_FEATURE',
    ruleExplanation,
    changes: [teamChange],
    hasShortfall: false,
  };
}
