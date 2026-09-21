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
            className={`w-full bg-[#FAF8F5] border-3 border-[#102040] shadow-[2px_2px_0px_#102040] p-2 text-center mb-1 transition-transform ${
              highlightTeamName === second.name ? 'ring-3 ring-[#FFCC00]' : ''
            }`}
          >
            <span
              className="inline-block w-3 h-3 border border-[#102040] mb-0.5"
              style={{ backgroundColor: second.color }}
            />
            <span className="font-pixel text-[10px] sm:text-xs text-[#102040] block truncate">
              {second.name}
            </span>
            <span className="font-mono font-bold text-[11px] sm:text-xs text-[#1E40AF]">
              ₹{second.cv.toLocaleString('en-IN')} CV
            </span>
          </div>

          {/* Pedestal Block (Silver / 70px) */}
          <div className="w-full h-20 sm:h-24 bg-[#E2E8F0] border-3 border-[#102040] shadow-[3px_3px_0px_#102040] flex flex-col items-center justify-center relative">
            <span className="font-pixel text-lg sm:text-2xl text-[#64748B] drop-shadow-[1px_1px_0px_#FFFFFF]">
              #2
            </span>
            <span className="font-pixel text-[9px] text-[#475569] uppercase">SILVER</span>
          </div>
        </div>
      )}

      {/* 1st Place (Center, Highest) */}
      {first && (
        <div className="flex-1 max-w-[180px] sm:max-w-[230px] flex flex-col items-center z-10">
          {/* Floating Trophy & Winner Pill */}
          <div className="mb-1 flex flex-col items-center">
            <PixelTrophy size={presentationMode ? 56 : 42} className="motion-safe:animate-bounce mb-1" />
            <span className="font-pixel text-[9px] sm:text-[10px] bg-[#FFCC00] text-[#102040] px-2 py-0.5 border-2 border-[#102040] uppercase tracking-wider font-bold shadow-[1px_1px_0px_#102040]">
              ★ WINNER ★
            </span>
          </div>

          {/* Team Info Card */}
          <div
            className={`w-full bg-[#FFFBEB] border-3 border-[#102040] shadow-[3px_3px_0px_#102040] p-2.5 text-center mb-1 transition-transform ${
              highlightTeamName === first.name ? 'ring-3 ring-[#FFCC00]' : ''
            }`}
          >
            <span
              className="inline-block w-3.5 h-3.5 border border-[#102040] mb-0.5"
              style={{ backgroundColor: first.color }}
            />
            <span className="font-pixel text-xs sm:text-sm text-[#102040] block truncate font-bold">
              {first.name}
            </span>
            <span className="font-mono font-extrabold text-xs sm:text-sm text-[#22B14C]">
              ₹{first.cv.toLocaleString('en-IN')} CV
            </span>
          </div>

          {/* Pedestal Block (Gold / 100px) */}
          <div className="w-full h-28 sm:h-36 bg-[#FFCC00] border-4 border-[#102040] shadow-[4px_4px_0px_#102040] flex flex-col items-center justify-center relative">
            <span className="font-pixel text-2xl sm:text-4xl text-[#102040] drop-shadow-[2px_2px_0px_#FFFFFF]">
              #1
            </span>
            <span className="font-pixel text-[10px] sm:text-xs text-[#92400E] uppercase font-bold">
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
            className={`w-full bg-[#FAF8F5] border-3 border-[#102040] shadow-[2px_2px_0px_#102040] p-2 text-center mb-1 transition-transform ${
              highlightTeamName === third.name ? 'ring-3 ring-[#FFCC00]' : ''
            }`}
          >
            <span
              className="inline-block w-3 h-3 border border-[#102040] mb-0.5"
              style={{ backgroundColor: third.color }}
            />
            <span className="font-pixel text-[10px] sm:text-xs text-[#102040] block truncate">
              {third.name}
            </span>
            <span className="font-mono font-bold text-[11px] sm:text-xs text-[#1E40AF]">
              ₹{third.cv.toLocaleString('en-IN')} CV
            </span>
          </div>

          {/* Pedestal Block (Bronze / 55px) */}
          <div className="w-full h-16 sm:h-20 bg-[#FAD9C8] border-3 border-[#102040] shadow-[3px_3px_0px_#102040] flex flex-col items-center justify-center relative">
            <span className="font-pixel text-base sm:text-xl text-[#B84418] drop-shadow-[1px_1px_0px_#FFFFFF]">
              #3
            </span>
            <span className="font-pixel text-[9px] text-[#B84418] uppercase">BRONZE</span>
          </div>
        </div>
      )}
    </div>
  );
};
