import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOARD_SPACES } from '../../constants/board';
import { BONUS_CARDS, CRISIS_CARDS } from '../../constants/cards';
import { INITIAL_BUSINESSES } from '../../constants/businesses';
import { BookOpen, Trophy, Coins, Clock, Users, ArrowLeft, Sparkles, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../constants/theme';

interface PlayerRulesProps {
  onBack?: () => void;
}

export const PlayerRules: React.FC<PlayerRulesProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'cards' | 'actions'>('overview');

  return (
    <div className="space-y-4 max-w-[420px] mx-auto pb-28 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#19191C] border border-white/10 text-white hover:bg-[#202024] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              GAME RULES & MANUAL
            </h1>
            <span className="text-xs text-white/50 block mt-0.5">
              Official STARTUPOLY Tournament Reference
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-[#7484FE]/10 border border-[#7484FE]/30 flex items-center justify-center text-[#7484FE]">
          <BookOpen className="w-4 h-4" />
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="grid grid-cols-4 p-1 rounded-xl bg-[#141416] border border-white/10 text-xs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'businesses', label: 'Ventures' },
          { id: 'cards', label: 'Cards' },
          { id: 'actions', label: 'Actions' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#7484FE] text-white font-semibold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="eqx-card p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#FFBD59]">
              <Trophy className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Tournament Objective
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Achieve the highest total valuation (CV + Cash) at the end of the 50-minute physical simulation by acquiring key businesses, upgrading assets, and collecting rent tolls.
            </p>
          </div>

          <div className="eqx-card p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#33FF67]">
              <Coins className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Starting Resources
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Each team begins with <strong className="text-white">₹1,000 Cash</strong> and <strong className="text-white">0 CV</strong>. Maximum portfolio size is strictly <strong className="text-white">3 businesses</strong> per team.
            </p>
          </div>

          <div className="eqx-card p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#7484FE]">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Match Structure & Turns
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              50-minute continuous countdown. Teams roll a physical die in sequence. Rolling a 6 grants an extra turn (up to 2 consecutive 6s).
            </p>
          </div>

          <div className="eqx-card p-4 space-y-1.5 border-[#FF5C7A]/30">
            <div className="flex items-center gap-2 text-[#FF5C7A]">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                3 Consecutive 6s Hazard
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Rolling three consecutive 6s triggers an immediate penalty: <strong className="text-[#FF5C7A]">−300 CV</strong> and the team’s pawn is returned to the space before their 1st roll.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Businesses & Formulas */}
      {activeTab === 'businesses' && (
        <div className="space-y-3">
          <div className="eqx-card p-4 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Toll & Valuation Formulas
            </h3>
            <div className="space-y-1.5 text-xs text-white/70">
              <div className="flex justify-between p-2 rounded-lg bg-[#141416]">
                <span className="font-semibold text-white">Base Tier:</span>
                <span>Rent = 50% Cost | CV = +50% Cost</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#141416]">
                <span className="font-semibold text-white">Tier 2 (Super):</span>
                <span>Rent = 75% Cost | CV = +60% Cost</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#141416]">
                <span className="font-semibold text-white">Tier 3 (Max):</span>
                <span>Rent = 100% Cost | CV = +75% Cost</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#141416]">
                <span className="font-semibold text-[#33FF67]">START Space Lap:</span>
                <span className="text-[#33FF67]">+₹200 Cash + (100 × Ventures) CV</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider px-1 block">
              10 ENTERPRISE SECTORS
            </span>
            {INITIAL_BUSINESSES.map((biz) => (
              <div key={biz.id} className="eqx-card p-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{biz.name}</h4>
                  <span className="text-[11px] text-[#7484FE]">{biz.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#33FF67] block">{formatCurrency(biz.cost)}</span>
                  <span className="text-[11px] text-white/50">+{biz.baseCv} CV</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Cards */}
      {activeTab === 'cards' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-[#33FF67] font-bold block px-1">
              BONUS CARDS (DIE ROLL 1–6)
            </span>
            {BONUS_CARDS.map(card => (
              <div key={card.number} className="eqx-card p-3 flex items-center justify-between text-xs gap-2">
                <span className="font-semibold text-white">#{card.number} {card.name}</span>
                <span className="text-xs text-[#33FF67] font-medium text-right">{card.effectText}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase tracking-wider text-[#FF5C7A] font-bold block px-1">
              CRISIS CARDS (DIE ROLL 1–6)
            </span>
            {CRISIS_CARDS.map(card => (
              <div key={card.number} className="eqx-card p-3 flex items-center justify-between text-xs gap-2">
                <span className="font-semibold text-white">#{card.number} {card.name}</span>
                <span className="text-xs text-[#FF5C7A] font-medium text-right">{card.effectText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Actions */}
      {activeTab === 'actions' && (
        <div className="space-y-3">
          <div className="eqx-card p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-[#FFBD59] uppercase tracking-wider">
              Action B: Pitch to Investors
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Deliver a 30-second live physical pitch to the Game Master. If approved: <strong className="text-white">+₹200 Cash & +100 CV</strong> per business owned. If failed or 0 businesses: turn passes without reward.
            </p>
          </div>

          <div className="eqx-card p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-[#FF5C7A] uppercase tracking-wider">
              Action C: Lose the Feature
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Technical debt and architecture bug: Immediate penalty of <strong className="text-[#FF5C7A]">−200 CV</strong> (floored at 0).
            </p>
          </div>

          <div className="eqx-card p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-[#7484FE] uppercase tracking-wider">
              Action D: Steal Talent
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Strategic talent poach: Transfer <strong className="text-white">₹100 Cash</strong> directly from an opponent team to your wallet (up to opponent's available cash).
            </p>
          </div>

          <div className="eqx-card p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-[#B987FF] uppercase tracking-wider">
              Wildcard Space
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Outdoor physical or social challenge announced live by the Game Master referee. Successful completion yields custom points or capital.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
