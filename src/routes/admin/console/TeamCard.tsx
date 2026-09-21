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
      ? 'bg-[#E8F8EE] ring-4 ring-[#22B14C]'
      : flash === 'down'
      ? 'bg-[#FEECEB] ring-4 ring-[#D32F2F]'
      : '';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select team ${team.slot}: ${team.name}`}
      className={`
        relative text-left w-full transition-all duration-100 cursor-pointer select-none
        border-4 border-[#102040] overflow-hidden flex flex-col justify-between
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-2
        ${flashBg}
        ${
          isSelected
            ? 'bg-[#FFFBEB] shadow-[4px_4px_0px_#102040] ring-3 ring-[#FFCC00] scale-[1.01]'
            : 'bg-[#FAF8F5] hover:bg-[#F1F5F9] shadow-[2px_2px_0px_#102040]'
        }
      `}
    >
      {/* Top Team Color Stripe */}
      <div
        className="h-2.5 w-full border-b-2 border-[#102040] relative"
        style={{ backgroundColor: team.color }}
      >
        {flash === 'up' && (
          <span className="absolute right-1 -top-1 bg-[#22B14C] text-white font-pixel text-[8px] px-1 border border-[#102040]">
            ▲ +
          </span>
        )}
        {flash === 'down' && (
          <span className="absolute right-1 -top-1 bg-[#D32F2F] text-white font-pixel text-[8px] px-1 border border-[#102040]">
            ▼ -
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-3 flex flex-col gap-2.5">
        {/* Header row: slot badge, team name, and claimed dot */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className="font-pixel text-[10px] text-white px-1.5 py-0.5 border border-[#102040] flex-shrink-0"
              style={{ backgroundColor: team.color }}
            >
              #{team.slot}
            </span>
            <span className="font-pixel text-xs text-[#102040] truncate font-bold">
              {team.name}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {team.is_bankrupt ? (
              <span className="font-pixel text-[9px] bg-[#D32F2F] text-white px-1 py-0.5 border border-[#102040]">
                ☠ ELIMINATED
              </span>
            ) : (
              <span
                title={team.claimed ? 'Team phone connected' : 'Waiting for phone connection'}
                className={`w-3 h-3 rounded-full border border-[#102040] ${
                  team.claimed ? 'bg-[#22B14C] animate-pulse' : 'bg-[#94A3B8]'
                }`}
              />
            )}
          </div>
        </div>

        {/* Metrics row: Cash & CV (≥ 32px numbers) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 bg-white p-2.5 border-2 border-[#102040] shadow-[1px_1px_0px_#102040]">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-[#102040] block uppercase tracking-wider font-bold">
                CASH
              </span>
              <PixelCoin size={14} />
            </div>
            <span className="font-tabular text-[32px] leading-tight font-black text-[#22B14C] block truncate tabular-nums">
              ₹{team.cash.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-pixel text-[9px] text-[#102040] block uppercase tracking-wider font-bold">
                CV
              </span>
              <span className="font-pixel text-[8px] bg-[#102040] text-[#FFCC00] px-1 py-0.2">
                CV
              </span>
            </div>
            <span className="font-tabular text-[32px] leading-tight font-black text-[#1E40AF] block truncate tabular-nums">
              ₹{team.cv.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Businesses status row: n/3 count and level indicators */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-pixel text-[9px] text-[#102040] font-bold">
              BIZ {team.businesses.length}/3:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {team.businesses.map((biz) => (
                <div
                  key={biz.business_key}
                  title={`${biz.name} (Level ${biz.level})`}
                  className="flex items-center bg-[#FAF8F5] px-1 py-0.5 border border-[#102040]"
                >
                  <span className="font-mono text-[9px] font-bold text-[#102040] mr-1">
                    {biz.name.slice(0, 3).toUpperCase()}
                  </span>
                  <PixelLevelPips level={biz.level as 0 | 1 | 2} size="sm" />
                </div>
              ))}
              {team.businesses.length === 0 && (
                <span className="font-mono text-[10px] text-[#64748B]">none</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
