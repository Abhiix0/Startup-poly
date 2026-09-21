import React from 'react';
import { PixelCard } from '../../ui';
import { PixelTrophy } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { TeamStateResponse } from '../../data/rpc';

interface FinalBoardViewProps {
  state: TeamStateResponse;
}

export const FinalBoardView: React.FC<FinalBoardViewProps> = ({ state }) => {
  const { team, leaderboard } = state;

  const myEntry = leaderboard?.find((entry) => entry.name === team.name);
  const isWinner = myEntry?.rank === 1 && !myEntry?.is_bankrupt;

  return (
    <div className="flex flex-col gap-4">
      {/* Winner Banner if Rank 1 */}
      {isWinner ? (
        <div className="bg-[#FFCC00] border-4 border-[#102040] shadow-[4px_4px_0px_#102040] p-4 text-center">
          <PixelTrophy size={48} className="mx-auto mb-2 animate-bounce" />
          <h2 className="font-pixel text-base sm:text-lg text-[#102040] uppercase">
            ★ TOURNAMENT CHAMPIONS! ★
          </h2>
          <p className="font-mono text-xs text-[#102040] font-bold mt-1">
            {team.name} finished Rank #1 in the official tournament standings!
          </p>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border-4 border-[#102040] shadow-[4px_4px_0px_#102040] p-4 text-center">
          <span className="font-pixel text-xs sm:text-sm text-[#102040] uppercase block">
            MATCH FINALIZED • FINAL RESULTS
          </span>
          <p className="font-mono text-xs text-[#64748B] mt-0.5">
            Your team finished Rank #{myEntry?.rank || '-'}
          </p>
        </div>
      )}

      {/* Official Podium Standings Table */}
      <PixelCard title="OFFICIAL TOURNAMENT STANDINGS" headerBg="navy" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#102040] text-white font-pixel text-[9px] uppercase border-b-2 border-[#102040]">
                <th className="p-2.5 text-center">RANK</th>
                <th className="p-2.5">TEAM</th>
                <th className="p-2.5 text-right">CV</th>
                <th className="p-2.5 text-right">CASH</th>
                <th className="p-2.5 text-center">PORTFOLIO</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#102040] bg-white">
              {leaderboard?.map((entry) => {
                const isMyTeam = entry.name === team.name;

                return (
                  <tr
                    key={entry.rank}
                    className={`
                      ${isMyTeam ? 'bg-[#FFEDB3] font-bold' : 'hover:bg-[#FAF8F5]'}
                      ${entry.is_bankrupt ? 'opacity-60' : ''}
                    `}
                  >
                    <td className="p-2.5 text-center font-pixel text-xs">
                      {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : `#${entry.rank}`}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-3 h-3 border border-[#102040] flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate">
                          {entry.name}
                          {isMyTeam && ' (YOU)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-tabular text-[#1E40AF]">
                      {entry.cv.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-tabular text-[#22B14C]">
                      {formatINR(entry.cash)}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="text-[10px]">
                        {entry.business_count}/3
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PixelCard>
    </div>
  );
};
