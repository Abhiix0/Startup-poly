import { 
  getInitialState, 
  processRoll, 
  buyBusiness, 
  upgradeBusiness, 
  payRent, 
  sellBusinessForced, 
  executeBankruptcy, 
  resolveBonusCard, 
  resolveCrisisCard, 
  resolveActionPitch, 
  resolveActionLoseFeature, 
  resolveActionStealTalent, 
  resolveWildcard, 
  undoLastTransaction, 
  manualAdjustTeam,
  getRankedTeams,
  calculateRentAndOwnerCv 
} from '../src/engine/gameEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✓ ${msg}`);
  }
}

console.log('=== STARTING STARTUPOLY GAME ENGINE TEST SUITE ===');

// 1. Initial State
let state = getInitialState('EQX-4821', 6);
assert(state.teams.length === 6, '6 teams initialized');
assert(state.teams[0].cash === 1000, 'Starting cash is ₹1,000');
assert(state.teams[0].cv === 0, 'Starting CV is 0');
assert(state.businesses.length === 10, '10 businesses available');

// 2. Start Match
state.status = 'live';
state.timerRunning = true;
assert(state.status === 'live', 'Match is live');

// 3. Roll and Buy SaaS (Space index 4)
state = processRoll(state, 4); // Team 01 rolls 4
assert(state.teams[0].position === 4, 'Team 01 moved to space 4 (SaaS)');
assert(state.pendingLanding !== null, 'Pending landing created');

// Team 01 buys SaaS (id: 1, cost: 300, baseCv: 180)
state = buyBusiness(state, 1);
assert(state.teams[0].cash === 700, 'Team 01 cash deducted by ₹300 (now ₹700)');
assert(state.teams[0].cv === 180, 'Team 01 CV increased by +180');
assert(state.businesses[1].owner === 0, 'SaaS owned by Team 01');
assert(state.pendingLanding === null, 'Landing finalized');
assert(state.activeTeamIndex === 1, 'Turn passed to Team 02');

// 4. Team 02 rolls 4 -> Lands on SaaS (owned by Team 01) -> Rent Payment
state = processRoll(state, 4); // Team 02 rolls 4 to space 4
assert(state.pendingLanding !== null, 'Pending landing on SaaS');

// Level 0 (Base) rent on SaaS: 50% of 300 = ₹150, Owner CV: 50% of 180 = +90 CV
const { rent: r0, ownerCvGain: c0 } = calculateRentAndOwnerCv(state.businesses[1]);
assert(r0 === 150, 'Base rent is ₹150');
assert(c0 === 90, 'Base owner CV yield is 90');

state = payRent(state, 1); // Team 02 pays rent
assert(state.teams[1].cash === 850, 'Team 02 cash deducted to ₹850');
assert(state.teams[0].cash === 850, 'Team 01 received ₹150 (now ₹850)');
assert(state.teams[0].cv === 270, 'Team 01 CV increased by 90 (now 270)');
assert(state.activeTeamIndex === 2, 'Turn passed to Team 03');

// 5. Team 03 rolls 6 -> Lands on Crisis -> Extra Roll
state = processRoll(state, 6);
assert(state.teams[2].position === 6, 'Team 03 on space 6');
assert(state.turnRolls === 1, 'First roll of turn');

// Resolve Crisis Card 1 (Tax Raid: -₹300)
state = resolveCrisisCard(state, 1);
assert(state.teams[2].cash === 700, 'Team 03 cash deducted by ₹300');
assert(state.activeTeamIndex === 2, 'Extra roll granted! Active team is still Team 03');

// 6. Test Three Consecutive 6s Rollback
let rollSnapState = getInitialState('EQX-4821', 6);
rollSnapState.status = 'live';
const t0InitialCash = rollSnapState.teams[0].cash;
const t0InitialPos = rollSnapState.teams[0].position;

// Roll 1: 6
rollSnapState = processRoll(rollSnapState, 6);
rollSnapState = resolveBonusCard(rollSnapState, 1); // +₹300
assert(rollSnapState.activeTeamIndex === 0, 'Extra roll 2 granted');

// Roll 2: 6
rollSnapState = processRoll(rollSnapState, 6);
rollSnapState = resolveBonusCard(rollSnapState, 1); // +₹300
assert(rollSnapState.activeTeamIndex === 0, 'Extra roll 3 granted');

// Roll 3: 6 -> TRIGGER THREE CONSECUTIVE SIXES ROLLBACK
rollSnapState = processRoll(rollSnapState, 6);
assert(rollSnapState.teams[0].cash === t0InitialCash, 'Team 01 cash restored to pre-turn snapshot (₹1,000)');
assert(rollSnapState.teams[0].position === t0InitialPos, 'Team 01 position restored to 0');
assert(rollSnapState.activeTeamIndex === 1, 'Turn cancelled and passed to next team');
console.log('✓ 3x consecutive 6s rollback verified');

// 7. START Crossing & Portfolio Growth
let startState = getInitialState('EQX-4821', 6);
startState.status = 'live';
startState.teams[0].position = 22;
startState.teams[0].businesses = [0, 1, 2]; // 3 businesses owned
startState = processRoll(startState, 4); // 22 + 4 = 26 % 24 = Space 2 (Crossed START)
assert(startState.teams[0].cash === 1200, 'Collected ₹200 cash on passing START');
assert(startState.teams[0].cv === 500, 'Collected +500 CV Portfolio Growth for 3 businesses');

// 8. Forced Sale & Bankruptcy
let saleState = getInitialState('EQX-4821', 6);
saleState.status = 'live';
saleState.teams[0].cash = 100;
saleState.teams[0].businesses = [0]; // owns EdTech (cost: 200)
saleState.businesses[0].owner = 0;
saleState.pendingLanding = {
  teamIndex: 0,
  spaceIndex: 5,
  roll: 1,
  passedStart: false,
  startCashReward: 0,
  startCvReward: 0,
  resolved: false,
};
// Tax Raid: -₹300. Cash is 100. Shortfall is 200.
saleState = resolveCrisisCard(saleState, 1);
assert(saleState.pendingSale !== null, 'Forced sale triggered');
assert(saleState.teams[0].cash === 0, 'All cash consumed');
assert(saleState.pendingSale?.remainingDue === 200, 'Remaining debt is ₹200');

// Liquidate EdTech (cost 200)
saleState = sellBusinessForced(saleState, 0);
assert(saleState.teams[0].cash === 0, 'Cleared debt with business sale');
assert(saleState.teams[0].businesses.length === 0, 'Business sold');
assert(saleState.businesses[0].owner === null, 'Business returned to bank');
assert(saleState.pendingSale === null, 'Pending sale cleared');

// 9. Bankruptcy Elimination
let bankruptState = getInitialState('EQX-4821', 6);
bankruptState.status = 'live';
bankruptState.teams[0].cash = 50;
bankruptState.teams[0].businesses = []; // zero businesses to sell
bankruptState.pendingLanding = {
  teamIndex: 0,
  spaceIndex: 5,
  roll: 1,
  passedStart: false,
  startCashReward: 0,
  startCvReward: 0,
  resolved: false,
};
// Tax Raid: -₹300. Cash is 50. Zero businesses left -> immediate bankruptcy
bankruptState = resolveCrisisCard(bankruptState, 1);
assert(bankruptState.teams[0].isBankrupt === true, 'Team marked bankrupt');
assert(bankruptState.teams[0].cash === 0, 'Bankrupt team cash is 0');
assert(bankruptState.activeTeamIndex === 1, 'Turn automatically passed to next team');

// 10. Undo Last Transaction
let undoState = getInitialState('EQX-4821', 6);
undoState.status = 'live';
undoState = manualAdjustTeam(undoState, 0, 500, 200, 'Bonus award');
assert(undoState.teams[0].cash === 1500, 'Team 01 cash is 1500');
undoState = undoLastTransaction(undoState);
assert(undoState.teams[0].cash === 1000, 'Team 01 cash restored to 1000 after Undo');

// 11. Tie-Breaker Ranking
let rankState = getInitialState('EQX-4821', 6);
rankState.teams[0].cv = 1500;
rankState.teams[0].cash = 800;
rankState.teams[1].cv = 1800; // Winner on CV
rankState.teams[1].cash = 400;
rankState.teams[2].cv = 1500;
rankState.teams[2].cash = 1200; // 2nd place (Tie on CV with Team 1, but higher cash)

const ranked = getRankedTeams(rankState.teams);
assert(ranked[0].number === 2, 'Team 02 ranked #1 (Highest CV 1800)');
assert(ranked[1].number === 3, 'Team 03 ranked #2 (Higher Cash 1200)');
assert(ranked[2].number === 1, 'Team 01 ranked #3');

console.log('🎉 ALL 11 TEST SUITES PASSED FLAWLESSLY!');
