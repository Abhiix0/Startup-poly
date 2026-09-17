import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency, formatNumber } from '../../constants/theme';
import { getUpgradeCost, calculateRentAndOwnerCv } from '../../engine/gameEngine';
import { Building2, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface PlayerPortfolioProps {
  team: Team;
}

export const PlayerPortfolio: React.FC<PlayerPortfolioProps> = ({ team }) => {
  const { state } = useGame();
  const myBusinesses = state.businesses.filter(b => b.owner === team.number - 1);

  return (
    <div className="space-y-4 max-w-[420px] mx-auto pb-24 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            VENTURE PORTFOLIO
          </h2>
          <span className="text-xs text-white/50 block mt-0.5">
            {myBusinesses.length} of 3 active enterprises acquired
          </span>
        </div>
        <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-mono font-medium text-white/70">
          MAX 3 CAP
        </div>
      </div>

      {/* Stacked Business Cards */}
      <div className="space-y-3">
        {myBusinesses.length > 0 ? (
          myBusinesses.map(biz => {
            const nextCost = getUpgradeCost(biz);
            const { rent, ownerCvGain } = calculateRentAndOwnerCv(biz);
            const isMaxed = biz.level === 2;

            return (
              <div 
                key={biz.id}
                className="eqx-card-elevated p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#7484FE] block">
                      {biz.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {biz.name}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isMaxed
                      ? 'bg-[#33FF67]/15 border-[#33FF67]/40 text-[#33FF67]'
                      : biz.level === 1
                      ? 'bg-[#7484FE]/15 border-[#7484FE]/40 text-[#7484FE]'
                      : 'bg-white/10 border-white/20 text-white/90'
                  }`}>
                    {isMaxed ? 'MAX TIER' : biz.level === 1 ? 'TIER 2 (SUPER)' : 'BASE TIER'}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#141416] border border-white/5">
                    <span className="text-[10px] text-white/40 block font-medium">RENT TOLL</span>
                    <span className="text-sm font-bold text-[#33FF67] tracking-tight">{formatCurrency(rent)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141416] border border-white/5">
                    <span className="text-[10px] text-white/40 block font-medium">VALUATION YIELD</span>
                    <span className="text-sm font-bold text-[#7484FE] tracking-tight">+{formatNumber(ownerCvGain)} CV</span>
                  </div>
                </div>

                {/* Upgrade details */}
                {!isMaxed ? (
                  <div className="p-2.5 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#7484FE] block font-medium">
                        NEXT: TIER {biz.level + 2} UPGRADE
                      </span>
                      <span className="text-xs font-semibold text-white/90">
                        {formatCurrency(nextCost)} → +{biz.level === 0 ? '300' : '400'} CV
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/10 border border-white/15 px-2 py-1 rounded text-white/80 font-medium">
                      ON TURN
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-[#33FF67]/10 border border-[#33FF67]/30 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#33FF67]">
                    <CheckCircle2 className="w-4 h-4" /> MAXIMUM ENTERPRISE TIER REACHED
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="eqx-card p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                NO ENTERPRISES ACQUIRED YET
              </h3>
              <p className="text-xs text-white/50 max-w-xs mx-auto mt-1 leading-relaxed">
                Move your physical token on the outdoor board. Land on an unowned venture space to purchase and start collecting rent from rivals.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
