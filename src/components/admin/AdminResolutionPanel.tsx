import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOARD_SPACES } from '../../constants/board';
import { BONUS_CARDS, CRISIS_CARDS } from '../../constants/cards';
import { formatCurrency, formatNumber, TEAM_METAS } from '../../constants/theme';
import { calculateRentAndOwnerCv, getUpgradeCost, getUpgradeCvReward } from '../../engine/gameEngine';
import { 
  Building2, 
  ArrowUpRight, 
  Coins, 
  Sparkles, 
  AlertTriangle, 
  Mic2, 
  UserMinus, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Flag
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
    const meta = TEAM_METAS[team.number] || TEAM_METAS[1];

    return (
      <div className="p-6 rounded-3xl bg-[#19191C] border-2 border-[#FF5C7A] shadow-2xl space-y-4 animate-in fade-in">
        <div className="flex items-center gap-2.5 text-[#FF5C7A]">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-xs uppercase tracking-wider font-bold">
            DEBT SETTLEMENT · EMERGENCY VENTURE LIQUIDATION
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-[#141416] border border-white/5 space-y-1 text-xs">
          <p className="font-semibold text-white">
            {team.name} has <span className="text-[#33FF67] font-mono">{formatCurrency(team.cash)}</span> and owes <span className="text-[#FF5C7A] font-mono">{formatCurrency(pendingSale.requiredAmount)}</span>.
          </p>
          <p className="text-white/60">
            Cash applied: {formatCurrency(pendingSale.cashApplied)} · Remaining debt: <strong className="text-[#FF5C7A] font-mono">{formatCurrency(pendingSale.remainingDue)}</strong>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
            SELECT VENTURE TO LIQUIDATE (ORIGINAL VALUE):
          </label>
          {myBusinesses.map(biz => (
            <button
              key={biz.id}
              onClick={() => sellBusinessForDebt(biz.id)}
              className="w-full p-3.5 rounded-xl bg-[#202024] hover:bg-[#28282E] border border-white/10 flex items-center justify-between text-xs transition cursor-pointer"
            >
              <div className="text-left">
                <strong className="text-white font-bold block">{biz.name}</strong>
                <span className="text-white/50 text-[11px]">Level {biz.level} · CV points preserved</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#33FF67]">+{formatCurrency(biz.cost)}</span>
                <span className="text-[10px] uppercase font-bold text-[#FF5C7A] block">LIQUIDATE</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // If no pending landing, return null
  if (!pendingLanding) {
    return null;
  }

  const landingTeam = state.teams[pendingLanding.teamIndex];
  const space = BOARD_SPACES[pendingLanding.spaceIndex];
  const roll = pendingLanding.roll;
  const landingMeta = TEAM_METAS[landingTeam.number] || TEAM_METAS[1];

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
        <div className="p-6 rounded-3xl eqx-card-elevated border-[#7484FE]/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#7484FE] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>UNOWNED VENTURE OPPORTUNITY</span>
            </span>
            <span className="text-[11px] font-mono text-white/50">
              SPACE #{space.index + 1}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {business.name}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Sector: {business.category} · Landed by {landingTeam.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-[#141416] border border-white/5 text-xs">
            <div>
              <span className="text-[10px] uppercase text-white/40 block mb-0.5">ACQUISITION COST</span>
              <span className="text-sm font-bold text-white font-mono">{formatCurrency(business.cost)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-white/40 block mb-0.5">VALUATION REWARD</span>
              <span className="text-sm font-bold text-[#7484FE] font-mono">+{business.baseCv} CV</span>
            </div>
          </div>

          {portfolioFull && (
            <div className="p-2.5 rounded-xl bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 text-xs text-[#FF5C7A] text-center font-medium">
              Portfolio limit reached (Max 3 Enterprises). Must pass.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              disabled={!canAfford || portfolioFull}
              onClick={() => buyCurrentBusiness(business.id)}
              className="btn-eqx-primary py-3.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              ACQUIRE ({formatCurrency(business.cost)})
            </button>
            <button
              onClick={passCurrentBusiness}
              className="btn-eqx-secondary py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              PASS (NO PURCHASE)
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
        <div className="p-6 rounded-3xl eqx-card-elevated border-[#33FF67]/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#33FF67] flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" />
              <span>OWNED VENTURE · UPGRADE AVAILABLE</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#33FF67]/15 text-[#33FF67] border border-[#33FF67]/30">
              CURRENT TIER {business.level + 1}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {business.name}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Owned by {landingTeam.name}
            </p>
          </div>

          {!isMaxed ? (
            <>
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-[#141416] border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-white/40 block mb-0.5">UPGRADE COST</span>
                  <span className="text-sm font-bold text-white font-mono">{formatCurrency(upgradeCost)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-white/40 block mb-0.5">VALUATION GAIN</span>
                  <span className="text-sm font-bold text-[#7484FE] font-mono">+{cvGain} CV</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  disabled={!canAfford}
                  onClick={() => upgradeOwnedBusiness(business.id)}
                  className="btn-eqx-green py-3.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-30 cursor-pointer"
                >
                  UPGRADE TO TIER {business.level + 2}
                </button>
                <button
                  onClick={passCurrentBusiness}
                  className="btn-eqx-secondary py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  SKIP UPGRADE
                </button>
              </div>
            </>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#33FF67]/10 border border-[#33FF67]/30 text-xs text-[#33FF67] text-center font-medium">
              Maximum Tier 3 reached! Full rent toll capacity enabled.
              <button
                onClick={passCurrentBusiness}
                className="mt-3 w-full btn-eqx-secondary py-2.5 text-xs cursor-pointer"
              >
                CONTINUE MATCH →
              </button>
            </div>
          )}
        </div>
      );
    }

    // Case C: Opponent Business -> Rent Settlement
    if (isOpponentBusiness) {
      const ownerTeam = state.teams[business.owner!];
      const { rent, ownerCvGain } = calculateRentAndOwnerCv(business);

      return (
        <div className="p-6 rounded-3xl eqx-card-elevated border-[#FF5C7A]/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#FF5C7A] flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              <span>RENT TOLL SETTLEMENT DUE</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#FF5C7A]/15 text-[#FF5C7A] border border-[#FF5C7A]/30">
              TIER {business.level + 1}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {business.name}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Owned by <strong className="text-white">{ownerTeam?.name}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-[#141416] border border-white/5 text-xs">
            <div>
              <span className="text-[10px] uppercase text-white/40 block mb-0.5">TOLL AMOUNT</span>
              <span className="text-sm font-bold text-[#FF5C7A] font-mono">{formatCurrency(rent)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-white/40 block mb-0.5">OWNER CV REWARD</span>
              <span className="text-sm font-bold text-[#7484FE] font-mono">+{ownerCvGain} CV</span>
            </div>
          </div>

          <button
            onClick={() => payCurrentRent(business.id)}
            className="w-full btn-eqx-danger py-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            PROCESS TOLL PAYMENT ({formatCurrency(rent)}) →
          </button>
        </div>
      );
    }
  }

  // 3. Bonus Card Space
  if (space.type === 'bonus') {
    const card = BONUS_CARDS[roll - 1] || BONUS_CARDS[0];

    return (
      <div className="p-6 rounded-3xl eqx-card-elevated border-[#33FF67]/40 space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-[#33FF67] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>BONUS ADVANTAGE CARD #{card.number}</span>
          </span>
          <span className="text-[11px] font-mono text-white/50">
            ROLL {roll}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-white">
            {card.name}
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {card.description}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141416] border border-[#33FF67]/30 text-xs font-semibold text-[#33FF67]">
          {card.effectText}
        </div>

        {card.number === 6 && (
          <div className="p-3.5 rounded-xl bg-[#141416] border border-white/5 space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/50 block">
              BONUS REWARD MULTIPLIER ROLL:
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map(r => (
                <button
                  key={r}
                  onClick={() => setLuckyRoll(r)}
                  className={`py-2 rounded-lg font-mono text-xs font-bold border transition ${
                    luckyRoll === r
                      ? 'bg-[#33FF67] text-black border-[#33FF67]'
                      : 'bg-[#202024] text-white/70 border-white/10'
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
          className="w-full btn-eqx-green py-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          APPLY {card.name.toUpperCase()} REWARD →
        </button>
      </div>
    );
  }

  // 4. Crisis Card Space
  if (space.type === 'crisis') {
    const card = CRISIS_CARDS[roll - 1] || CRISIS_CARDS[0];

    return (
      <div className="p-6 rounded-3xl eqx-card-elevated border-[#FF5C7A]/40 space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-[#FF5C7A] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>CRISIS RISK CARD #{card.number}</span>
          </span>
          <span className="text-[11px] font-mono text-white/50">
            ROLL {roll}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-white">
            {card.name}
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {card.description}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141416] border border-[#FF5C7A]/30 text-xs font-semibold text-[#FF5C7A]">
          {card.effectText}
        </div>

        <button
          onClick={() => applyCrisisCard(card.number)}
          className="w-full btn-eqx-danger py-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
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
      <div className="p-6 rounded-3xl eqx-card-elevated border-[#FFBD59]/40 space-y-4 animate-in fade-in">
        <span className="text-xs uppercase font-bold tracking-wider text-[#FFBD59] flex items-center gap-1.5">
          <Mic2 className="w-4 h-4" />
          <span>ACTION B: PITCH TO INVESTORS</span>
        </span>

        <p className="text-xs text-white/70">
          {hasVentures 
            ? `${landingTeam.name} delivers a 30-second live pitch to the Game Master referee.` 
            : `${landingTeam.name} owns 0 ventures. Auto-passed.`
          }
        </p>

        {hasVentures ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => applyPitchAction(true)}
              className="btn-eqx-green py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> PITCH PASSED ✓
            </button>
            <button
              onClick={() => applyPitchAction(false)}
              className="btn-eqx-secondary py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> FAILED (NO REWARD)
            </button>
          </div>
        ) : (
          <button
            onClick={() => applyPitchAction(true)}
            className="w-full btn-eqx-secondary py-3.5 text-xs cursor-pointer"
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
      <div className="p-6 rounded-3xl eqx-card-elevated border-[#FF5C7A]/40 space-y-4 animate-in fade-in">
        <span className="text-xs uppercase font-bold tracking-wider text-[#FF5C7A] flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>ACTION C: PRODUCT BUG PENALTY</span>
        </span>

        <p className="text-xs text-white/70">
          Critical architecture defect setback: <strong className="text-[#FF5C7A]">−200 Company Valuation (CV)</strong> (floored at 0).
        </p>

        <button
          onClick={applyLoseFeature}
          className="w-full btn-eqx-danger py-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
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
      <div className="p-6 rounded-3xl eqx-card-elevated border-[#7484FE]/40 space-y-4 animate-in fade-in">
        <span className="text-xs uppercase font-bold tracking-wider text-[#7484FE] flex items-center gap-1.5">
          <UserMinus className="w-4 h-4" />
          <span>ACTION D: TALENT ACQUISITION</span>
        </span>

        <p className="text-xs text-white/70">
          Poach up to ₹100 cash from an opponent team:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {opponentTeams.map(t => {
            const oppMeta = TEAM_METAS[t.number] || TEAM_METAS[1];
            return (
              <button
                key={t.id}
                onClick={() => setStealTarget(t.number - 1)}
                className={`p-3 rounded-xl border text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                  stealTarget === t.number - 1
                    ? 'bg-[#202024] border-[#7484FE] text-white shadow-md'
                    : 'bg-[#141416] text-white/70 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: oppMeta.color }} />
                  <span>{t.name}</span>
                </div>
                <span className="font-mono text-white/50">{formatCurrency(t.cash)}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => applyStealTalent(stealTarget)}
          className="w-full btn-eqx-primary py-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          TRANSFER ₹100 FROM {state.teams[stealTarget]?.name.toUpperCase()} →
        </button>
      </div>
    );
  }

  // 8. Wildcard Challenge
  if (space.type === 'wildcard') {
    const defaultChallenge = state.settings.wildcardChallenges[0] || "Physical & social summit challenge.";

    return (
      <div className="p-6 rounded-3xl eqx-card-elevated border-[#B987FF]/40 space-y-4 animate-in fade-in">
        <span className="text-xs uppercase font-bold tracking-wider text-[#B987FF] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>WILDCARD ARENA CHALLENGE</span>
        </span>

        <div className="p-3.5 rounded-xl bg-[#141416] border border-[#B987FF]/30 text-xs font-semibold text-white">
          "{defaultChallenge}"
        </div>

        <input
          type="text"
          placeholder="Optional referee notes…"
          value={wildcardNotes}
          onChange={(e) => setWildcardNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#141416] border border-white/10 text-xs text-white"
        />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => applyWildcardAction(true, wildcardNotes)}
            className="btn-eqx-green py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            CHALLENGE COMPLETED ✓
          </button>
          <button
            onClick={() => applyWildcardAction(false, wildcardNotes)}
            className="btn-eqx-secondary py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            FAILED / PASS
          </button>
        </div>
      </div>
    );
  }

  // 9. START space
  return (
    <div className="p-6 rounded-3xl eqx-card-elevated border-[#33FF67]/40 space-y-4 animate-in fade-in">
      <span className="text-xs uppercase font-bold tracking-wider text-[#33FF67] flex items-center gap-1.5">
        <Flag className="w-4 h-4" />
        <span>START SPACE / LAP COMPLETED</span>
      </span>

      <p className="text-xs text-white/70">
        {landingTeam.name} collected <strong className="text-[#33FF67]">+₹200 Cash</strong> and portfolio growth reward.
      </p>

      <button
        onClick={passCurrentBusiness}
        className="w-full btn-eqx-green py-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
      >
        CONFIRM & COMPLETE TURN →
      </button>
    </div>
  );
};
