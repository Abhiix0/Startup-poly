import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency } from '../../constants/theme';
import { getUpgradeCost, calculateRentAndOwnerCv } from '../../engine/gameEngine';
import { ArrowUpCircle, CheckCircle2 } from 'lucide-react';

interface PlayerPortfolioProps {
  team: Team;
}

export const PlayerPortfolio: React.FC<PlayerPortfolioProps> = ({ team }) => {
  const { state } = useGame();
  const myBusinesses = state.businesses.filter(b => b.owner === team.number - 1);

  return (
    <div className="space-y-3.5 max-w-[390px] mx-auto pb-24 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h2 className="font-pixel text-sm text-black leading-none drop-shadow-[1px_1px_0px_rgba(255,255,255,0.8)]">
            WARP PIPES
          </h2>
          <span className="font-arcade text-[10px] text-slate-700 font-bold block mt-0.5">
            {myBusinesses.length} OF 3 ENTERPRISES ACQUIRED
          </span>
        </div>
        <div className="px-3 py-1 bg-[#22C55E] border-2 border-black rounded-full font-pixel text-[8px] text-white shadow-[2px_2px_0px_#000]">
          MAX 3
        </div>
      </div>

      {/* Stacked Business Pipe Cards */}
      <div className="space-y-3">
        {myBusinesses.length > 0 ? (
          myBusinesses.map(biz => {
            const nextCost = getUpgradeCost(biz);
            const { rent, ownerCvGain } = calculateRentAndOwnerCv(biz);
            const isMaxed = biz.level === 2;

            return (
              <div 
                key={biz.id}
                className="mario-card-white p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-pixel text-[8px] text-slate-500 uppercase tracking-wider block">
                      🏭 {biz.category}
                    </span>
                    <h3 className="font-pixel text-xs text-black mt-1">
                      {biz.name}
                    </h3>
                  </div>

                  <span className={`font-pixel text-[8px] px-2 py-1 rounded border-2 border-black ${
                    isMaxed
                      ? 'bg-[#22C55E] text-white'
                      : biz.level === 1
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#FBD000] text-black'
                  }`}>
                    {isMaxed ? '★3 MAX' : biz.level === 1 ? '★2 SUPER' : '★1 BASE'}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t-2 border-black/10 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-black/20">
                    <span className="font-pixel text-[7px] text-emerald-800 font-bold block mb-0.5">RENT TOLL</span>
                    <span className="font-pixel text-xs text-[#22C55E] font-black">{formatCurrency(rent)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-black/20">
                    <span className="font-pixel text-[7px] text-blue-800 font-bold block mb-0.5">STAR YIELD</span>
                    <span className="font-pixel text-xs text-[#3B82F6] font-black">+{ownerCvGain} CV</span>
                  </div>
                </div>

                {/* Upgrade details */}
                {!isMaxed ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border-2 border-black/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-pixel text-[7px] text-[#3B82F6] block">NEXT: POWER-UP ★{biz.level + 2}</span>
                      <span className="font-arcade text-xs text-slate-900 font-bold">
                        {formatCurrency(nextCost)} → +{biz.level === 0 ? '300' : '400'} CV
                      </span>
                    </div>
                    <span className="font-pixel text-[8px] bg-[#FBD000] border border-black px-2 py-1 rounded text-black font-bold">
                      ASK GM
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-500 flex items-center justify-center gap-1.5 text-xs font-arcade font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" /> MAX LEVEL REACHED
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="mario-card-white p-8 text-center space-y-2">
            <span className="text-4xl block mb-2 animate-bounce">❓</span>
            <h3 className="font-pixel text-xs text-black">
              NO WARP PIPES YET
            </h3>
            <p className="font-arcade text-xs text-slate-600 font-bold max-w-xs mx-auto">
              Land on an available business space on the physical board to acquire your first startup pipe!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


