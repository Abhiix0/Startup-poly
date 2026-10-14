import React from 'react';
import { TeamStateResponse } from '../../data/rpc';
import { PixelCard } from '../../ui';
import { formatINR } from '../../lib/format';

export interface FinalBoardViewProps {
  state: TeamStateResponse;
}

export const FinalBoardView: React.FC<FinalBoardViewProps> = ({ state }) => {
  const { team, businesses, final_result } = state;

  const rank = final_result?.rank ?? 1;
  const isWinner = rank === 1;
  const isPodium = rank <= 3;
  const finalCv = final_result?.cv ?? team.cv;
  const finalCash = final_result?.cash ?? team.cash;
  const isBankrupt = final_result?.is_bankrupt ?? team.is_bankrupt;

  let titleBadge = `RANK #${rank}`;
  let podiumHeading = `OFFICIAL FINISH: #${rank}`;
  if (isWinner) {
    titleBadge = '1ST PLACE · WINNER';
    podiumHeading = 'STARTUPOLY CHAMPION';
  } else if (rank === 2) {
    titleBadge = '2ND PLACE · RUNNER UP';
    podiumHeading = '2ND PLACE PODIUM';
  } else if (rank === 3) {
    titleBadge = '3RD PLACE · BRONZE';
    podiumHeading = '3RD PLACE PODIUM';
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Trophy / Result Banner Card */}
      <div
        className={`border-4 border-[#102040] p-4 sm:p-5 shadow-[4px_4px_0px_#102040] flex flex-col items-center text-center relative overflow-hidden ${
          isWinner
            ? 'bg-[#FFCC00] text-[#102040]'
            : isPodium
            ? 'bg-[#FAF8F5] text-[#102040]'
            : 'bg-[#1E3A5F] text-[#FFFBEB]'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="font-pixel text-[9px] uppercase tracking-widest px-2 py-0.5 border border-[#102040] bg-white text-[#102040]">
            OFFICIAL FINAL RESULT
          </span>
          <span className="font-pixel text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#22B14C] text-white border border-[#102040]">
            YOU
          </span>
        </div>

        <div className="text-4xl sm:text-5xl my-1">
          {isWinner ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎖️'}
        </div>

        <h2 className="font-pixel text-lg sm:text-xl uppercase tracking-wider mt-1">
          {podiumHeading}
        </h2>

        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-[#102040] text-[#FFCC00] border-2 border-[#102040] font-pixel text-xs">
          <span>★</span>
          <span>{titleBadge}</span>
          <span>★</span>
        </div>

        <p className="font-mono text-xs mt-3 max-w-xs text-opacity-90">
          Match concluded and certified by Game Master. Private scores finalized.
        </p>
      </div>

      {/* Team Details & Final Metrics Card */}
      <PixelCard title="YOUR FINAL METRICS" headerBg="navy" padding="md">
        <div className="flex flex-col gap-4">
          {/* Team Tag Bar */}
          <div className="flex items-center justify-between border-b-2 border-[#CBD5E1] pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className="w-5 h-5 border-2 border-[#102040] shadow-[1px_1px_0px_#102040] shrink-0"
                style={{ backgroundColor: team.color }}
              />
              <div>
                <span className="font-pixel text-xs text-[#102040] block">
                  {team.name}
                </span>
                <span className="font-mono text-[10px] text-[#64748B]">
                  Team Slot #{team.slot}
                </span>
              </div>
            </div>

            <span
              className={`font-pixel text-[9px] px-2 py-1 border border-[#102040] ${
                isBankrupt
                  ? 'bg-[#D32F2F] text-white'
                  : 'bg-[#22B14C] text-white'
              }`}
            >
              {isBankrupt ? 'BANKRUPT' : 'SOLVENT'}
            </span>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FAF8F5] border-2 border-[#102040] p-3 shadow-[2px_2px_0px_#102040]">
              <span className="font-pixel text-[9px] text-[#64748B] block uppercase">
                COMPANY VALUE
              </span>
              <span className="font-pixel text-base sm:text-lg text-[#102040] mt-1 block">
                {finalCv.toLocaleString('en-IN')} CV
              </span>
            </div>

            <div className="bg-[#FAF8F5] border-2 border-[#102040] p-3 shadow-[2px_2px_0px_#102040]">
              <span className="font-pixel text-[9px] text-[#64748B] block uppercase">
                FINAL CASH
              </span>
              <span className="font-pixel text-base sm:text-lg text-[#22B14C] mt-1 block">
                {formatINR(finalCash)}
              </span>
            </div>
          </div>

          {/* Owned Businesses Portfolio */}
          <div className="border-t-2 border-[#CBD5E1] pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-[10px] text-[#102040] uppercase">
                PORTFOLIO ({businesses.length}/3)
              </span>
              <span className="font-mono text-[10px] text-[#64748B]">
                Max 3 businesses
              </span>
            </div>

            {businesses.length === 0 ? (
              <p className="font-mono text-xs text-[#64748B] italic py-2">
                No businesses owned at match conclusion.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {businesses.map((b) => (
                  <div
                    key={b.business_key}
                    className="bg-white border-2 border-[#102040] px-3 py-2 flex items-center justify-between shadow-[1px_1px_0px_#102040]"
                  >
                    <div>
                      <span className="font-pixel text-xs text-[#102040] block">
                        {b.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#64748B]">
                        Initial cost: {formatINR(b.cost)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[9px] bg-[#FFCC00] text-[#102040] px-1.5 py-0.5 border border-[#102040]">
                        {b.level === 0 ? 'BASE' : `UPGRADE ${b.level}`}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#102040]">
                        +{b.cv_contribution} CV
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official Privacy Notice */}
          <div className="bg-[#FEF9C3] border-2 border-[#B45309] p-2.5 text-center shadow-[1px_1px_0px_#B45309]">
            <p className="font-mono text-[11px] text-[#92400E] leading-relaxed">
              🔒 Open-ground tournament rules: Team scores remain strictly private to your device. Complete tournament standings are displayed on the Game Master console.
            </p>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};
