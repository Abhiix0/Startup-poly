import React from 'react';
import { PixelLevelPips } from '../../../ui/pixel';
import { AdminRoomSnapshot } from '../../../data/rpc';

export interface TeamCardProps {
  team: AdminRoomSnapshot['teams'][0];
  isSelected: boolean;
  onClick: () => void;
  flash?: 'up' | 'down' | null;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isSelected,
  onClick,
  flash,
}) => {
  const flashBg =
    flash === 'up'
      ? 'bg-status-success-bg'
      : flash === 'down'
      ? 'bg-status-danger-bg'
      : '';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select team ${team.slot}: ${team.name}`}
      className={`
        relative text-left w-full cursor-pointer select-none border-b-2 border-brand-navy/30 last:border-b-0
        grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1.3fr_auto] items-center gap-x-4 gap-y-1
        pl-3 pr-3 py-2.5 border-l-8
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold focus-visible:ring-inset
        ${flashBg}
        ${isSelected ? 'bg-brand-gold/30' : 'bg-brand-cream hover:bg-brand-white'}
      `}
      style={{ borderLeftColor: team.color }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="font-pixel text-[10px] text-white px-1.5 py-0.5 border border-brand-navy flex-shrink-0"
          style={{ backgroundColor: team.color }}
        >
          #{team.slot}
        </span>
        <span className="font-pixel text-xs text-brand-navy truncate font-bold">{team.name}</span>
        {flash === 'up' && <span className="font-pixel text-[9px] text-brand-green">▲</span>}
        {flash === 'down' && <span className="font-pixel text-[9px] text-brand-red">▼</span>}
      </div>

      <div className="md:order-last flex items-center gap-1.5 justify-end">
        {team.is_bankrupt ? (
          <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-1.5 py-0.5 border border-brand-navy">
            ☠ ELIMINATED
          </span>
        ) : (
          <span
            title={team.claimed ? 'Team phone connected' : 'Waiting for phone connection'}
            className="font-pixel text-[9px] text-brand-navy flex items-center gap-1"
          >
            <span className={`w-2.5 h-2.5 rounded-full border border-brand-navy ${team.claimed ? 'bg-brand-green' : 'bg-neutral-400'}`} />
            {team.claimed ? 'CLAIMED' : 'UNCLAIMED'}
          </span>
        )}
        <span className="font-pixel text-[9px] text-brand-navy">{isSelected ? '● SELECTED' : ''}</span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-pixel text-[9px] text-neutral-500 uppercase">Cash</span>
        <span className="font-tabular text-lg font-black text-brand-green tabular-nums">
          ₹{team.cash.toLocaleString('en-IN')}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-pixel text-[9px] text-neutral-500 uppercase">CV</span>
        <span className="font-tabular text-lg font-black text-brand-navy tabular-nums">
          ₹{team.cv.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="col-span-2 md:col-span-1 flex items-center gap-1.5 flex-wrap">
        <span className="font-pixel text-[9px] text-brand-navy font-bold">BIZ {team.businesses.length}/3</span>
        {team.businesses.map((biz) => (
          <span
            key={biz.business_key}
            title={`${biz.name} (Level ${biz.level})`}
            className="flex items-center bg-brand-white px-1 py-0.5 border border-brand-navy"
          >
            <span className="font-mono text-[9px] font-bold text-brand-navy mr-1">
              {biz.name.slice(0, 3).toUpperCase()}
            </span>
            <PixelLevelPips level={biz.level as 0 | 1 | 2} size="sm" />
          </span>
        ))}
      </div>
    </button>
  );
};
