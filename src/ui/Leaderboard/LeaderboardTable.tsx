import React from 'react';
import { LeaderboardEntry } from './exportHelpers';

export interface LeaderboardTableProps {
  standings: LeaderboardEntry[];
  highlightTeamName?: string;
  presentationMode?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  standings,
  highlightTeamName,
  presentationMode = false,
}) => {
  return (
    <div className="w-full border-4 border-[#102040] shadow-[4px_4px_0px_#102040] overflow-x-auto bg-white">
      <table className="w-full text-left border-collapse font-mono text-xs sm:text-sm">
        <thead>
          <tr className="bg-[#102040] text-white font-pixel text-[10px] sm:text-xs uppercase border-b-2 border-[#102040]">
            <th className="p-2.5 sm:p-3 text-center w-16">RANK</th>
            <th className="p-2.5 sm:p-3">TEAM</th>
            <th className="p-2.5 sm:p-3 text-right">COMPANY VALUE</th>
            <th className="p-2.5 sm:p-3 text-right">CASH</th>
            <th className="p-2.5 sm:p-3 text-center">BUSINESSES</th>
            <th className="p-2.5 sm:p-3 text-center">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#CBD5E1]">
          {standings.map((entry) => {
            const isHighlighted = highlightTeamName && entry.name === highlightTeamName;
            const isBankrupt = entry.is_bankrupt;

            return (
              <tr
                key={entry.rank}
                className={`
                  transition-colors
                  ${isHighlighted ? 'bg-[#FFEDB3] font-bold' : 'hover:bg-[#FAF8F5]'}
                  ${isBankrupt ? 'bg-[#FEECEB]/40' : ''}
                `}
              >
                {/* Rank */}
                <td className="p-2.5 sm:p-3 text-center font-pixel text-xs sm:text-sm font-bold">
                  {entry.rank === 1 && <span className="text-[#B45309]">🥇 1</span>}
                  {entry.rank === 2 && <span className="text-[#475569]">🥈 2</span>}
                  {entry.rank === 3 && <span className="text-[#B84418]">🥉 3</span>}
                  {entry.rank > 3 && <span>#{entry.rank}</span>}
                </td>

                {/* Team Info */}
                <td className="p-2.5 sm:p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="w-3.5 h-3.5 border-2 border-[#102040] flex-shrink-0 shadow-[1px_1px_0px_#102040]"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-sans font-bold text-xs sm:text-sm text-[#102040]">
                      {entry.name}
                    </span>

                    {isHighlighted && (
                      <span className="font-pixel text-[9px] bg-[#FFCC00] text-[#102040] px-1.5 py-0.5 border border-[#102040] font-bold">
                        YOU
                      </span>
                    )}

                    {entry.won_on_pitch && (
                      <span className="font-pixel text-[9px] bg-[#FFFBEB] text-[#92400E] border border-[#92400E] px-1 py-0.5 shadow-[1px_1px_0px_#92400E]">
                        ★ won on pitch
                      </span>
                    )}
                  </div>
                </td>

                {/* Company Value */}
                <td className="p-2.5 sm:p-3 text-right font-tabular font-extrabold text-sm sm:text-base text-[#1E40AF]">
                  ₹{entry.cv.toLocaleString('en-IN')}
                </td>

                {/* Cash */}
                <td className="p-2.5 sm:p-3 text-right font-tabular font-bold text-xs sm:text-sm text-[#22B14C]">
                  ₹{entry.cash.toLocaleString('en-IN')}
                </td>

                {/* Businesses Count */}
                <td className="p-2.5 sm:p-3 text-center font-mono text-xs sm:text-sm">
                  <span className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#CBD5E1]">
                    {entry.business_count} / 3
                  </span>
                </td>

                {/* Status */}
                <td className="p-2.5 sm:p-3 text-center">
                  {isBankrupt ? (
                    <span className="font-pixel text-[9px] bg-[#D32F2F] text-white px-2 py-0.5 border border-[#102040] uppercase">
                      ELIMINATED
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] bg-[#E8F8EE] text-[#22B14C] px-2 py-0.5 border border-[#22B14C] uppercase">
                      ACTIVE
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
