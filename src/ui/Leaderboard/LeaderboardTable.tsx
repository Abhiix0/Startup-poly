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
  presentationMode: _presentationMode = false,
}) => {
  return (
    <div className="w-full border-4 border-brand-navy shadow-pixel overflow-x-auto bg-brand-white">
      <table className="w-full text-left border-collapse font-mono text-xs sm:text-sm">
        <thead>
          <tr className="bg-brand-navy text-brand-white font-pixel text-[10px] sm:text-xs uppercase border-b-2 border-brand-navy">
            <th className="p-2.5 sm:p-3 text-center w-16">RANK</th>
            <th className="p-2.5 sm:p-3">TEAM</th>
            <th className="p-2.5 sm:p-3 text-right">COMPANY VALUE</th>
            <th className="p-2.5 sm:p-3 text-right">CASH</th>
            <th className="p-2.5 sm:p-3 text-center">BUSINESSES</th>
            <th className="p-2.5 sm:p-3 text-center">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-neutral-300">
          {standings.map((entry) => {
            const isHighlighted = highlightTeamName && entry.name === highlightTeamName;
            const isBankrupt = entry.is_bankrupt;

            return (
              <tr
                key={entry.rank}
                className={`
                  transition-colors
                  ${isHighlighted ? 'bg-status-warning-light font-bold' : 'hover:bg-neutral-50'}
                  ${isBankrupt ? 'bg-status-danger-bg/40' : ''}
                `}
              >
                {/* Rank */}
                <td className="p-2.5 sm:p-3 text-center font-pixel text-xs sm:text-sm font-bold">
                  {entry.rank === 1 && <span className="text-status-warning-dark">🥇 1</span>}
                  {entry.rank === 2 && <span className="text-neutral-600">🥈 2</span>}
                  {entry.rank === 3 && <span className="text-brand-brick">🥉 3</span>}
                  {entry.rank > 3 && <span>#{entry.rank}</span>}
                </td>

                {/* Team Info */}
                <td className="p-2.5 sm:p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="w-3.5 h-3.5 border-2 border-brand-navy flex-shrink-0 shadow-[1px_1px_0px_var(--color-brand-navy)]"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-sans font-bold text-xs sm:text-sm text-brand-navy">
                      {entry.name}
                    </span>

                    {isHighlighted && (
                      <span className="font-pixel text-[9px] bg-brand-gold text-brand-navy px-1.5 py-0.5 border border-brand-navy font-bold">
                        YOU
                      </span>
                    )}

                    {entry.won_on_pitch && (
                      <span className="font-pixel text-[9px] bg-status-warning-bg text-status-warning-text border border-status-warning-text px-1 py-0.5 shadow-[1px_1px_0px_var(--color-status-warning-text)]">
                        ★ won on pitch
                      </span>
                    )}
                  </div>
                </td>

                {/* Company Value */}
                <td className="p-2.5 sm:p-3 text-right font-tabular font-extrabold text-sm sm:text-base text-status-info-dark">
                  ₹{entry.cv.toLocaleString('en-IN')}
                </td>

                {/* Cash */}
                <td className="p-2.5 sm:p-3 text-right font-tabular font-bold text-xs sm:text-sm text-brand-green">
                  ₹{entry.cash.toLocaleString('en-IN')}
                </td>

                {/* Businesses Count */}
                <td className="p-2.5 sm:p-3 text-center font-mono text-xs sm:text-sm">
                  <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-300">
                    {entry.business_count} / 3
                  </span>
                </td>

                {/* Status */}
                <td className="p-2.5 sm:p-3 text-center">
                  {isBankrupt ? (
                    <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-2 py-0.5 border border-brand-navy uppercase">
                      ELIMINATED
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] bg-status-success-bg text-brand-green px-2 py-0.5 border border-brand-green uppercase">
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
