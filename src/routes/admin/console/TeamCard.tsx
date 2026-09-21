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
        className="h-2 w-full border-b-2 border-[#102040]"
        style={{ backgroundColor: team.color }}
      />

      <div className="p-2.5 sm:p-3 flex flex-col gap-2">
        {/* Header row: slot badge, team name, and claimed dot */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className="font-pixel text-[10px] text-white px-1.5 py-0.5 border border-[#102040] flex-shrink-0"
              style={{ backgroundColor: team.color }}
            >
              #{team.slot}
            </span>
            <span className="font-pixel text-xs text-[#102040] truncate">
              {team.name}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {team.is_bankrupt ? (
              <span className="font-pixel text-[9px] bg-[#D32F2F] text-white px-1 py-0.5 border border-[#102040]">
                ELIMINATED
              </span>
            ) : (
              <span
                title={team.claimed ? 'Team phone connected' : 'Waiting for phone connection'}
                className={`w-2.5 h-2.5 rounded-full border border-[#102040] ${
                  team.claimed ? 'bg-[#22B14C] animate-pulse' : 'bg-[#94A3B8]'
                }`}
              />
            )}
          </div>
        </div>

        {/* Metrics row: Cash & CV */}
        <div className="grid grid-cols-2 gap-2 bg-white p-2 border-2 border-[#102040] shadow-[1px_1px_0px_#102040]">
          <div>
            <span className="font-pixel text-[9px] text-[#64748B] block uppercase tracking-wider">
              CASH
            </span>
            <span className="font-tabular text-sm sm:text-base font-bold text-[#102040] block truncate">
              ₹{team.cash.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="font-pixel text-[9px] text-[#64748B] block uppercase tracking-wider">
              CV
            </span>
            <span className="font-tabular text-sm sm:text-base font-bold text-[#102040] block truncate">
              ₹{team.cv.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Businesses status row: n/3 count and level indicators */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[10px] text-[#64748B]">
              BIZ {team.businesses.length}/3:
            </span>
            <div className="flex items-center gap-1">
              {team.businesses.map((biz) => (
                <div
                  key={biz.business_key}
                  title={`${biz.name} (Level ${biz.level})`}
                  className="flex items-center bg-[#EAE5D9] px-1 py-0.5 border border-[#102040]"
                >
                  <span className="font-mono text-[9px] font-bold text-[#102040] mr-1">
                    {biz.name.slice(0, 3).toUpperCase()}
                  </span>
                  <PixelLevelPips level={biz.level as 0 | 1 | 2} size="sm" />
                </div>
              ))}
              {team.businesses.length === 0 && (
                <span className="font-mono text-[10px] text-[#94A3B8]">none</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
