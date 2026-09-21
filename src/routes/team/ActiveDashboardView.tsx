import React from 'react';
import { PixelCard, Countdown, EmptyState } from '../../ui';
import { PixelCoin, PixelLevelPips, PixelBusinessIcon } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { TeamStateResponse } from '../../data/rpc';
import { FlashDirection } from '../../data/useMyTeam';

interface ActiveDashboardViewProps {
  state: TeamStateResponse;
  onExpire: () => void;
  cashFlash: FlashDirection;
  cvFlash: FlashDirection;
}

export const ActiveDashboardView: React.FC<ActiveDashboardViewProps> = ({
  state,
  onExpire,
  cashFlash,
  cvFlash,
}) => {
  const { team, room, businesses } = state;
  const totalAssets = team.cash + team.cv;

  const cashFlashClass =
    cashFlash === 'up'
      ? 'bg-[#DCFCE7] border-[#22C55E] ring-4 ring-[#22C55E] transition-colors duration-300'
      : cashFlash === 'down'
      ? 'bg-[#FEF2F2] border-[#EF4444] ring-4 ring-[#EF4444] transition-colors duration-300'
      : 'bg-white border-[#102040]';

  const cvFlashClass =
    cvFlash === 'up'
      ? 'bg-[#EFF6FF] border-[#3B82F6] ring-4 ring-[#3B82F6] transition-colors duration-300'
      : cvFlash === 'down'
      ? 'bg-[#FEF2F2] border-[#EF4444] ring-4 ring-[#EF4444] transition-colors duration-300'
      : 'bg-white border-[#102040]';

  return (
    <div className="flex flex-col gap-4">
      {/* Bankrupt Eliminated Banner */}
      {team.is_bankrupt && (
        <div className="bg-[#D32F2F] text-white border-4 border-[#102040] shadow-[4px_4px_0px_#102040] p-3.5 text-center">
          <span className="font-pixel text-sm sm:text-base tracking-wider block">
            ☠ ELIMINATED • TEAM IS BANKRUPT ☠
          </span>
          <span className="font-mono text-xs opacity-90 block mt-0.5">
            Unable to settle board obligations. Financial assets frozen.
          </span>
        </div>
      )}

      {/* Authoritative Server Countdown Clock Card */}
      <div className="text-center">
        <div className="bg-[#102040] text-white border-4 border-[#102040] shadow-[4px_4px_0px_#102040] p-3 sm:p-4">
          <Countdown
            endsAt={room.ends_at}
            status={room.status}
            serverNow={room.server_now}
            onExpire={onExpire}
            size="lg"
            showLabel={false}
          />
          <span className="font-pixel text-[10px] text-[#FFCC00] uppercase tracking-widest block mt-1">
            GAME TIME LEFT
          </span>
        </div>
      </div>

      {/* HUGE Financial Metrics: Cash & CV (≥ 44px on mobile) */}
      <div className="flex flex-col gap-3">
        {/* HUGE Cash Card */}
        <div
          className={`
            border-4 shadow-[4px_4px_0px_#102040] p-4 flex flex-col justify-between relative
            ${cashFlashClass}
          `}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[11px] uppercase tracking-wider text-[#102040] font-bold">
              AVAILABLE CASH
            </span>
            <div className="flex items-center gap-1.5">
              {cashFlash === 'up' && (
                <span className="bg-[#22B14C] text-white font-pixel text-[9px] px-1.5 py-0.5 border border-[#102040]">
                  ▲ +
                </span>
              )}
              {cashFlash === 'down' && (
                <span className="bg-[#D32F2F] text-white font-pixel text-[9px] px-1.5 py-0.5 border border-[#102040]">
                  ▼ -
                </span>
              )}
              <PixelCoin size={24} />
            </div>
          </div>
          <div className="font-tabular font-black text-[44px] leading-tight sm:text-5xl text-[#22B14C] tracking-tight tabular-nums">
            {formatINR(team.cash)}
          </div>
        </div>

        {/* HUGE Company Value Card */}
        <div
          className={`
            border-4 shadow-[4px_4px_0px_#102040] p-4 flex flex-col justify-between relative
            ${cvFlashClass}
          `}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[11px] uppercase tracking-wider text-[#102040] font-bold">
              COMPANY VALUE
            </span>
            <div className="flex items-center gap-1.5">
              {cvFlash === 'up' && (
                <span className="bg-[#1E40AF] text-white font-pixel text-[9px] px-1.5 py-0.5 border border-[#102040]">
                  ▲ +
                </span>
              )}
              {cvFlash === 'down' && (
                <span className="bg-[#D32F2F] text-white font-pixel text-[9px] px-1.5 py-0.5 border border-[#102040]">
                  ▼ -
                </span>
              )}
              <span className="font-pixel text-[10px] bg-[#102040] text-[#FFCC00] px-2 py-0.5 border border-[#102040]">
                CV
              </span>
            </div>
          </div>
          <div className="font-tabular font-black text-[44px] leading-tight sm:text-5xl text-[#1E40AF] tracking-tight tabular-nums">
            {team.cv.toLocaleString()} <span className="text-2xl sm:text-3xl text-[#334155]">CV</span>
          </div>
        </div>

        {/* Total Assets Summary Banner */}
        <div className="bg-[#FFCC00] border-4 border-[#102040] p-3 shadow-[4px_4px_0px_#102040] flex items-center justify-between">
          <span className="font-pixel text-xs text-[#102040] uppercase font-bold">
            TOTAL VALUATION:
          </span>
          <span className="font-tabular font-black text-2xl text-[#102040] tabular-nums">
            {formatINR(totalAssets)}
          </span>
        </div>
      </div>

      {/* Owned Businesses List */}
      <PixelCard
        title={`PORTFOLIO (${businesses.length}/3)`}
        headerBg="navy"
        padding="sm"
      >
        {businesses.length === 0 ? (
          <EmptyState
            title="NO BUSINESSES YET"
            description="Acquire unowned businesses when landing on them around the physical board."
            className="border-none bg-transparent p-4"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {businesses.map((biz) => (
              <div
                key={biz.business_key}
                className="border-3 border-[#102040] bg-white p-3 shadow-[2px_2px_0px_#102040] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between border-b-2 border-[#E2E8F0] pb-2">
                  <div className="flex items-center gap-2">
                    <PixelBusinessIcon businessKey={biz.business_key} size={24} />
                    <h4 className="font-pixel text-xs text-[#102040] truncate font-bold">
                      {biz.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-[10px] text-[#334155] font-bold">
                      LVL {biz.level}
                    </span>
                    <PixelLevelPips level={biz.level} />
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-xs text-[#334155]">
                  <span>Initial Cost: ₹{biz.cost}</span>
                  <span className="font-bold text-[#1E40AF]">
                    CV contribution: ₹{biz.cv_contribution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PixelCard>
    </div>
  );
};
