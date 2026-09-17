export type MatchStatus = 'setup' | 'waiting' | 'live' | 'paused' | 'finished';

export interface Team {
  id: string;
  number: number;
  name: string;
  color: string;
  pin: string;
  cash: number;
  cv: number; // Company Value
  position: number; // 0..23
  businesses: number[]; // business IDs (max 3)
  isBankrupt: boolean;
  skipNextTurn: boolean;
  membersJoined: number;
  lastEvent?: {
    text: string;
    type: 'gain' | 'loss' | 'neutral' | 'event';
    timestamp: string;
    amountCash?: number;
    amountCv?: number;
  };
}

export interface BusinessEconomics {
  cost: number;
  baseCv: number;
  u1Cost: number;
  u2Cost: number;
}

export interface Business {
  id: number;
  key: string;
  name: string;
  category: string;
  cost: number;
  baseCv: number;
  owner: number | null; // team index (0..5) or null
  level: 0 | 1 | 2; // 0 = BASE, 1 = U1, 2 = U2
  u1Cost: number;
  u2Cost: number;
}

export type SpaceType = 
  | 'start' 
  | 'business' 
  | 'bonus' 
  | 'crisis' 
  | 'wildcard' 
  | 'action_b' // Pitch to Investors
  | 'action_c' // Lose the Feature
  | 'action_d'; // Steal Talent

export interface BoardSpace {
  index: number;
  name: string;
  type: SpaceType;
  businessId?: number;
  description: string;
}

export interface CardDefinition {
  number: number;
  name: string;
  type: 'bonus' | 'crisis';
  description: string;
  effectText: string;
}

export interface PendingLanding {
  teamIndex: number;
  spaceIndex: number;
  roll: number;
  passedStart: boolean;
  startCashReward: number;
  startCvReward: number;
  resolved: boolean;
  luckyBreakRewardRoll?: number;
}

export interface PendingSale {
  teamIndex: number;
  requiredAmount: number;
  cashApplied: number;
  remainingDue: number;
  creditorTeamIndex?: number | null; // who is owed the rent, or null if owed to bank
  businessId?: number;
  reason: string;
}

export interface TurnSnapshot {
  teams: Team[];
  businesses: Business[];
  activeTeamIndex: number;
  turnRolls: number;
}

export interface GameTransaction {
  id: string;
  timestamp: string;
  timeFormatted: string;
  actor: 'admin' | 'system';
  teamIndex: number;
  teamName: string;
  actionType: 
    | 'roll' 
    | 'purchase' 
    | 'upgrade' 
    | 'rent' 
    | 'start' 
    | 'bonus_card' 
    | 'crisis_card' 
    | 'action_b' 
    | 'action_c' 
    | 'action_d' 
    | 'wildcard' 
    | 'forced_sale' 
    | 'bankruptcy' 
    | 'manual_adjust' 
    | 'undo' 
    | 'turn_cancel';
  cashDelta?: number;
  cvDelta?: number;
  description: string;
  snapshotBefore?: {
    teams: Team[];
    businesses: Business[];
    activeTeamIndex: number;
    pendingLanding: PendingLanding | null;
    pendingSale: PendingSale | null;
  };
}

export interface MatchSettings {
  matchCode: string;
  teamCount: number; // 5 or 6
  matchDurationSeconds: number; // default 3000 (50 min)
  initialCash: number; // 1000
  maxBusinesses: number; // 3
  wildcardChallenges: string[];
  rulesLocked: boolean;
}

export interface RollAnimationEvent {
  id: string;
  teamIndex: number;
  roll: number;
  fromSpace: number;
  toSpace: number;
  passedStart: boolean;
  timestamp: number;
}

export interface MatchState {
  matchId: string;
  matchCode: string;
  status: MatchStatus;
  teams: Team[];
  businesses: Business[];
  activeTeamIndex: number;
  selectedTeamIndex: number; // For admin detail view
  secondsRemaining: number;
  timerRunning: boolean;
  lastTimerTick: number | null;
  turnRolls: number; // consecutive rolls in current turn
  turnStartSnapshot: TurnSnapshot | null;
  pendingLanding: PendingLanding | null;
  pendingSale: PendingSale | null;
  latestRollAnimation?: RollAnimationEvent | null;
  transactions: GameTransaction[];
  settings: MatchSettings;
  archivedMatches?: {
    id: string;
    code: string;
    endedAt: string;
    winner: Team;
    rankings: Team[];
  }[];
}

