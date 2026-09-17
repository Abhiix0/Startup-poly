import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency } from '../../constants/theme';

interface PlayerActivityProps {
  team: Team;
}

export const PlayerActivity: React.FC<PlayerActivityProps> = ({ team }) => {
  const { state } = useGame();

  const myEvents = state.transactions
    .filter(tx => {
      if (tx.teamIndex === team.number - 1) return true;
      if (tx.description.toLowerCase().includes(team.name.toLowerCase())) return true;
      if (tx.actionType === 'start' && tx.actor === 'admin') return true;
      return false;
    })
    .slice()
    .reverse();

  const getProductActionTitle = (type: string) => {
    switch (type) {
      case 'purchase': return '🏭 Pipe Acquired';
      case 'upgrade': return '★ Power-Up Upgraded';
      case 'rent': return '🪙 Toll Settlement';
      case 'start': return '🏁 Flagpole Lap Bonus';
      case 'bonus_card': return '🍄 Bonus Card';
      case 'crisis_card': return '💣 Crisis Hazard';
      case 'action_b': return '🎤 Stadium Pitch';
      case 'action_c': return '🐢 Shell Hit';
      case 'action_d': return '👻 Boo Heist';
      case 'wildcard': return '❓ Mystery Quest';
      case 'forced_sale': return '⚠️ Pipe Liquidation';
      case 'bankruptcy': return '💀 Out of Lives';
      case 'undo': return '⏪ Time Warp';
      default: return '🎮 World Event';
    }
  };

  return (
    <div className="space-y-3.5 max-w-[390px] mx-auto pb-24 select-none">
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h2 className="font-pixel text-sm text-black leading-none drop-shadow-[1px_1px_0px_rgba(255,255,255,0.8)]">
            STAGE LOGS
          </h2>
          <span className="font-arcade text-[10px] text-slate-700 font-bold block mt-0.5">
            {team.name} Quest Feed
          </span>
        </div>
        <div className="px-3 py-1 bg-[#FBD000] border-2 border-black rounded-full font-pixel text-[8px] text-black shadow-[2px_2px_0px_#000]">
          QUEST LOG
        </div>
      </div>

      <div className="space-y-2">
        {myEvents.length > 0 ? (
          myEvents.map(tx => (
            <div 
              key={tx.id}
              className="mario-card-white p-3 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 text-sm shadow-[1px_1px_0px_#000] ${
                  tx.actionType === 'rent'
                    ? 'bg-emerald-100 text-emerald-800'
                    : tx.actionType === 'upgrade'
                    ? 'bg-purple-100 text-purple-800'
                    : tx.actionType === 'purchase'
                    ? 'bg-blue-100 text-blue-800'
                    : tx.actionType === 'crisis_card'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {tx.actionType === 'rent' ? '🪙' : tx.actionType === 'upgrade' ? '⭐' : tx.actionType === 'purchase' ? '🏭' : tx.actionType === 'crisis_card' ? '💣' : '🍄'}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-[8px] uppercase text-black font-bold">
                      {getProductActionTitle(tx.actionType)}
                    </span>
                    <span className="font-arcade text-[10px] text-slate-500 font-bold">
                      {tx.timeFormatted}
                    </span>
                  </div>
                  <p className="font-arcade text-xs leading-snug font-bold text-slate-900">
                    {tx.description}
                  </p>
                </div>
              </div>

              {(tx.cashDelta !== undefined || tx.cvDelta !== undefined) && (
                <div className="text-right flex-shrink-0 font-pixel">
                  {tx.cashDelta !== undefined && (
                    <span className={`block text-[10px] font-bold ${tx.cashDelta >= 0 ? 'text-[#22C55E]' : 'text-[#E52521]'}`}>
                      {tx.cashDelta >= 0 ? '+' : ''}{formatCurrency(tx.cashDelta)}
                    </span>
                  )}
                  {tx.cvDelta !== undefined && (
                    <span className={`block text-[9px] font-bold ${tx.cvDelta >= 0 ? 'text-[#3B82F6]' : 'text-[#E52521]'}`}>
                      {tx.cvDelta >= 0 ? '+' : ''}⭐{tx.cvDelta}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="mario-card-white p-8 text-center">
            <p className="font-arcade text-xs text-slate-500 font-bold">
              No transactions recorded yet in World 1-1.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


