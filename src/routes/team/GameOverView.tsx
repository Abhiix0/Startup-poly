import React from 'react';
import { PixelCard, BigNumber } from '../../ui';
import { PixelCoin } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { TeamStateResponse } from '../../data/rpc';

interface GameOverViewProps {
  state: TeamStateResponse;
}

export const GameOverView: React.FC<GameOverViewProps> = ({ state }) => {
  const { team, businesses } = state;
  const totalAssets = team.cash + team.cv;

  return (
    <div className="flex flex-col gap-4 text-center">
      {/* Game Over Banner Card */}
      <PixelCard title="MATCH TIME EXPIRED" headerBg="brick" padding="lg">
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <div className="w-14 h-14 bg-[#D32F2F] text-white border-3 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center font-pixel text-2xl mx-auto">
            ⌛
          </div>

          <h2 className="font-pixel text-lg sm:text-xl text-[#102040] uppercase">
            GAME OVER
          </h2>

          <div className="inline-block bg-[#FFFBEB] border-2 border-[#102040] px-4 py-1.5 shadow-[2px_2px_0px_#102040]">
            <span className="font-pixel text-xs text-[#92400E] uppercase tracking-wider">
              ★ FINAL SCORES PENDING ★
            </span>
          </div>

          <p className="font-mono text-xs text-[#64748B] max-w-xs leading-relaxed">
            The 50-minute match has concluded! The game organizer is verifying final board transactions,
            resolving any ties, and snapshotting the official leaderboard.
          </p>
        </div>
      </PixelCard>

      {/* Team Final Snapshot Metrics */}
      <PixelCard title="YOUR MATCH RESULTS" headerBg="navy" padding="md">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <BigNumber
            label="FINAL CASH"
            value={formatINR(team.cash)}
            variant="green"
            size="sm"
            icon={<PixelCoin size={20} />}
          />
          <BigNumber
            label="FINAL CV"
            value={`${team.cv.toLocaleString()} CV`}
            variant="navy"
            size="sm"
          />
        </div>

        <div className="bg-[#FFCC00] border-3 border-[#102040] p-3 shadow-[2px_2px_0px_#102040] flex items-center justify-between mb-3">
          <span className="font-pixel text-xs text-[#102040]">TOTAL VALUATION:</span>
          <span className="font-tabular font-extrabold text-lg text-[#102040]">
            {formatINR(totalAssets)}
          </span>
        </div>

        <div className="bg-white border-2 border-[#102040] p-3 text-center">
          <span className="font-pixel text-[10px] text-[#64748B] block uppercase mb-1">
            PORTFOLIO SUMMARY
          </span>
          <span className="font-mono font-bold text-xs text-[#102040]">
            {businesses.length} of 3 Businesses Held at Match End
          </span>
        </div>
      </PixelCard>
    </div>
  );
};
