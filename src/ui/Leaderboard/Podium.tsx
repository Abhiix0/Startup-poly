import React from 'react';
import { PixelTrophy } from '../pixel';
import { LeaderboardEntry } from './exportHelpers';

export interface PodiumProps {
  topTeams: LeaderboardEntry[];
  highlightTeamName?: string;
  presentationMode?: boolean;
}

export const Podium: React.FC<PodiumProps> = ({
  topTeams,
  highlightTeamName,
  presentationMode = false,
}) => {
  const first = topTeams.find((t) => t.rank === 1);
  const second = topTeams.find((t) => t.rank === 2);
  const third = topTeams.find((t) => t.rank === 3);

  if (!first) return null;

  return (
    <div
      className={`w-full flex items-end justify-center gap-2 sm:gap-4 pt-6 pb-2 select-none ${
        presentationMode ? 'scale-105 sm:scale-110 my-4' : ''
      }`}
    >
      {/* 2nd Place (Left) */}
      {second && (
        <div className="flex-1 max-w-[160px] sm:max-w-[200px] flex flex-col items-center">
          {/* Team Info Card */}
          <div
            className={`w-full bg-neutral-50 border-3 border-brand-navy shadow-pixel-sm p-2 text-center mb-1 transition-transform ${
              highlightTeamName === second.name ? 'ring-3 ring-brand-gold' : ''
            }`}
          >
            <span
              className="inline-block w-3 h-3 border border-brand-navy mb-0.5"
              style={{ backgroundColor: second.color }}
            />
            <span className="font-pixel text-[10px] sm:text-xs text-brand-navy block truncate">
              {second.name}
            </span>
            <span className="font-mono font-bold text-[11px] sm:text-xs text-status-info-dark">
              ₹{second.cv.toLocaleString('en-IN')} CV
            </span>
          </div>

          {/* Pedestal Block (Silver / 70px) */}
          <div className="w-full h-20 sm:h-24 bg-neutral-200 border-3 border-brand-navy shadow-[3px_3px_0px_var(--color-brand-navy)] flex flex-col items-center justify-center relative">
            <span className="font-pixel text-lg sm:text-2xl text-neutral-500 drop-shadow-[1px_1px_0px_var(--color-brand-white)]">
              #2
            </span>
            <span className="font-pixel text-[9px] text-neutral-600 uppercase">SILVER</span>
          </div>
        </div>
      )}

      {/* 1st Place (Center, Highest) */}
      {first && (
        <div className="flex-1 max-w-[180px] sm:max-w-[230px] flex flex-col items-center z-10">
          {/* Floating Trophy & Winner Pill */}
          <div className="mb-1 flex flex-col items-center">
            <PixelTrophy size={presentationMode ? 56 : 42} className="anim-trophy-bob mb-1" />
            <span className="font-pixel text-[9px] sm:text-[10px] bg-brand-gold text-brand-navy px-2 py-0.5 border-2 border-brand-navy uppercase tracking-wider font-bold shadow-[1px_1px_0px_var(--color-brand-navy)]">
              ★ WINNER ★
            </span>
          </div>

          {/* Team Info Card */}
          <div
            className={`w-full bg-status-warning-bg border-3 border-brand-navy shadow-[3px_3px_0px_var(--color-brand-navy)] p-2.5 text-center mb-1 transition-transform ${
              highlightTeamName === first.name ? 'ring-3 ring-brand-gold' : ''
            }`}
          >
            <span
              className="inline-block w-3.5 h-3.5 border border-brand-navy mb-0.5"
              style={{ backgroundColor: first.color }}
            />
            <span className="font-pixel text-xs sm:text-sm text-brand-navy block truncate font-bold">
              {first.name}
            </span>
            <span className="font-mono font-extrabold text-xs sm:text-sm text-brand-green">
              ₹{first.cv.toLocaleString('en-IN')} CV
            </span>
          </div>

          {/* Pedestal Block (Gold / 100px) */}
          <div className="w-full h-28 sm:h-36 bg-brand-gold border-4 border-brand-navy shadow-pixel flex flex-col items-center justify-center relative">
            <span className="font-pixel text-2xl sm:text-4xl text-brand-navy drop-shadow-[2px_2px_0px_var(--color-brand-white)]">
              #1
            </span>
            <span className="font-pixel text-[10px] sm:text-xs text-status-warning-text uppercase font-bold">
              CHAMPION
            </span>
          </div>
        </div>
      )}

      {/* 3rd Place (Right, Lowest) */}
      {third && (
        <div className="flex-1 max-w-[160px] sm:max-w-[200px] flex flex-col items-center">
          {/* Team Info Card */}
          <div
            className={`w-full bg-neutral-50 border-3 border-brand-navy shadow-pixel-sm p-2 text-center mb-1 transition-transform ${
              highlightTeamName === third.name ? 'ring-3 ring-brand-gold' : ''
            }`}
          >
            <span
              className="inline-block w-3 h-3 border border-brand-navy mb-0.5"
              style={{ backgroundColor: third.color }}
            />
            <span className="font-pixel text-[10px] sm:text-xs text-brand-navy block truncate">
              {third.name}
            </span>
            <span className="font-mono font-bold text-[11px] sm:text-xs text-status-info-dark">
              ₹{third.cv.toLocaleString('en-IN')} CV
            </span>
          </div>

          {/* Pedestal Block (Bronze / 55px) */}
          <div className="w-full h-16 sm:h-20 bg-brand-brick/20 border-3 border-brand-navy shadow-[3px_3px_0px_var(--color-brand-navy)] flex flex-col items-center justify-center relative">
            <span className="font-pixel text-base sm:text-xl text-brand-brick drop-shadow-[1px_1px_0px_var(--color-brand-white)]">
              #3
            </span>
            <span className="font-pixel text-[9px] text-brand-brick uppercase">BRONZE</span>
          </div>
        </div>
      )}
    </div>
  );
};
