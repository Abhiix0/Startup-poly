import React from 'react';
import { PixelCard, StatusPill, Countdown, BigNumber } from '../../ui';
import { formatINR } from '../../lib/format';
import { AdminRoomSnapshot } from '../../data/rpc';

interface ActiveSummaryViewProps {
  snapshot: AdminRoomSnapshot;
}

export const ActiveSummaryView: React.FC<ActiveSummaryViewProps> = ({ snapshot }) => {
  const { room, teams, server_now } = snapshot;

  const totalBoardCash = teams.reduce((acc, t) => acc + t.cash, 0);
  const totalBoardCv = teams.reduce((acc, t) => acc + t.cv, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Match Clock & Overview Card */}
      <PixelCard title={`MATCH IN PROGRESS • ROOM ${room.code}`} headerBg="navy" padding="lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b-3 border-[#102040]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusPill status={room.status} pulse={room.status === 'ACTIVE'} />
              <span className="font-pixel text-xs text-[#102040]">
                {room.team_count} TEAMS
              </span>
            </div>
            <h2 className="font-pixel text-base uppercase text-[#102040]">
              LIVE MATCH OVERVIEW
            </h2>
            <p className="font-mono text-xs text-[#64748B]">
              Phase 7 adds live board recording controls (cash edits, acquisitions, upgrades, forced sales).
            </p>
          </div>

          <div className="flex-shrink-0 text-center">
            <Countdown
              endsAt={room.ends_at}
              status={room.status}
              serverNow={server_now}
              size="lg"
            />
          </div>
        </div>

        {/* Global Economy Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6">
          <BigNumber
            label="TOTAL CASH"
            value={formatINR(totalBoardCash)}
            variant="green"
            size="sm"
          />
          <BigNumber
            label="TOTAL CV"
            value={formatINR(totalBoardCv)}
            variant="navy"
            size="sm"
          />
          <BigNumber
            label="TOTAL ASSETS"
            value={formatINR(totalBoardCash + totalBoardCv)}
            variant="gold"
            size="sm"
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </PixelCard>

      {/* Teams Standings Table Card */}
      <PixelCard title="TEAM STANDINGS & FINANCIAL METRICS" headerBg="brick" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#102040] text-white font-pixel text-[10px] uppercase border-b-3 border-[#102040]">
                <th className="p-3">SLOT</th>
                <th className="p-3">TEAM NAME</th>
                <th className="p-3 text-right">CASH</th>
                <th className="p-3 text-right">COMPANY VALUE</th>
                <th className="p-3 text-right">TOTAL</th>
                <th className="p-3 text-center">PORTFOLIO</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#102040] bg-white">
              {teams.map((t) => {
                const total = t.cash + t.cv;
                return (
                  <tr key={t.id} className="hover:bg-[#FFFBEB] transition-colors">
                    <td className="p-3 font-pixel text-xs text-[#102040]">
                      #{t.slot}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 border border-[#102040] shadow-[1px_1px_0px_#102040]"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="font-pixel text-xs text-[#102040]">
                          {t.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-tabular font-bold text-[#22B14C]">
                      {formatINR(t.cash)}
                    </td>
                    <td className="p-3 text-right font-tabular font-bold text-[#1E40AF]">
                      {formatINR(t.cv)}
                    </td>
                    <td className="p-3 text-right font-tabular font-extrabold text-[#102040]">
                      {formatINR(total)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-mono bg-[#FAF8F5] px-2 py-0.5 border border-[#102040] text-[11px]">
                        {t.businesses.length}/3
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {t.is_bankrupt ? (
                        <span className="font-pixel text-[9px] bg-[#D32F2F] text-white px-2 py-0.5 border border-[#102040]">
                          BANKRUPT
                        </span>
                      ) : (
                        <span className="font-pixel text-[9px] bg-[#22B14C] text-white px-2 py-0.5 border border-[#102040]">
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
      </PixelCard>
    </div>
  );
};
