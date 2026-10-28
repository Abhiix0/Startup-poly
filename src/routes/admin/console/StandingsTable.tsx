import React from 'react';
import { StandingsRow, AdminRoomSnapshot } from '../../../data/rpc';
import { MAX_BUSINESSES_PER_TEAM } from '../../../domain/economy';

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
            <th className="p-2 text-right">CASH</th>
            <th className="p-2 text-center">BIZ</th>
            <th className="p-2 text-right">BIZ COST</th>
            <th className="p-2 text-center">UPGRADES</th>
            <th className="p-2 text-center">STATUS</th>
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

                {/* Cash */}
                <td className="p-2 text-right font-tabular font-bold text-brand-green">
                  ₹{row.cash.toLocaleString('en-IN')}
                </td>

                {/* Businesses */}
                <td className="p-2 text-center font-mono">
                  {row.business_count} / {MAX_BUSINESSES_PER_TEAM}
                </td>

                <td className="p-2 text-right font-tabular font-bold text-brand-navy">
                  ₹{row.business_cost.toLocaleString('en-IN')}
                </td>
                <td className="p-2 text-center font-mono">{row.upgrade_count}</td>

                {/* Status */}
                <td className="p-2 text-center">
                  {row.is_bankrupt ? (
                    <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-1.5 py-0.5 border border-brand-navy uppercase">
                      ELIMINATED
                    </span>
                  ) : row.debt > 0 ? (
                    <span className="font-pixel text-[9px] bg-status-danger-bg text-brand-red px-1.5 py-0.5 border border-brand-red uppercase">
                      IN DEBT ₹{row.debt.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] bg-status-success-bg text-brand-green px-1.5 py-0.5 border border-brand-green uppercase">
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
