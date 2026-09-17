import { 
  MatchState, 
  Team, 
  Business, 
  PendingLanding, 
  PendingSale, 
  GameTransaction,
  TurnSnapshot,
  MatchSettings 
} from '../types/game';
import { BOARD_SPACES } from '../constants/board';
import { INITIAL_BUSINESSES } from '../constants/businesses';
import { INITIAL_TEAMS, formatCurrency } from '../constants/theme';
import { DEFAULT_WILDCARD_CHALLENGES } from '../constants/cards';

export function getInitialState(matchCode: string = 'EQX-4821', teamCount: number = 6): MatchState {
  const initialTeams = INITIAL_TEAMS.slice(0, teamCount).map(t => ({
    ...t,
    cash: 1000,
    cv: 0,
    position: 0,
    businesses: [],
    isBankrupt: false,
    skipNextTurn: false,
  }));

  const initialSettings: MatchSettings = {
    matchCode,
    teamCount,
    matchDurationSeconds: 3000, // 50 minutes
    initialCash: 1000,
    maxBusinesses: 3,
    wildcardChallenges: [...DEFAULT_WILDCARD_CHALLENGES],
    rulesLocked: true,
  };

  return {
    matchId: 'match_' + Date.now(),
    matchCode,
    status: 'waiting',
    teams: initialTeams,
    businesses: JSON.parse(JSON.stringify(INITIAL_BUSINESSES)),
    activeTeamIndex: 0,
    selectedTeamIndex: 0,
    secondsRemaining: 3000,
    timerRunning: false,
    lastTimerTick: null,
    turnRolls: 0,
    turnStartSnapshot: null,
    pendingLanding: null,
    pendingSale: null,
    transactions: [
      {
        id: 'tx_init',
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'system',
        teamIndex: 0,
        teamName: initialTeams[0]?.name || 'Team 01',
        actionType: 'start',
        description: `Room ${matchCode} created with ${teamCount} teams. Waiting for Game Master to start.`,
      }
    ],
    settings: initialSettings,
    archivedMatches: [],
  };
}

// Helper to format timestamp
export function getNowTimeFormatted(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Deep clone helper for snapshot integrity
export function cloneStateData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Calculate Rent and Owner CV gain based on level
export function calculateRentAndOwnerCv(business: Business): { rent: number; ownerCvGain: number } {
  let rentMultiplier = 0.5; // Base
  if (business.level === 1) rentMultiplier = 0.75;
  if (business.level === 2) rentMultiplier = 1.0;

  const rent = Math.round(business.cost * rentMultiplier);
  const ownerCvGain = Math.round(business.baseCv * rentMultiplier);
  return { rent, ownerCvGain };
}

// Calculate upgrade cost based on purchase cost
export function getUpgradeCost(business: Business): number {
  if (business.level === 0) return business.u1Cost;
  if (business.level === 1) return business.u2Cost;
  return 0;
}

// Calculate upgrade CV reward
export function getUpgradeCvReward(level: 0 | 1): number {
  return level === 0 ? 300 : 400; // BASE -> U1 = +300 CV, U1 -> U2 = +400 CV
}

// Find next active non-bankrupt team
export function getNextActiveTeamIndex(teams: Team[], currentIndex: number): number {
  const activeCount = teams.length;
  for (let i = 1; i <= activeCount; i++) {
    const nextIdx = (currentIndex + i) % activeCount;
    if (!teams[nextIdx].isBankrupt) {
      return nextIdx;
    }
  }
  return currentIndex;
}

// Execute physical roll
export function processRoll(state: MatchState, rollValue: number): MatchState {
  if (state.status !== 'live' || state.pendingLanding || state.pendingSale) {
    return state;
  }

  const newState = cloneStateData(state);
  const currentTeam = newState.teams[newState.activeTeamIndex];

  // If team has skipNextTurn flag set (e.g. from failed pitch)
  if (currentTeam.skipNextTurn) {
    currentTeam.skipNextTurn = false;
    const nextIndex = getNextActiveTeamIndex(newState.teams, newState.activeTeamIndex);
    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'system',
      teamIndex: newState.activeTeamIndex,
      teamName: currentTeam.name,
      actionType: 'action_b',
      description: `${currentTeam.name} skipped turn due to previous penalty. Turn passes to ${newState.teams[nextIndex].name}.`,
    };
    newState.transactions.push(tx);
    newState.activeTeamIndex = nextIndex;
    newState.turnRolls = 0;
    newState.turnStartSnapshot = null;
    return newState;
  }

  // If this is the first roll of the turn, capture turn start snapshot for rollback
  if (newState.turnRolls === 0 || !newState.turnStartSnapshot) {
    newState.turnStartSnapshot = {
      teams: cloneStateData(newState.teams),
      businesses: cloneStateData(newState.businesses),
      activeTeamIndex: newState.activeTeamIndex,
      turnRolls: 0,
    };
  }

  newState.turnRolls += 1;

  // Check 3 consecutive 6s
  if (rollValue === 6 && newState.turnRolls === 3) {
    // Three 6s! Rollback to pre-turn snapshot
    if (newState.turnStartSnapshot) {
      newState.teams = cloneStateData(newState.turnStartSnapshot.teams);
      newState.businesses = cloneStateData(newState.turnStartSnapshot.businesses);
    }
    const nextIndex = getNextActiveTeamIndex(newState.teams, newState.activeTeamIndex);
    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'admin',
      teamIndex: newState.activeTeamIndex,
      teamName: currentTeam.name,
      actionType: 'turn_cancel',
      description: `🚨 THREE CONSECUTIVE SIXES! ${currentTeam.name}'s turn is cancelled and restored to pre-turn state. Turn passes to ${newState.teams[nextIndex].name}.`,
    };
    newState.transactions.push(tx);
    newState.activeTeamIndex = nextIndex;
    newState.turnRolls = 0;
    newState.turnStartSnapshot = null;
    newState.pendingLanding = null;
    return newState;
  }

  const prevPos = currentTeam.position;
  const newPos = (prevPos + rollValue) % 24;
  const passedStart = (prevPos + rollValue) >= 24;

  let startCashReward = 0;
  let startCvReward = 0;

  if (passedStart) {
    startCashReward = 200;
    const bizCount = currentTeam.businesses.length;
    if (bizCount === 2) startCvReward = 200;
    else if (bizCount >= 3) startCvReward = 500;
  }

  currentTeam.position = newPos;

  // Set pending landing
  newState.pendingLanding = {
    teamIndex: newState.activeTeamIndex,
    spaceIndex: newPos,
    roll: rollValue,
    passedStart,
    startCashReward,
    startCvReward,
    resolved: false,
  };

  const space = BOARD_SPACES[newPos];
  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: newState.activeTeamIndex,
    teamName: currentTeam.name,
    actionType: 'roll',
    description: `${currentTeam.name} rolled ${rollValue} and moved to Space ${newPos + 1} (${space.name}).${passedStart ? ` Passed START (+₹${startCashReward} Cash, +${startCvReward} CV).` : ''}`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  // Apply START reward immediately if crossed
  if (passedStart) {
    currentTeam.cash += startCashReward;
    currentTeam.cv += startCvReward;
    currentTeam.lastEvent = {
      text: `Lap Complete: +${formatCurrency(startCashReward)} Cash, +${startCvReward} CV`,
      type: 'gain',
      timestamp: getNowTimeFormatted(),
      amountCash: startCashReward,
      amountCv: startCvReward,
    };
  }

  return newState;
}

// Resolve unowned business purchase
export function buyBusiness(state: MatchState, businessId: number): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingLanding.teamIndex];
  const business = newState.businesses[businessId];

  if (business.owner !== null || team.businesses.length >= state.settings.maxBusinesses || team.cash < business.cost) {
    return state;
  }

  team.cash -= business.cost;
  team.cv += business.baseCv;
  team.businesses.push(businessId);
  business.owner = state.pendingLanding.teamIndex;

  team.lastEvent = {
    text: `Acquired ${business.name} (−${formatCurrency(business.cost)}, +${business.baseCv} CV)`,
    type: 'event',
    timestamp: getNowTimeFormatted(),
    amountCash: -business.cost,
    amountCv: business.baseCv,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: team.name,
    actionType: 'purchase',
    cashDelta: -business.cost,
    cvDelta: business.baseCv,
    description: `${team.name} purchased ${business.name} for ${formatCurrency(business.cost)} (+${business.baseCv} Initial CV).`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Upgrade owned business
export function upgradeBusiness(state: MatchState, businessId: number): MatchState {
  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingLanding ? state.pendingLanding.teamIndex : state.activeTeamIndex];
  const business = newState.businesses[businessId];

  if (business.owner !== team.number - 1 && business.owner !== (state.pendingLanding ? state.pendingLanding.teamIndex : state.activeTeamIndex)) {
    return state;
  }
  if (business.level >= 2) return state;

  const cost = getUpgradeCost(business);
  if (team.cash < cost) return state;

  const newLevel = (business.level + 1) as 1 | 2;
  const cvReward = getUpgradeCvReward(business.level as 0 | 1);

  team.cash -= cost;
  team.cv += cvReward;
  business.level = newLevel;

  team.lastEvent = {
    text: `Upgraded ${business.name} to Level ${newLevel} (−${formatCurrency(cost)}, +${cvReward} CV)`,
    type: 'gain',
    timestamp: getNowTimeFormatted(),
    amountCash: -cost,
    amountCv: cvReward,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: team.number - 1,
    teamName: team.name,
    actionType: 'upgrade',
    cashDelta: -cost,
    cvDelta: cvReward,
    description: `${team.name} upgraded ${business.name} to Level ${newLevel} for ${formatCurrency(cost)} (+${cvReward} CV).`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  if (newState.pendingLanding) {
    return finalizeLanding(newState);
  }
  return newState;
}

// Process rent payment when landing on opponent business
export function payRent(state: MatchState, businessId: number): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const payer = newState.teams[state.pendingLanding.teamIndex];
  const business = newState.businesses[businessId];
  if (business.owner === null || business.owner === state.pendingLanding.teamIndex) {
    return state;
  }

  const owner = newState.teams[business.owner];
  const { rent, ownerCvGain } = calculateRentAndOwnerCv(business);

  // Check if payer cash is sufficient
  if (payer.cash < rent) {
    const cashApplied = payer.cash;
    payer.cash = 0;
    const remainingDue = rent - cashApplied;

    newState.pendingSale = {
      teamIndex: state.pendingLanding.teamIndex,
      requiredAmount: rent,
      cashApplied,
      remainingDue,
      creditorTeamIndex: business.owner,
      businessId,
      reason: `Rent on ${business.name} (${formatCurrency(rent)}) exceeds available cash.`,
    };

    payer.lastEvent = {
      text: `Forced Sale Alert: Owes ${formatCurrency(remainingDue)} rent on ${business.name}`,
      type: 'loss',
      timestamp: getNowTimeFormatted(),
      amountCash: -cashApplied,
    };

    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'system',
      teamIndex: state.pendingLanding.teamIndex,
      teamName: payer.name,
      actionType: 'forced_sale',
      description: `⚠️ ${payer.name} paid ${formatCurrency(cashApplied)} cash and owes ${formatCurrency(remainingDue)} rent to ${owner.name}. Forced sale triggered.`,
      snapshotBefore: {
        teams: cloneStateData(state.teams),
        businesses: cloneStateData(state.businesses),
        activeTeamIndex: state.activeTeamIndex,
        pendingLanding: cloneStateData(state.pendingLanding),
        pendingSale: cloneStateData(state.pendingSale),
      },
    };
    newState.transactions.push(tx);

    // If payer has zero businesses to sell, trigger immediate bankruptcy
    if (payer.businesses.length === 0) {
      return executeBankruptcy(newState, payer.number - 1);
    }

    return newState;
  }

  // Normal rent payment
  payer.cash -= rent;
  owner.cash += rent;
  owner.cv += ownerCvGain;

  payer.lastEvent = {
    text: `Paid Rent on ${business.name} (−${formatCurrency(rent)})`,
    type: 'loss',
    timestamp: getNowTimeFormatted(),
    amountCash: -rent,
  };

  owner.lastEvent = {
    text: `Rent Received on ${business.name} (+${formatCurrency(rent)}, +${ownerCvGain} CV)`,
    type: 'gain',
    timestamp: getNowTimeFormatted(),
    amountCash: rent,
    amountCv: ownerCvGain,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: payer.name,
    actionType: 'rent',
    cashDelta: -rent,
    description: `${payer.name} paid ${formatCurrency(rent)} rent on ${business.name} (Level ${business.level}) to ${owner.name} (+${ownerCvGain} Owner CV).`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Forced sale liquidation of an owned business
export function sellBusinessForced(state: MatchState, businessId: number): MatchState {
  if (!state.pendingSale) return state;

  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingSale.teamIndex];
  const business = newState.businesses[businessId];

  if (business.owner !== state.pendingSale.teamIndex) return state;

  // Liquidate at original purchase price (upgrades lost, CV earned stays)
  const resalePrice = business.cost;
  business.owner = null;
  business.level = 0;
  team.businesses = team.businesses.filter(id => id !== businessId);
  team.cash += resalePrice;

  const creditorIndex = state.pendingSale.creditorTeamIndex;
  const remainingDue = state.pendingSale.remainingDue;

  if (team.cash >= remainingDue) {
    // Can now pay remaining debt!
    team.cash -= remainingDue;
    if (creditorIndex !== null && creditorIndex !== undefined) {
      newState.teams[creditorIndex].cash += state.pendingSale.requiredAmount;
      const { ownerCvGain } = calculateRentAndOwnerCv(newState.businesses[state.pendingSale.businessId || 0]);
      newState.teams[creditorIndex].cv += ownerCvGain;
    }

    team.lastEvent = {
      text: `Sold ${business.name} for ${formatCurrency(resalePrice)} to clear debt.`,
      type: 'neutral',
      timestamp: getNowTimeFormatted(),
    };

    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'admin',
      teamIndex: state.pendingSale.teamIndex,
      teamName: team.name,
      actionType: 'forced_sale',
      description: `${team.name} sold ${business.name} for ${formatCurrency(resalePrice)}, cleared ${formatCurrency(remainingDue)} debt. Upgrades lost, earned CV retained.`,
      snapshotBefore: {
        teams: cloneStateData(state.teams),
        businesses: cloneStateData(state.businesses),
        activeTeamIndex: state.activeTeamIndex,
        pendingLanding: cloneStateData(state.pendingLanding),
        pendingSale: cloneStateData(state.pendingSale),
      },
    };
    newState.transactions.push(tx);
    newState.pendingSale = null;

    return finalizeLanding(newState);
  } else {
    // Still not enough cash
    const newRemainingDue = remainingDue - team.cash;
    team.cash = 0;
    if (newState.pendingSale) {
      newState.pendingSale.remainingDue = newRemainingDue;
    }

    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'admin',
      teamIndex: state.pendingSale.teamIndex,
      teamName: team.name,
      actionType: 'forced_sale',
      description: `${team.name} sold ${business.name} for ${formatCurrency(resalePrice)}. Still owes ${formatCurrency(newRemainingDue)}.`,
    };
    newState.transactions.push(tx);

    // If no businesses left, bankruptcy!
    if (team.businesses.length === 0) {
      return executeBankruptcy(newState, team.number - 1);
    }
    return newState;
  }
}

// Mark team bankrupt & eliminated
export function executeBankruptcy(state: MatchState, teamIndex: number): MatchState {
  const newState = cloneStateData(state);
  const team = newState.teams[teamIndex];

  team.isBankrupt = true;
  team.cash = 0;
  team.lastEvent = {
    text: 'BANKRUPT: Your startup has run out of runway.',
    type: 'loss',
    timestamp: getNowTimeFormatted(),
  };

  // Reclaim all businesses to bank
  team.businesses.forEach(bId => {
    newState.businesses[bId].owner = null;
    newState.businesses[bId].level = 0;
  });
  team.businesses = [];

  newState.pendingSale = null;
  newState.pendingLanding = null;

  const nextIndex = getNextActiveTeamIndex(newState.teams, teamIndex);

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'system',
    teamIndex,
    teamName: team.name,
    actionType: 'bankruptcy',
    description: `💀 ${team.name} declared BANKRUPTCY and is ELIMINATED. All businesses returned to Bank. Turn passes to ${newState.teams[nextIndex].name}.`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  newState.activeTeamIndex = nextIndex;
  newState.turnRolls = 0;
  newState.turnStartSnapshot = null;

  return newState;
}

// Resolve Bonus Card
export function resolveBonusCard(state: MatchState, cardRoll: number, luckyRewardRoll?: number): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingLanding.teamIndex];
  let cashGain = 0;
  let cvGain = 0;
  let cardName = 'Bonus Card';
  let desc = '';

  switch (cardRoll) {
    case 1:
      cardName = 'Startup Grant';
      cashGain = 300;
      desc = '+₹300 Cash';
      break;
    case 2:
      cardName = 'Viral Growth';
      cvGain = 300;
      desc = '+300 Company Value';
      break;
    case 3:
      cardName = 'Government Incentive';
      cashGain = 200;
      cvGain = 200;
      desc = '+₹200 Cash & +200 Company Value';
      break;
    case 4: {
      cardName = 'Premium Deal';
      const mostExpensive = team.businesses.reduce((max, bId) => {
        return Math.max(max, newState.businesses[bId].cost);
      }, 0);
      cashGain = mostExpensive;
      desc = `Cash equal to most expensive business (+₹${mostExpensive})`;
      break;
    }
    case 5:
      cardName = 'Founder Bonus';
      cashGain = 100 * team.businesses.length;
      desc = `₹100 × ${team.businesses.length} businesses (+₹${cashGain})`;
      break;
    case 6: {
      cardName = 'Lucky Break';
      const r = luckyRewardRoll || 6;
      cashGain = 100 * r;
      desc = `Lucky Break Reward Roll ${r} (+₹${cashGain} Cash)`;
      break;
    }
  }

  team.cash += cashGain;
  team.cv += cvGain;

  team.lastEvent = {
    text: `Bonus: ${cardName} (${desc})`,
    type: 'gain',
    timestamp: getNowTimeFormatted(),
    amountCash: cashGain || undefined,
    amountCv: cvGain || undefined,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: team.name,
    actionType: 'bonus_card',
    cashDelta: cashGain,
    cvDelta: cvGain,
    description: `${team.name} drew Bonus Card #${cardRoll} (${cardName}): ${desc}.`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Resolve Crisis Card
export function resolveCrisisCard(state: MatchState, cardRoll: number): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingLanding.teamIndex];
  let cashPenalty = 0;
  let cvPenalty = 0;
  let cardName = 'Crisis Card';

  switch (cardRoll) {
    case 1:
      cardName = 'Tax Raid';
      cashPenalty = 300;
      break;
    case 2:
      cardName = 'Market Crash';
      cvPenalty = 300;
      break;
    case 3:
      cardName = 'Legal Trouble';
      cashPenalty = 200;
      cvPenalty = 200;
      break;
    case 4:
      cardName = 'Burn Rate Spike';
      cashPenalty = 100 * team.businesses.length;
      break;
    case 5:
      cardName = 'Bad PR';
      cvPenalty = 200;
      cashPenalty = 100;
      break;
    case 6:
      cardName = 'Investor Pullout';
      cashPenalty = 500;
      break;
  }

  // Deduct CV (floored at 0)
  team.cv = Math.max(0, team.cv - cvPenalty);

  // If cash penalty exceeds cash, trigger forced sale
  if (team.cash < cashPenalty) {
    const cashApplied = team.cash;
    team.cash = 0;
    const remainingDue = cashPenalty - cashApplied;

    newState.pendingSale = {
      teamIndex: state.pendingLanding.teamIndex,
      requiredAmount: cashPenalty,
      cashApplied,
      remainingDue,
      creditorTeamIndex: null, // to bank
      reason: `${cardName} penalty (−${formatCurrency(cashPenalty)}) exceeds cash balance.`,
    };

    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'system',
      teamIndex: state.pendingLanding.teamIndex,
      teamName: team.name,
      actionType: 'forced_sale',
      description: `⚠️ ${team.name} drew Crisis #${cardRoll} (${cardName}), paid ${formatCurrency(cashApplied)} cash, owes ${formatCurrency(remainingDue)}. Forced sale required.`,
      snapshotBefore: {
        teams: cloneStateData(state.teams),
        businesses: cloneStateData(state.businesses),
        activeTeamIndex: state.activeTeamIndex,
        pendingLanding: cloneStateData(state.pendingLanding),
        pendingSale: cloneStateData(state.pendingSale),
      },
    };
    newState.transactions.push(tx);

    if (team.businesses.length === 0) {
      return executeBankruptcy(newState, team.number - 1);
    }
    return newState;
  }

  // Normal cash deduction
  team.cash -= cashPenalty;

  team.lastEvent = {
    text: `Crisis: ${cardName} (−${formatCurrency(cashPenalty)}, −${cvPenalty} CV)`,
    type: 'loss',
    timestamp: getNowTimeFormatted(),
    amountCash: -cashPenalty || undefined,
    amountCv: -cvPenalty || undefined,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: team.name,
    actionType: 'crisis_card',
    cashDelta: -cashPenalty,
    cvDelta: -cvPenalty,
    description: `${team.name} drew Crisis Card #${cardRoll} (${cardName}): −${formatCurrency(cashPenalty)} Cash, −${cvPenalty} CV.`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Resolve Action B: Pitch to Investors
export function resolveActionPitch(state: MatchState, passed: boolean): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingLanding.teamIndex];

  if (team.businesses.length === 0) {
    // Automatic skip without penalty
    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'system',
      teamIndex: state.pendingLanding.teamIndex,
      teamName: team.name,
      actionType: 'action_b',
      description: `${team.name} landed on Pitch to Investors with 0 businesses. Auto-passed without penalty.`,
    };
    newState.transactions.push(tx);
    return finalizeLanding(newState);
  }

  if (!passed) {
    team.skipNextTurn = true;
    team.lastEvent = {
      text: 'Investor Pitch Failed: Skip next turn',
      type: 'loss',
      timestamp: getNowTimeFormatted(),
    };
  } else {
    team.lastEvent = {
      text: 'Investor Pitch Passed!',
      type: 'gain',
      timestamp: getNowTimeFormatted(),
    };
  }

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: team.name,
    actionType: 'action_b',
    description: `${team.name} pitch to investors was judged ${passed ? 'PASSED ✓' : 'FAILED ✗ (lose next turn)'}.`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Resolve Action C: Lose the Feature (-200 CV)
export function resolveActionLoseFeature(state: MatchState): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingLanding.teamIndex];
  team.cv = Math.max(0, team.cv - 200);

  team.lastEvent = {
    text: 'Action C: Lose the Feature (−200 CV)',
    type: 'loss',
    timestamp: getNowTimeFormatted(),
    amountCv: -200,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: team.name,
    actionType: 'action_c',
    cvDelta: -200,
    description: `${team.name} lost a feature at Action C: −200 Company Value (floored at 0).`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Resolve Action D: Steal Talent (Transfer up to ₹100 from target)
export function resolveActionStealTalent(state: MatchState, targetTeamIndex: number): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const landingTeam = newState.teams[state.pendingLanding.teamIndex];
  const targetTeam = newState.teams[targetTeamIndex];

  const amountToSteal = Math.min(100, targetTeam.cash);
  targetTeam.cash -= amountToSteal;
  landingTeam.cash += amountToSteal;

  landingTeam.lastEvent = {
    text: `Steal Talent: Poached +${formatCurrency(amountToSteal)} from ${targetTeam.name}`,
    type: 'gain',
    timestamp: getNowTimeFormatted(),
    amountCash: amountToSteal,
  };

  targetTeam.lastEvent = {
    text: `Talent Poached: −${formatCurrency(amountToSteal)} to ${landingTeam.name}`,
    type: 'loss',
    timestamp: getNowTimeFormatted(),
    amountCash: -amountToSteal,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: landingTeam.name,
    actionType: 'action_d',
    cashDelta: amountToSteal,
    description: `${landingTeam.name} poached talent from ${targetTeam.name}: Transferred ${formatCurrency(amountToSteal)}.`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Resolve Wildcard
export function resolveWildcard(state: MatchState, completed: boolean, notes?: string): MatchState {
  if (!state.pendingLanding) return state;

  const newState = cloneStateData(state);
  const team = newState.teams[state.pendingLanding.teamIndex];

  team.lastEvent = {
    text: `Wildcard Challenge: ${completed ? 'Completed ✓' : 'Failed / Resolved'}`,
    type: completed ? 'gain' : 'neutral',
    timestamp: getNowTimeFormatted(),
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex: state.pendingLanding.teamIndex,
    teamName: team.name,
    actionType: 'wildcard',
    description: `${team.name} wildcard challenge was marked ${completed ? 'COMPLETED ✓' : 'FAILED / MANUAL RESOLUTION'}${notes ? ` (${notes})` : ''}.`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return finalizeLanding(newState);
}

// Finalize landing and handle Extra Roll on 6 or pass turn
export function finalizeLanding(state: MatchState): MatchState {
  const newState = cloneStateData(state);
  const pending = newState.pendingLanding;
  if (!pending) return newState;

  newState.pendingLanding = null;

  // Extra roll on 6
  if (pending.roll === 6 && newState.turnRolls < 3) {
    const team = newState.teams[newState.activeTeamIndex];
    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'system',
      teamIndex: newState.activeTeamIndex,
      teamName: team.name,
      actionType: 'roll',
      description: `🎲 ${team.name} rolled a 6! Extra roll granted.`,
    };
    newState.transactions.push(tx);
    return newState;
  }

  // Otherwise cycle to next active team
  return passTurn(newState);
}

// Pass active turn to next non-bankrupt team
export function passTurn(state: MatchState): MatchState {
  const newState = cloneStateData(state);
  const nextIndex = getNextActiveTeamIndex(newState.teams, newState.activeTeamIndex);

  newState.activeTeamIndex = nextIndex;
  newState.turnRolls = 0;
  newState.turnStartSnapshot = null;
  newState.pendingLanding = null;
  newState.pendingSale = null;

  const nextTeam = newState.teams[nextIndex];
  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'system',
    teamIndex: nextIndex,
    teamName: nextTeam.name,
    actionType: 'roll',
    description: `Turn passed to ${nextTeam.name}.`,
  };
  newState.transactions.push(tx);

  return newState;
}

// Manual adjustment override from Admin Team Drawer
export function manualAdjustTeam(
  state: MatchState,
  teamIndex: number,
  cashDelta: number,
  cvDelta: number,
  reason: string
): MatchState {
  const newState = cloneStateData(state);
  const team = newState.teams[teamIndex];

  team.cash = Math.max(0, team.cash + cashDelta);
  team.cv = Math.max(0, team.cv + cvDelta);

  team.lastEvent = {
    text: `Game Master Adjustment: ${reason}`,
    type: cashDelta > 0 || cvDelta > 0 ? 'gain' : 'loss',
    timestamp: getNowTimeFormatted(),
    amountCash: cashDelta || undefined,
    amountCv: cvDelta || undefined,
  };

  const tx: GameTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toISOString(),
    timeFormatted: getNowTimeFormatted(),
    actor: 'admin',
    teamIndex,
    teamName: team.name,
    actionType: 'manual_adjust',
    cashDelta,
    cvDelta,
    description: `🛠️ GM Manual Adjustment on ${team.name}: ${cashDelta >= 0 ? '+' : ''}${formatCurrency(cashDelta)} Cash, ${cvDelta >= 0 ? '+' : ''}${cvDelta} CV (${reason}).`,
    snapshotBefore: {
      teams: cloneStateData(state.teams),
      businesses: cloneStateData(state.businesses),
      activeTeamIndex: state.activeTeamIndex,
      pendingLanding: cloneStateData(state.pendingLanding),
      pendingSale: cloneStateData(state.pendingSale),
    },
  };
  newState.transactions.push(tx);

  return newState;
}

// Undo last action using atomic transaction snapshot
export function undoLastTransaction(state: MatchState): MatchState {
  if (state.transactions.length <= 1) return state;

  const newState = cloneStateData(state);
  // Find last transaction with a snapshot
  for (let i = newState.transactions.length - 1; i >= 0; i--) {
    const tx = newState.transactions[i];
    if (tx.snapshotBefore) {
      newState.teams = cloneStateData(tx.snapshotBefore.teams);
      newState.businesses = cloneStateData(tx.snapshotBefore.businesses);
      newState.activeTeamIndex = tx.snapshotBefore.activeTeamIndex;
      newState.pendingLanding = cloneStateData(tx.snapshotBefore.pendingLanding);
      newState.pendingSale = cloneStateData(tx.snapshotBefore.pendingSale);

      // Remove reverted transactions
      newState.transactions = newState.transactions.slice(0, i);

      const undoTx: GameTransaction = {
        id: 'tx_' + Date.now(),
        timestamp: new Date().toISOString(),
        timeFormatted: getNowTimeFormatted(),
        actor: 'admin',
        teamIndex: newState.activeTeamIndex,
        teamName: newState.teams[newState.activeTeamIndex]?.name || 'Admin',
        actionType: 'undo',
        description: `↩️ Undid action: "${tx.description}". Game state restored.`,
      };
      newState.transactions.push(undoTx);
      return newState;
    }
  }

  return state;
}

// Sort teams according to official Equinox Tie-Breaker rules
export function getRankedTeams(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    // 1. Elimination check (Bankrupt at bottom)
    if (a.isBankrupt && !b.isBankrupt) return 1;
    if (!a.isBankrupt && b.isBankrupt) return -1;

    // 2. Highest Company Value
    if (b.cv !== a.cv) return b.cv - a.cv;

    // 3. Higher Cash
    if (b.cash !== a.cash) return b.cash - a.cash;

    // 4. More Businesses owned
    if (b.businesses.length !== a.businesses.length) {
      return b.businesses.length - a.businesses.length;
    }

    // 5. Team Number
    return a.number - b.number;
  });
}
