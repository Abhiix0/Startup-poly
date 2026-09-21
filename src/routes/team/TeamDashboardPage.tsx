import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyStateRpc } from '../../data/rpc';
import { PixelCard, PixelButton, BigNumber, StatusPill, ConnectionPill, Countdown, Skeleton } from '../../ui';
import { formatINR } from '../../lib/format';
import type { TeamStateResponse } from '../../data/rpc';

export const TeamDashboardPage: React.FC = () => {
  const [teamState, setTeamState] = useState<TeamStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchState = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyStateRpc();
      setTeamState(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const timer = setInterval(fetchState, 10000);
    return () => clearInterval(timer);
  }, [fetchState]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#5C94FC] flex items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col gap-4">
          <Skeleton height={60} />
          <Skeleton height={140} />
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  if (error || !teamState) {
    return (
      <div className="min-h-screen bg-[#5C94FC] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <PixelCard title="SESSION DISCONNECTED" headerBg="brick">
            <div className="text-center py-4">
              <p className="font-mono text-xs text-[#D32F2F] mb-4">
                {error || 'No active team session found on this device.'}
              </p>
              <div className="flex flex-col gap-2">
                <PixelButton variant="primary" onClick={fetchState} fullWidth>
                  RECONNECT
                </PixelButton>
                <Link to="/join" className="w-full">
                  <PixelButton variant="ghost" fullWidth>
                    ENTER ROOM CODE
                  </PixelButton>
                </Link>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    );
  }

  const { team, room, businesses } = teamState;
  const totalAssets = team.cash + team.cv;

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Mobile Header */}
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] p-3 flex items-center justify-between">
        <div>
          <span className="font-pixel text-xs text-[#FFCC00] block">{team.name}</span>
          <span className="font-mono text-[10px] text-[#94A3B8]">SLOT {team.slot}</span>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionPill status="LIVE" showLabel={false} />
          <StatusPill status={room.status} size="sm" />
        </div>
      </header>

      {/* Main Team Dashboard (Mobile-First 360-430px) */}
      <main className="flex-1 w-full max-w-md mx-auto p-3 sm:p-4 flex flex-col gap-4">
        {/* Live Timer Card */}
        <div className="text-center">
          <Countdown
            endsAt={room.ends_at}
            status={room.status}
            serverNow={room.server_now}
            size="md"
          />
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <BigNumber
            label="CASH"
            value={formatINR(team.cash)}
            variant="green"
            size="sm"
          />
          <BigNumber
            label="COMPANY VALUE"
            value={formatINR(team.cv)}
            variant="navy"
            size="sm"
          />
        </div>

        {/* Total Assets Summary Banner */}
        <div className="bg-[#FFCC00] border-3 border-[#102040] p-3 shadow-[2px_2px_0px_#102040] flex items-center justify-between">
          <span className="font-pixel text-[11px] text-[#102040]">TOTAL ASSETS:</span>
          <span className="font-tabular font-extrabold text-base text-[#102040]">
            {formatINR(totalAssets)}
          </span>
        </div>

        {/* Portfolio / Businesses List */}
        <PixelCard
          title={`PORTFOLIO (${businesses.length}/3)`}
          headerBg="navy"
          padding="sm"
        >
          {businesses.length === 0 ? (
            <div className="py-6 text-center">
              <p className="font-mono text-xs text-[#64748B]">
                No businesses owned yet. Buy up to 3 businesses on the board!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {businesses.map((biz) => (
                <div
                  key={biz.business_key}
                  className="border-2 border-[#102040] bg-white p-2.5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-pixel text-[11px] text-[#102040]">{biz.name}</h4>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      Initial CV: ₹{biz.initial_cv}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-pixel text-[10px] bg-[#102040] text-[#FFCC00] px-2 py-0.5 border border-[#102040]">
                      LVL {biz.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PixelCard>
      </main>

      {/* Brick Ground Base */}
      <div className="h-6 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
