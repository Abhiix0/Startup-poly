export interface BoardSpace {
  index: number;
  name: string;
  type:
    | 'START'
    | 'BUSINESS'
    | 'BONUS'
    | 'CRISIS'
    | 'WILDCARD'
    | 'ACTION_B'
    | 'ACTION_C'
    | 'ACTION_D';
  businessKey?: string;
  description: string;
  color?: string;
}

/**
 * STARTUPOLY Master Rulebook (Section 4):
 * Exactly 24 spaces in a square with four corners:
 * 0: START
 * 6: Action B
 * 12: Action C
 * 18: Action D
 * 5 ordinary spaces between each corner (1-5, 7-11, 13-17, 19-23).
 * Breakdown: START (1), Action (3), Businesses (10), Bonus (4), Crisis (4), Wildcard (2) = 24.
 */
export const TOTAL_BOARD_SPACES = 24;

export const BOARD_SPACES: BoardSpace[] = [
  // Corner 1
  {
    index: 0,
    name: 'START',
    type: 'START',
    description: 'Pass or land on START: +₹200 Cash. Growth bonus: 2 biz = +200 CV, 3 biz = +500 CV.',
  },
  // Quadrant 1 (Spaces 1–5)
  {
    index: 1,
    name: 'EdTech',
    type: 'BUSINESS',
    businessKey: 'edtech',
    description: 'Cost: ₹200 | Initial CV: 150 | U1: ₹150 (+300 CV) | U2: ₹200 (+400 CV)',
  },
  {
    index: 2,
    name: 'Bonus Card',
    type: 'BONUS',
    description: 'Draw Bonus Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 3,
    name: 'SaaS',
    type: 'BUSINESS',
    businessKey: 'saas',
    description: 'Cost: ₹300 | Initial CV: 180 | U1: ₹200 (+300 CV) | U2: ₹250 (+400 CV)',
  },
  {
    index: 4,
    name: 'Crisis Card',
    type: 'CRISIS',
    description: 'Draw Crisis Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 5,
    name: 'E-Commerce',
    type: 'BUSINESS',
    businessKey: 'ecommerce',
    description: 'Cost: ₹300 | Initial CV: 180 | U1: ₹200 (+300 CV) | U2: ₹250 (+400 CV)',
  },
  // Corner 2
  {
    index: 6,
    name: 'Action B: Pitch to Investors',
    type: 'ACTION_B',
    description: 'Pitch owned business in 30s. Own 0 biz: skip penalty-free. Refuse/fail: skip next turn.',
  },
  // Quadrant 2 (Spaces 7–11)
  {
    index: 7,
    name: 'FinTech',
    type: 'BUSINESS',
    businessKey: 'fintech',
    description: 'Cost: ₹400 | Initial CV: 200 | U1: ₹250 (+300 CV) | U2: ₹300 (+400 CV)',
  },
  {
    index: 8,
    name: 'Bonus Card',
    type: 'BONUS',
    description: 'Draw Bonus Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 9,
    name: 'HealthTech',
    type: 'BUSINESS',
    businessKey: 'healthtech',
    description: 'Cost: ₹400 | Initial CV: 200 | U1: ₹250 (+300 CV) | U2: ₹300 (+400 CV)',
  },
  {
    index: 10,
    name: 'Crisis Card',
    type: 'CRISIS',
    description: 'Draw Crisis Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 11,
    name: 'Wildcard',
    type: 'WILDCARD',
    description: 'Draw Wildcard Chit: perform mandatory quick physical/social challenge.',
  },
  // Corner 3
  {
    index: 12,
    name: 'Action C: Lose the Feature',
    type: 'ACTION_C',
    description: 'Tech debt strike: team immediately loses −200 Company Value (floor at 0).',
  },
  // Quadrant 3 (Spaces 13–17)
  {
    index: 13,
    name: 'AI / DeepTech',
    type: 'BUSINESS',
    businessKey: 'ai_deeptech',
    description: 'Cost: ₹500 | Initial CV: 250 | U1: ₹300 (+300 CV) | U2: ₹350 (+400 CV)',
  },
  {
    index: 14,
    name: 'Bonus Card',
    type: 'BONUS',
    description: 'Draw Bonus Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 15,
    name: 'DevTools / Infrastructure',
    type: 'BUSINESS',
    businessKey: 'devtools',
    description: 'Cost: ₹300 | Initial CV: 190 | U1: ₹200 (+300 CV) | U2: ₹250 (+400 CV)',
  },
  {
    index: 16,
    name: 'Crisis Card',
    type: 'CRISIS',
    description: 'Draw Crisis Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 17,
    name: 'Cybersecurity',
    type: 'BUSINESS',
    businessKey: 'cybersecurity',
    description: 'Cost: ₹400 | Initial CV: 220 | U1: ₹250 (+300 CV) | U2: ₹300 (+400 CV)',
  },
  // Corner 4
  {
    index: 18,
    name: 'Action D: Steal Talent',
    type: 'ACTION_D',
    description: 'Choose a target team and take up to ₹100 from them (₹0 target is valid).',
  },
  // Quadrant 4 (Spaces 19–23)
  {
    index: 19,
    name: 'CleanTech / Energy',
    type: 'BUSINESS',
    businessKey: 'cleantech',
    description: 'Cost: ₹500 | Initial CV: 240 | U1: ₹300 (+300 CV) | U2: ₹350 (+400 CV)',
  },
  {
    index: 20,
    name: 'Bonus Card',
    type: 'BONUS',
    description: 'Draw Bonus Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 21,
    name: 'Robotics & IoT',
    type: 'BUSINESS',
    businessKey: 'robotics',
    description: 'Cost: ₹500 | Initial CV: 250 | U1: ₹300 (+300 CV) | U2: ₹350 (+400 CV)',
  },
  {
    index: 22,
    name: 'Crisis Card',
    type: 'CRISIS',
    description: 'Draw Crisis Card (Cards 1–6 based on movement roll).',
  },
  {
    index: 23,
    name: 'Wildcard',
    type: 'WILDCARD',
    description: 'Draw Wildcard Chit: perform mandatory quick physical/social challenge.',
  },
];

export function getBoardSpace(index: number): BoardSpace {
  const normIndex = ((index % TOTAL_BOARD_SPACES) + TOTAL_BOARD_SPACES) % TOTAL_BOARD_SPACES;
  return BOARD_SPACES[normIndex];
}

export function calculateMovement(currentPos: number, diceRoll: number): {
  newPos: number;
  passedStart: boolean;
} {
  const rawTarget = currentPos + diceRoll;
  const newPos = rawTarget % TOTAL_BOARD_SPACES;
  const passedStart = rawTarget >= TOTAL_BOARD_SPACES;
  return { newPos, passedStart };
}

export interface CardOption {
  id: number;
  title: string;
  effectText: string;
  cashDelta: number;
  cvDelta: number;
}

export const REAL_BONUS_CARDS: CardOption[] = [
  { id: 1, title: 'Startup Grant', effectText: '+₹300 Cash', cashDelta: 300, cvDelta: 0 },
  { id: 2, title: 'Viral Growth', effectText: '+300 Company Value', cashDelta: 0, cvDelta: 300 },
  { id: 3, title: 'Government Incentive', effectText: '+₹200 Cash & +200 Company Value', cashDelta: 200, cvDelta: 200 },
  { id: 4, title: 'Premium Deal', effectText: 'Cash equal to purchase cost of most expensive owned business', cashDelta: 0, cvDelta: 0 },
  { id: 5, title: 'Founder Bonus', effectText: '₹100 × number of businesses owned', cashDelta: 0, cvDelta: 0 },
  { id: 6, title: 'Lucky Break', effectText: '+₹100 × Roll value in cash (reward roll)', cashDelta: 0, cvDelta: 0 },
];

export const REAL_CRISIS_CARDS: CardOption[] = [
  { id: 1, title: 'Tax Raid', effectText: '−₹300 Cash', cashDelta: -300, cvDelta: 0 },
  { id: 2, title: 'Market Crash', effectText: '−300 Company Value', cashDelta: 0, cvDelta: -300 },
  { id: 3, title: 'Legal Trouble', effectText: '−₹200 Cash & −200 Company Value', cashDelta: -200, cvDelta: -200 },
  { id: 4, title: 'Burn Rate Spike', effectText: '−₹100 Cash for every Business owned', cashDelta: 0, cvDelta: 0 },
  { id: 5, title: 'Bad PR', effectText: '−200 Company Value & −₹100 Cash', cashDelta: -100, cvDelta: -200 },
  { id: 6, title: 'Investor Pullout', effectText: '−₹500 Cash', cashDelta: -500, cvDelta: 0 },
];

export const WILDCARD_CHALLENGES: string[] = [
  'Give a 15-second elevator pitch for an imaginary startup to the Game Master',
  'Lead the room in a quick 10-second cheer for STARTUPOLY',
  'Hold a 10-second staring contest with the Game Master without blinking or smiling',
  'Spell "STARTUPOLY" backwards out loud without hesitating',
  'Execute a synchronized high-five chain with everyone at your station',
  'Do 5 quick victory jumping jacks or a 15-second founder plank',
];
