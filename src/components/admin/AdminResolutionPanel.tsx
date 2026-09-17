import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOARD_SPACES } from '../../constants/board';
import { BONUS_CARDS, CRISIS_CARDS } from '../../constants/cards';
import { formatCurrency, formatNumber, MARIO_CHARACTERS } from '../../constants/theme';
import { calculateRentAndOwnerCv, getUpgradeCost, getUpgradeCvReward } from '../../engine/gameEngine';
import { 
  Building2, 
  ArrowUpCircle, 
  Receipt, 
  Sparkles, 
  AlertTriangle, 
  Mic2, 
  UserMinus, 
  Users, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export const AdminResolutionPanel: React.FC = () => {
  const { 
    state, 
    buyCurrentBusiness, 
    passCurrentBusiness, 
    upgradeOwnedBusiness, 
    payCurrentRent, 
    sellBusinessForDebt, 
    applyBonusCard, 
    applyCrisisCard, 
    applyPitchAction, 
    applyLoseFeature, 
    applyStealTalent, 
    applyWildcardAction 
  } = useGame();

  const [luckyRoll, setLuckyRoll] = useState<number>(6);
  const [stealTarget, setStealTarget] = useState<number>(0);
  const [wildcardNotes, setWildcardNotes] = useState<string>('');

  const pendingLanding = state.pendingLanding;
  const pendingSale = state.pendingSale;

  // 1. Forced Sale Emergency Handler
  if (pendingSale) {
    const team = state.teams[pendingSale.teamIndex];
    const myBusinesses = state.businesses.filter(b => b.owner === pendingSale.teamIndex);
    const char = MARIO_CHARACTERS[team.number] || MARIO_CHARACTERS[1];

    return (
      <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#E52521] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
        <div className="flex items-center gap-2 text-[#E52521]">
          <span className="text-2xl">🔥</span>
          <h3 className="font-pixel text-xs uppercase tracking-wider">
            BOWSER DEBT HAZARD · FORCED SALE
          </h3>
        </div>

        <div className="p-3.5 rounded-xl bg-[#101014] border-2 border-[#E52521]/40 space-y-1 text-xs font-arcade">
          <p className="font-bold text-[#FDF6E2]">
            {team.name} ({char.characterName}) has <span className="text-[#FBD000]">{formatCurrency(team.cash)}</span> and owes <span className="text-[#E52521]">{formatCurrency(pendingSale.requiredAmount)}</span>.
          </p>
          <p className="text-[#A89F91]">
            Coins applied: {formatCurrency(pendingSale.cashApplied)} · Remaining debt: <strong className="text-[#E52521]">{formatCurrency(pendingSale.remainingDue)}</strong>
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-pixel text-[9px] uppercase tracking-wider text-[#FBD000] block">
            SELECT PIPE TO LIQUIDATE (ORIGINAL COST):
          </label>
          {myBusinesses.map(biz => (
            <button
              key={biz.id}
              onClick={() => sellBusinessForDebt(biz.id)}
              className="w-full p-3 rounded-xl bg-[#262022] hover:bg-[#E52521]/20 border-2 border-[#E52521] flex items-center justify-between text-xs transition cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <div className="text-left">
                <strong className="font-pixel text-[10px] text-[#FDF6E2] block">{biz.name}</strong>
                <span className="font-arcade text-xs text-[#A89F91]">Level {biz.level} (Earned CV points preserved)</span>
              </div>
              <div className="text-right">
                <span className="font-pixel text-xs text-[#43B047]">+{formatCurrency(biz.cost)}</span>
                <span className="font-pixel text-[8px] uppercase text-[#E52521] block">SELL PIPE</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // If no pending landing, return null (NO permanent empty placeholder box!)
  if (!pendingLanding) {
    return null;
  }

  const landingTeam = state.teams[pendingLanding.teamIndex];
  const space = BOARD_SPACES[pendingLanding.spaceIndex];
  const roll = pendingLanding.roll;
  const landingChar = MARIO_CHARACTERS[landingTeam.number] || MARIO_CHARACTERS[1];

  // 2. Business Space Resolution
  if (space.type === 'business' && space.businessId !== undefined) {
    const business = state.businesses[space.businessId];
    const isUnowned = business.owner === null;
    const isOwnBusiness = business.owner === pendingLanding.teamIndex;
    const isOpponentBusiness = !isUnowned && !isOwnBusiness;

    // Case A: Unowned Business
    if (isUnowned) {
      const canAfford = landingTeam.cash >= business.cost;
      const portfolioFull = landingTeam.businesses.length >= state.settings.maxBusinesses;

      return (
        <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#FBD000] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-[#FBD000] flex items-center gap-1.5">
              <span>🏗️</span> UNOWNED WARP PIPE LANDED
            </span>
            <span className="font-pixel text-[8px] text-[#A89F91]">
              SPACE {space.index + 1}
            </span>
          </div>

          <div>
            <h3 className="font-pixel text-base text-[#FDF6E2]">
              {business.name}
            </h3>
            <p className="font-arcade text-xs text-[#A89F91] mt-0.5">
              Sector: {business.category}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#101014] border border-[#3D3234] text-xs">
            <div>
              <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">ACQUIRE COST</span>
              <span className="font-pixel text-xs text-[#FBD000]">{formatCurrency(business.cost)}</span>
            </div>
            <div>
              <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">STAR VALUE</span>
              <span className="font-pixel text-xs text-[#5C94FC]">+{business.baseCv} CV</span>
            </div>
          </div>

          {portfolioFull && (
            <div className="p-2.5 rounded-xl bg-[#E52521]/20 border border-[#E52521] font-pixel text-[9px] text-[#E52521] text-center">
              ⚠️ Portfolio limit reached (Max 3 Pipes). Must pass.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              disabled={!canAfford || portfolioFull}
              onClick={() => buyCurrentBusiness(business.id)}
              className="py-3.5 px-4 rounded-xl mario-btn-green font-pixel text-[10px] uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              ACQUIRE ({formatCurrency(business.cost)})
            </button>
            <button
              onClick={passCurrentBusiness}
              className="py-3.5 px-4 rounded-xl mario-btn-dark font-pixel text-[10px] uppercase tracking-wider cursor-pointer"
            >
              PASS
            </button>
          </div>
        </div>
      );
    }

    // Case B: Own Business -> Upgrade Option
    if (isOwnBusiness) {
      const isMaxed = business.level >= 2;
      const upgradeCost = getUpgradeCost(business);
      const cvGain = getUpgradeCvReward(business.level as 0 | 1);
      const canAfford = landingTeam.cash >= upgradeCost;

      return (
        <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#5C94FC] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-[#5C94FC] flex items-center gap-1.5">
              <span>★</span> OWN PIPE POWER-UP UPGRADE
            </span>
            <span className="font-pixel text-[8px] uppercase px-2 py-1 rounded-md bg-[#5C94FC]/20 text-[#5C94FC] border border-[#5C94FC]">
              ★ LEVEL {business.level}
            </span>
          </div>

          <div>
            <h3 className="font-pixel text-base text-[#FDF6E2]">
              {business.name}
            </h3>
            <p className="font-arcade text-xs text-[#A89F91] mt-0.5">
              Owned by {landingTeam.name} ({landingChar.characterName})
            </p>
          </div>

          {!isMaxed ? (
            <>
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#101014] border border-[#3D3234] text-xs">
                <div>
                  <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">UPGRADE COST</span>
                  <span className="font-pixel text-xs text-[#FBD000]">{formatCurrency(upgradeCost)}</span>
                </div>
                <div>
                  <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">STAR REWARD</span>
                  <span className="font-pixel text-xs text-[#5C94FC]">+{cvGain} CV</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  disabled={!canAfford}
                  onClick={() => upgradeOwnedBusiness(business.id)}
                  className="py-3.5 px-4 rounded-xl mario-btn-blue font-pixel text-[10px] uppercase tracking-wider disabled:opacity-30 cursor-pointer"
                >
                  POWER-UP TO ★{business.level + 2}
                </button>
                <button
                  onClick={passCurrentBusiness}
                  className="py-3.5 px-4 rounded-xl mario-btn-dark font-pixel text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  SKIP
                </button>
              </div>
            </>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#43B047]/20 border-2 border-[#43B047] font-pixel text-[9px] text-[#43B047] text-center">
              ✨ MAX FIRE POWER (LEVEL 2) ACTIVE! Maximum toll rate engaged.
              <button
                onClick={passCurrentBusiness}
                className="mt-3 w-full py-3 rounded-xl mario-btn-dark font-pixel text-[9px] cursor-pointer"
              >
                CONTINUE →
              </button>
            </div>
          )}
        </div>
      );
    }

    // Case C: Opponent Business -> Rent Settlement
    if (isOpponentBusiness) {
      const ownerTeam = state.teams[business.owner!];
      const ownerChar = MARIO_CHARACTERS[ownerTeam?.number || 1] || MARIO_CHARACTERS[1];
      const { rent, ownerCvGain } = calculateRentAndOwnerCv(business);

      return (
        <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#E52521] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] uppercase tracking-wider text-[#E52521] flex items-center gap-1.5">
              <span>🪙</span> TOLL SETTLEMENT DUE
            </span>
            <span className="font-pixel text-[8px] uppercase px-2 py-1 rounded-md bg-[#E52521]/20 text-[#E52521] border border-[#E52521]">
              LEVEL {business.level}
            </span>
          </div>

          <div>
            <h3 className="font-pixel text-base text-[#FDF6E2]">
              {business.name}
            </h3>
            <p className="font-arcade text-xs text-[#A89F91] mt-0.5">
              Owned by <strong className="text-[#FDF6E2]">{ownerTeam?.name} ({ownerChar.characterName})</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#101014] border border-[#3D3234] text-xs">
            <div>
              <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">TOLL DUE</span>
              <span className="font-pixel text-xs text-[#E52521]">{formatCurrency(rent)}</span>
            </div>
            <div>
              <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">OWNER STAR YIELD</span>
              <span className="font-pixel text-xs text-[#5C94FC]">+{ownerCvGain} CV</span>
            </div>
          </div>

          <button
            onClick={() => payCurrentRent(business.id)}
            className="w-full py-4 rounded-xl mario-btn-red font-pixel text-xs uppercase tracking-wider cursor-pointer"
          >
            PROCESS TOLL ({formatCurrency(rent)}) →
          </button>
        </div>
      );
    }
  }

  // 3. Bonus Card Space
  if (space.type === 'bonus') {
    const card = BONUS_CARDS[roll - 1] || BONUS_CARDS[0];

    return (
      <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#43B047] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-[#43B047] flex items-center gap-1.5">
            <span>🍄</span> LUCKY BONUS CARD #{card.number}
          </span>
          <span className="font-pixel text-[8px] text-[#A89F91]">
            ROLL {roll}
          </span>
        </div>

        <div>
          <h3 className="font-pixel text-sm text-[#FDF6E2]">
            {card.name}
          </h3>
          <p className="font-arcade text-xs text-[#A89F91] mt-1">
            {card.description}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#101014] border-2 border-[#43B047] font-arcade text-xs text-[#43B047] font-bold">
          {card.effectText}
        </div>

        {card.number === 6 && (
          <div className="p-3 rounded-xl bg-[#101014] border border-[#3D3234] space-y-2">
            <label className="font-pixel text-[8px] text-[#FBD000] block">
              LUCKY BREAK REWARD ROLL:
            </label>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map(r => (
                <button
                  key={r}
                  onClick={() => setLuckyRoll(r)}
                  className={`py-2 rounded-lg font-pixel text-xs border-2 transition ${
                    luckyRoll === r
                      ? 'bg-[#43B047] text-white border-[#43B047]'
                      : 'bg-[#262022] text-[#A89F91] border-transparent'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => applyBonusCard(card.number, card.number === 6 ? luckyRoll : undefined)}
          className="w-full py-4 rounded-xl mario-btn-green font-pixel text-xs uppercase tracking-wider cursor-pointer"
        >
          APPLY {card.name.toUpperCase()} →
        </button>
      </div>
    );
  }

  // 4. Crisis Card Space
  if (space.type === 'crisis') {
    const card = CRISIS_CARDS[roll - 1] || CRISIS_CARDS[0];

    return (
      <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#E52521] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-[#E52521] flex items-center gap-1.5">
            <span>💣</span> BOWSER CRISIS CARD #{card.number}
          </span>
          <span className="font-pixel text-[8px] text-[#A89F91]">
            ROLL {roll}
          </span>
        </div>

        <div>
          <h3 className="font-pixel text-sm text-[#FDF6E2]">
            {card.name}
          </h3>
          <p className="font-arcade text-xs text-[#A89F91] mt-1">
            {card.description}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#101014] border-2 border-[#E52521] font-arcade text-xs text-[#E52521] font-bold">
          {card.effectText}
        </div>

        <button
          onClick={() => applyCrisisCard(card.number)}
          className="w-full py-4 rounded-xl mario-btn-red font-pixel text-xs uppercase tracking-wider cursor-pointer"
        >
          APPLY {card.name.toUpperCase()} PENALTY →
        </button>
      </div>
    );
  }

  // 5. Action B: Pitch to Investors
  if (space.type === 'action_b') {
    const hasVentures = landingTeam.businesses.length > 0;

    return (
      <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#FBD000] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-[#FBD000] flex items-center gap-1.5">
          <span>🎤</span> ACTION B: KOOPA STADIUM PITCH
        </span>

        <p className="font-arcade text-xs text-[#A89F91]">
          {hasVentures 
            ? `${landingTeam.name} (${landingChar.characterName}) delivers pitch to the Game Master referee.` 
            : `${landingTeam.name} owns 0 pipes. Auto-passed.`
          }
        </p>

        {hasVentures ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => applyPitchAction(true)}
              className="py-3.5 rounded-xl mario-btn-green font-pixel text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> PASSED ✓
            </button>
            <button
              onClick={() => applyPitchAction(false)}
              className="py-3.5 rounded-xl mario-btn-red font-pixel text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> FAILED (SKIP)
            </button>
          </div>
        ) : (
          <button
            onClick={() => applyPitchAction(true)}
            className="w-full py-3.5 rounded-xl mario-btn-dark font-pixel text-xs cursor-pointer"
          >
            CONFIRM AUTO-PASS →
          </button>
        )}
      </div>
    );
  }

  // 6. Action C: Lose the Feature (-200 CV)
  if (space.type === 'action_c') {
    return (
      <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#E52521] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-[#E52521] flex items-center gap-1.5">
          <span>🐢</span> ACTION C: SPINY SHELL HIT
        </span>

        <p className="font-arcade text-xs text-[#A89F91]">
          Product bug setback: <strong className="text-[#E52521]">−200 Star Power (CV)</strong> (floored at 0).
        </p>

        <button
          onClick={applyLoseFeature}
          className="w-full py-4 rounded-xl mario-btn-red font-pixel text-xs uppercase tracking-wider cursor-pointer"
        >
          APPLY −200 CV PENALTY →
        </button>
      </div>
    );
  }

  // 7. Action D: Steal Talent
  if (space.type === 'action_d') {
    const opponentTeams = state.teams.filter(t => t.number !== landingTeam.number && !t.isBankrupt);

    return (
      <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#5C94FC] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-[#5C94FC] flex items-center gap-1.5">
          <span>👻</span> ACTION D: BOO TALENT HEIST
        </span>

        <p className="font-arcade text-xs text-[#A89F91]">
          Poach up to ₹100 coins from an opponent player:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {opponentTeams.map(t => {
            const oppChar = MARIO_CHARACTERS[t.number] || MARIO_CHARACTERS[1];
            return (
              <button
                key={t.id}
                onClick={() => setStealTarget(t.number - 1)}
                className={`p-2.5 rounded-xl border-2 font-pixel text-[9px] transition flex items-center justify-between cursor-pointer ${
                  stealTarget === t.number - 1
                    ? 'bg-[#5C94FC] text-black border-[#5C94FC] shadow-[2px_2px_0px_#000]'
                    : 'bg-[#101014] text-[#FDF6E2] border-[#3D3234]'
                }`}
              >
                <span>{oppChar.icon} {oppChar.characterName}</span>
                <span className="font-arcade text-xs">{formatCurrency(t.cash)}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => applyStealTalent(stealTarget)}
          className="w-full py-4 rounded-xl mario-btn-blue font-pixel text-xs uppercase tracking-wider cursor-pointer"
        >
          TRANSFER COINS FROM {state.teams[stealTarget]?.name.toUpperCase()} →
        </button>
      </div>
    );
  }

  // 8. Wildcard Challenge
  if (space.type === 'wildcard') {
    const defaultChallenge = state.settings.wildcardChallenges[0] || "Physical & social summit challenge.";

    return (
      <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#FBD000] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-[#FBD000] flex items-center gap-1.5">
          <span>❓</span> MYSTERY WILDCARD CHALLENGE
        </span>

        <div className="p-3.5 rounded-xl bg-[#101014] border-2 border-[#FBD000] font-arcade text-xs font-bold text-[#FBD000]">
          "{defaultChallenge}"
        </div>

        <input
          type="text"
          placeholder="Optional notes…"
          value={wildcardNotes}
          onChange={(e) => setWildcardNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#101014] border border-[#3D3234] font-arcade text-xs text-[#FDF6E2]"
        />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => applyWildcardAction(true, wildcardNotes)}
            className="py-3.5 rounded-xl mario-btn-green font-pixel text-[10px] uppercase tracking-wider cursor-pointer"
          >
            COMPLETED ✓
          </button>
          <button
            onClick={() => applyWildcardAction(false, wildcardNotes)}
            className="py-3.5 rounded-xl mario-btn-dark font-pixel text-[10px] uppercase tracking-wider cursor-pointer"
          >
            FAILED / PASS
          </button>
        </div>
      </div>
    );
  }

  // 9. START space
  return (
    <div className="p-6 rounded-3xl bg-[#1B1718] border-3 border-[#43B047] shadow-[6px_6px_0px_#000] space-y-4 animate-in fade-in">
      <span className="font-pixel text-[9px] uppercase tracking-wider text-[#43B047] flex items-center gap-1.5">
        <span>🏁</span> FLAGPOLE / LAP COMPLETE
      </span>

      <p className="font-arcade text-xs text-[#A89F91]">
        {landingTeam.name} ({landingChar.characterName}) collected <strong className="text-[#FBD000]">+₹200 Coins</strong> and portfolio growth rewards.
      </p>

      <button
        onClick={passCurrentBusiness}
        className="w-full py-4 rounded-xl mario-btn-green font-pixel text-xs uppercase tracking-wider cursor-pointer"
      >
        CONFIRM & FINISH TURN →
      </button>
    </div>
  );
};

