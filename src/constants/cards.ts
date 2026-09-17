import { CardDefinition } from '../types/game';

export const BONUS_CARDS: CardDefinition[] = [
  {
    number: 1,
    name: 'Startup Grant',
    type: 'bonus',
    description: 'Government non-dilutive innovation grant awarded.',
    effectText: '+₹300 Cash',
  },
  {
    number: 2,
    name: 'Viral Growth',
    type: 'bonus',
    description: 'Product feature went viral on social media.',
    effectText: '+300 Company Value',
  },
  {
    number: 3,
    name: 'Government Incentive',
    type: 'bonus',
    description: 'Tax rebate and regional startup ecosystem bonus.',
    effectText: '+₹200 Cash & +200 Company Value',
  },
  {
    number: 4,
    name: 'Premium Deal',
    type: 'bonus',
    description: 'Strategic partnership signed on your premier portfolio asset.',
    effectText: 'Cash equal to purchase price of your most expensive business (₹0 if none)',
  },
  {
    number: 5,
    name: 'Founder Bonus',
    type: 'bonus',
    description: 'Synergies across active operational portfolio.',
    effectText: '₹100 × Number of businesses owned',
  },
  {
    number: 6,
    name: 'Lucky Break',
    type: 'bonus',
    description: 'Surprise angel investment round. Enter a separate reward roll (1–6).',
    effectText: 'Reward-only roll: ₹100 × Roll number (token does not move)',
  },
];

export const CRISIS_CARDS: CardDefinition[] = [
  {
    number: 1,
    name: 'Tax Raid',
    type: 'crisis',
    description: 'Statutory compliance audit and retroactive penalty.',
    effectText: '−₹300 Cash',
  },
  {
    number: 2,
    name: 'Market Crash',
    type: 'crisis',
    description: 'Macroeconomic downturn depresses tech valuations.',
    effectText: '−300 Company Value (min 0)',
  },
  {
    number: 3,
    name: 'Legal Trouble',
    type: 'crisis',
    description: 'Trademark litigation and settlement expenses.',
    effectText: '−₹200 Cash & −200 Company Value',
  },
  {
    number: 4,
    name: 'Burn Rate Spike',
    type: 'crisis',
    description: 'Cloud infrastructure and operational overhead surge.',
    effectText: '−₹100 × Number of businesses owned',
  },
  {
    number: 5,
    name: 'Bad PR',
    type: 'crisis',
    description: 'Critical service outage causes reputation damage.',
    effectText: '−200 Company Value & −₹100 Cash',
  },
  {
    number: 6,
    name: 'Investor Pullout',
    type: 'crisis',
    description: 'Lead investor retracts term sheet unexpectedly.',
    effectText: '−₹500 Cash',
  },
];

export const DEFAULT_WILDCARD_CHALLENGES: string[] = [
  "Pitch Challenge: Deliver a 20-second elevator pitch to the Game Master.",
  "Founder Trivia: Answer the Game Master's summit startup trivia question.",
  "Ecosystem Deal: Get an endorsement sign-off from a roaming summit organizer.",
  "Physical Agility: Token bearer must complete a 10-meter sprint and return.",
  "Speed Strategy: Name 3 competitors of your primary business in 10 seconds."
];
