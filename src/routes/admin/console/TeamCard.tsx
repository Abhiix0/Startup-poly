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
        relative text-left w-full cursor-pointer select-none border-b-2 border-brand-navy/20 last:border-b-0
        grid grid-cols-[minmax(0,1.4fr)_auto] md:grid-cols-[minmax(0,1.8fr)_1.2fr_1fr_1fr_1.4fr_auto] items-center gap-x-4 gap-y-1.5
        pl-3.5 pr-3 py-2.5 border-l-8 transition-all duration-100
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold focus-visible:ring-inset
        ${flashBg}
        ${
          isSelected
            ? 'bg-brand-gold/30 ring-2 ring-brand-navy shadow-inner'
            : 'bg-brand-cream hover:bg-brand-white hover:-translate-y-px'
        }
        ${team.is_bankrupt ? 'opacity-70 bg-neutral-100' : ''}
      `}
      style={{ borderLeftColor: team.color }}
    >
      {/* 1. Team Slot & Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="font-pixel text-[11px] text-white px-2 py-0.5 border-2 border-brand-navy shadow-pixel-sm flex-shrink-0 font-bold"
          style={{ backgroundColor: team.color }}
        >
          #{team.slot}
        </span>
        <span className="font-pixel text-xs text-brand-navy truncate font-black">
          {team.name}
        </span>
        {flash === 'up' && <span className="font-pixel text-[10px] text-brand-green font-bold">▲</span>}
        {flash === 'down' && <span className="font-pixel text-[10px] text-brand-red font-bold">▼</span>}
      </div>

      {/* 2. Status Badge */}
      <div className="md:order-last flex items-center gap-1.5 justify-end">
        {team.is_bankrupt ? (
          <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-2 py-0.5 border-2 border-brand-navy font-bold shadow-pixel-sm">
            ☠ ELIMINATED
          </span>
        ) : (
          <span
            title={team.claimed ? 'Team phone connected live' : 'Waiting for phone connection'}
            className="font-pixel text-[9px] text-brand-navy flex items-center gap-1.5 bg-brand-white/80 px-2 py-0.5 border border-brand-navy"
          >
            <span
              className={`w-2 h-2 rounded-full border border-brand-navy ${
                team.claimed ? 'bg-brand-green animate-pulse' : 'bg-neutral-400'
              }`}
            />
            {team.claimed ? 'CLAIMED' : 'UNCLAIMED'}
          </span>
        )}
        {isSelected && (
          <span className="hidden sm:inline font-pixel text-[9px] bg-brand-navy text-brand-gold px-1.5 py-0.5 border border-brand-navy font-bold">
            SELECTED
          </span>
        )}
      </div>

      {/* 4. Cash Breakdown */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-pixel text-[9px] text-neutral-500 uppercase">Cash</span>
        <span className="font-mono text-xs sm:text-sm font-bold text-brand-green tabular-nums">
          ₹{team.cash.toLocaleString('en-IN')}
        </span>
      </div>

      {/* 6. Business Portfolio (Max 2 businesses) */}
      <div className="col-span-2 md:col-span-1 flex items-center gap-1.5 flex-wrap">
        <span className="font-pixel text-[9px] text-brand-navy font-bold">
          BIZ {team.businesses.length}/3
        </span>
        {team.businesses.map((biz) => (
          <span
            key={biz.business_key}
            title={`${biz.name} (Level ${biz.level})`}
            className="flex items-center bg-brand-white px-1.5 py-0.5 border-2 border-brand-navy shadow-pixel-sm"
          >
            <span className="font-mono text-[9px] font-bold text-brand-navy mr-1">
              {biz.name.slice(0, 3).toUpperCase()}
            </span>
            <PixelLevelPips level={biz.level as 0 | 1 | 2} size="sm" />
          </span>
        ))}
        {team.businesses.length === 0 && (
          <span className="font-mono text-[10px] text-neutral-400 italic">None</span>
        )}
      </div>
    </button>
  );
};
