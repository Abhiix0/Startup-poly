import React from 'react';
import { StandingsRow, AdminRoomSnapshot } from '../../../data/rpc';

export interface StandingsTableProps {
  standings: StandingsRow[];
  teams?: AdminRoomSnapshot['teams'];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  teams = [],
}) => {
  const teamColorMap = new Map(teams.map((t) => [t.id, t.color]));

  return (
    <div className="border-3 border-brand-navy shadow-pixel-sm overflow-x-auto bg-brand-white">
      <table className="w-full text-left border-collapse font-mono text-xs">
        <thead>
          <tr className="bg-brand-navy text-brand-white font-pixel text-[9px] uppercase border-b-2 border-brand-navy">
            <th className="p-2 text-center w-12">RANK</th>
            <th className="p-2">TEAM</th>
            <th className="p-2 text-right">CV</th>
            <th className="p-2 text-right">CASH</th>
            <th className="p-2 text-center">BIZ</th>
            <th className="p-2 text-center">STATUS</th>
            <th className="p-2 text-center">TIE STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-300">
          {standings.map((row) => {
            const color = teamColorMap.get(row.team_id) || 'var(--color-neutral-500)';

            return (
              <tr
                key={row.team_id}
                className={`
                  hover:bg-brand-cream transition-colors
                  ${row.tie_unresolved ? 'bg-brand-cream-light' : ''}
                  ${row.is_bankrupt ? 'bg-status-danger-bg/40 opacity-70' : ''}
                `}
              >
                {/* Rank */}
                <td className="p-2 text-center font-pixel text-xs font-bold">
                  {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : `#${row.rank}`}
                </td>

                {/* Team */}
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 border border-brand-navy flex-shrink-0 shadow-pixel-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-sans font-bold text-xs text-brand-navy truncate">
                      {row.name}
                    </span>
                  </div>
                </td>

                {/* CV */}
                <td className="p-2 text-right font-tabular font-bold text-brand-navy">
                  ₹{row.cv.toLocaleString('en-IN')}
                </td>

                {/* Cash */}
                <td className="p-2 text-right font-tabular font-bold text-brand-green">
                  ₹{row.cash.toLocaleString('en-IN')}
                </td>

                {/* Businesses */}
                <td className="p-2 text-center font-mono">
                  {row.business_count} / 3
                </td>

                {/* Status */}
                <td className="p-2 text-center">
                  {row.is_bankrupt ? (
                    <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-1.5 py-0.5 border border-brand-navy uppercase">
                      ELIMINATED
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] bg-status-success-bg text-brand-green px-1.5 py-0.5 border border-brand-green uppercase">
                      ACTIVE
                    </span>
                  )}
                </td>

                {/* Tie Status */}
                <td className="p-2 text-center">
                  {row.tie_unresolved ? (
                    <span className="font-pixel text-[9px] bg-status-warning-bg text-status-warning-dark border border-brand-gold px-1.5 py-0.5 animate-pulse">
                      ⚠ UNRESOLVED TIE
                    </span>
                  ) : row.tiebreak_order ? (
                    <span className="font-pixel text-[9px] bg-status-info-bg text-status-info-dark border border-blue-400 px-1.5 py-0.5">
                      Pitch Order #{row.tiebreak_order}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-neutral-400">—</span>
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
