import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency } from '../../constants/theme';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface PlayerForcedSaleModalProps {
  team: Team;
}

export const PlayerForcedSaleModal: React.FC<PlayerForcedSaleModalProps> = ({ team }) => {
  const { state } = useGame();
  const pendingSale = state.pendingSale;

  if (!pendingSale || pendingSale.teamIndex !== team.number - 1) return null;

  const myBusinesses = state.businesses.filter(b => b.owner === team.number - 1);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#19191C] border-2 border-[#FF5C7A] p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 flex items-center justify-center text-[#FF5C7A]">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#FF5C7A] bg-[#FF5C7A]/10 px-3 py-1 rounded-full border border-[#FF5C7A]/30 font-bold">
            DEBT SETTLEMENT REQUIRED
          </span>
          <h2 className="text-base font-bold text-white tracking-tight mt-2">
            Emergency Venture Liquidation
          </h2>
          <p className="text-xs text-white/60 mt-1">
            {pendingSale.reason}
          </p>
        </div>

        {/* Debt Breakdown */}
        <div className="p-3.5 rounded-xl bg-[#141416] border border-white/5 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">Total Amount Due</span>
            <span className="font-bold text-white font-mono">{formatCurrency(pendingSale.requiredAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Cash Applied</span>
            <span className="font-bold text-[#33FF67] font-mono">−{formatCurrency(pendingSale.cashApplied)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-white/5">
            <span className="text-[#FF5C7A] font-semibold">Remaining Debt</span>
            <span className="font-bold text-[#FF5C7A] font-mono">{formatCurrency(pendingSale.remainingDue)}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#202024] border border-white/5 text-left">
          <p className="text-xs text-white/70 leading-relaxed">
            The Game Master is currently processing the liquidation of one of your active enterprises at original valuation to satisfy debt.
          </p>
        </div>

        <div className="space-y-2 text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block px-1">
            VENTURES ELIGIBLE FOR LIQUIDATION ({myBusinesses.length})
          </span>
          {myBusinesses.map(biz => (
            <div key={biz.id} className="p-2.5 rounded-xl bg-[#141416] border border-white/5 flex items-center justify-between text-xs">
              <div>
                <strong className="text-white font-semibold block">{biz.name}</strong>
                <span className="text-[11px] text-white/50">Level {biz.level}</span>
              </div>
              <span className="font-mono font-bold text-[#33FF67]">
                +{formatCurrency(biz.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
