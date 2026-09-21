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
    <div className="border-3 border-[#102040] shadow-[3px_3px_0px_#102040] overflow-x-auto bg-white">
      <table className="w-full text-left border-collapse font-mono text-xs">
        <thead>
          <tr className="bg-[#102040] text-white font-pixel text-[9px] uppercase border-b-2 border-[#102040]">
            <th className="p-2 text-center w-12">RANK</th>
            <th className="p-2">TEAM</th>
            <th className="p-2 text-right">CV</th>
            <th className="p-2 text-right">CASH</th>
            <th className="p-2 text-center">BIZ</th>
            <th className="p-2 text-center">STATUS</th>
            <th className="p-2 text-center">TIE STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#CBD5E1]">
          {standings.map((row) => {
            const color = teamColorMap.get(row.team_id) || '#64748B';

            return (
              <tr
                key={row.team_id}
                className={`
                  hover:bg-[#FAF8F5] transition-colors
                  ${row.tie_unresolved ? 'bg-[#FFFBEB]' : ''}
                  ${row.is_bankrupt ? 'bg-[#FEECEB]/40 opacity-70' : ''}
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
                      className="w-3 h-3 border border-[#102040] flex-shrink-0 shadow-[1px_1px_0px_#102040]"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-sans font-bold text-xs text-[#102040] truncate">
                      {row.name}
                    </span>
                  </div>
                </td>

                {/* CV */}
                <td className="p-2 text-right font-tabular font-bold text-[#1E40AF]">
                  ₹{row.cv.toLocaleString('en-IN')}
                </td>

                {/* Cash */}
                <td className="p-2 text-right font-tabular font-bold text-[#22B14C]">
                  ₹{row.cash.toLocaleString('en-IN')}
                </td>

                {/* Businesses */}
                <td className="p-2 text-center font-mono">
                  {row.business_count} / 3
                </td>

                {/* Status */}
                <td className="p-2 text-center">
                  {row.is_bankrupt ? (
                    <span className="font-pixel text-[9px] bg-[#D32F2F] text-white px-1.5 py-0.5 border border-[#102040] uppercase">
                      ELIMINATED
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] bg-[#E8F8EE] text-[#22B14C] px-1.5 py-0.5 border border-[#22B14C] uppercase">
                      ACTIVE
                    </span>
                  )}
                </td>

                {/* Tie Status */}
                <td className="p-2 text-center">
                  {row.tie_unresolved ? (
                    <span className="font-pixel text-[9px] bg-[#FEF3C7] text-[#B45309] border border-[#B45309] px-1.5 py-0.5 animate-pulse">
                      ⚠ UNRESOLVED TIE
                    </span>
                  ) : row.tiebreak_order ? (
                    <span className="font-pixel text-[9px] bg-[#E0E7FF] text-[#3730A3] border border-[#3730A3] px-1.5 py-0.5">
                      Pitch Order #{row.tiebreak_order}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-[#94A3B8]">—</span>
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
