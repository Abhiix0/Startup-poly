import React from 'react';
import { PixelLevelPips, PixelCoin } from '../../../ui/pixel';
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
      ? 'bg-status-success-bg ring-4 ring-brand-green'
      : flash === 'down'
      ? 'bg-status-danger-bg ring-4 ring-brand-red'
      : '';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select team ${team.slot}: ${team.name}`}
      className={`
        relative text-left w-full transition-all duration-100 cursor-pointer select-none
        border-4 border-brand-navy overflow-hidden flex flex-col justify-between
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold focus-visible:ring-offset-2
        ${flashBg}
        ${
          isSelected
            ? 'bg-brand-cream-light shadow-pixel ring-3 ring-brand-gold scale-[1.01]'
            : 'bg-brand-cream hover:bg-neutral-100 shadow-pixel-sm'
        }
      `}
    >
      {/* Top Team Color Stripe */}
      <div
        className="h-2.5 w-full border-b-2 border-brand-navy relative"
        style={{ backgroundColor: team.color }}
      >
        {flash === 'up' && (
          <span className="absolute right-1 -top-1 bg-brand-green text-brand-white font-pixel text-[8px] px-1 border border-brand-navy">
            ▲ +
          </span>
        )}
        {flash === 'down' && (
          <span className="absolute right-1 -top-1 bg-brand-red text-brand-white font-pixel text-[8px] px-1 border border-brand-navy">
            ▼ -
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-3 flex flex-col gap-2.5">
        {/* Header row: slot badge, team name, and claimed dot */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className="font-pixel text-[10px] text-white px-1.5 py-0.5 border border-brand-navy flex-shrink-0"
              style={{ backgroundColor: team.color }}
            >
              #{team.slot}
            </span>
            <span className="font-pixel text-xs text-brand-navy truncate font-bold">
              {team.name}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {team.is_bankrupt ? (
              <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-1 py-0.5 border border-brand-navy">
                ☠ ELIMINATED
              </span>
            ) : (
              <span
                title={team.claimed ? 'Team phone connected' : 'Waiting for phone connection'}
                className={`w-3 h-3 rounded-full border border-brand-navy ${
                  team.claimed ? 'bg-brand-green animate-pulse' : 'bg-neutral-400'
                }`}
              />
            )}
          </div>
        </div>

        {/* Metrics row: Cash & CV (≥ 32px numbers) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 bg-brand-white p-2.5 border-2 border-brand-navy shadow-pixel-sm">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-brand-navy block uppercase tracking-wider font-bold">
                CASH
              </span>
              <PixelCoin size={14} />
            </div>
            <span className="font-tabular text-[32px] leading-tight font-black text-brand-green block truncate tabular-nums">
              ₹{team.cash.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-brand-navy block uppercase tracking-wider font-bold">
                CV
              </span>
              <span className="font-pixel text-[8px] bg-brand-navy text-brand-gold px-1 py-0.2">
                CV
              </span>
            </div>
            <span className="font-tabular text-[32px] leading-tight font-black text-brand-navy block truncate tabular-nums">
              ₹{team.cv.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Businesses status row: n/3 count and level indicators */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-pixel text-[9px] text-brand-navy font-bold">
              BIZ {team.businesses.length}/3:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {team.businesses.map((biz) => (
                <div
                  key={biz.business_key}
                  title={`${biz.name} (Level ${biz.level})`}
                  className="flex items-center bg-brand-cream px-1 py-0.5 border border-brand-navy"
                >
                  <span className="font-mono text-[9px] font-bold text-brand-navy mr-1">
                    {biz.name.slice(0, 3).toUpperCase()}
                  </span>
                  <PixelLevelPips level={biz.level as 0 | 1 | 2} size="sm" />
                </div>
              ))}
              {team.businesses.length === 0 && (
                <span className="font-mono text-[10px] text-neutral-500">none</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
