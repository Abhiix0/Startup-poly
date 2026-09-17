import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency } from '../../constants/theme';

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
      <div className="w-full max-w-sm rounded-3xl bg-[#1B1718] border-3 border-[#E52521] p-5 text-center shadow-[8px_8px_0px_#000] space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="text-4xl animate-bounce">
          🔥
        </div>

        <div>
          <span className="font-pixel text-[8px] uppercase tracking-wider text-[#E52521] bg-[#E52521]/20 px-2.5 py-1 rounded-full border border-[#E52521]">
            BOWSER DEBT HAZARD
          </span>
          <h2 className="font-pixel text-sm text-[#FDF6E2] tracking-wide mt-2">
            PIPE FORCED SALE!
          </h2>
          <p className="font-arcade text-xs text-[#A89F91] mt-1">
            {pendingSale.reason}
          </p>
        </div>

        {/* Debt Breakdown */}
        <div className="p-3.5 rounded-xl bg-[#101014] border-2 border-[#E52521]/40 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="font-pixel text-[8px] text-[#A89F91]">TOTAL DUE</span>
            <span className="font-pixel text-xs text-[#FDF6E2]">{formatCurrency(pendingSale.requiredAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-pixel text-[8px] text-[#A89F91]">COINS APPLIED</span>
            <span className="font-pixel text-xs text-[#43B047]">−{formatCurrency(pendingSale.cashApplied)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-[#3D3234]">
            <span className="font-pixel text-[8px] text-[#E52521]">REMAINING DEBT</span>
            <span className="font-pixel text-xs text-[#E52521]">{formatCurrency(pendingSale.remainingDue)}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#262022] border border-[#3D3234] text-left">
          <p className="font-arcade text-xs text-[#A89F91] leading-relaxed">
            The Game Master is currently processing the liquidation of one of your active pipes at its original cost.
          </p>
        </div>

        <div className="space-y-2 text-left">
          <span className="font-pixel text-[8px] uppercase text-[#A89F91] block px-1">
            PIPES AVAILABLE FOR LIQUIDATION ({myBusinesses.length})
          </span>
          {myBusinesses.map(biz => (
            <div key={biz.id} className="p-2.5 rounded-xl bg-[#101014] border border-[#3D3234] flex items-center justify-between text-xs">
              <div>
                <strong className="font-pixel text-[9px] text-[#FDF6E2] block">{biz.name}</strong>
                <span className="font-arcade text-[10px] text-[#A89F91]">Level {biz.level}</span>
              </div>
              <span className="font-pixel text-xs text-[#43B047]">
                +{formatCurrency(biz.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

