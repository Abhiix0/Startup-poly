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
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b-3 border-brand-navy">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusPill status={room.status} pulse={room.status === 'ACTIVE'} />
              <span className="font-pixel text-xs text-brand-navy">
                {room.team_count} TEAMS
              </span>
            </div>
            <h2 className="font-pixel text-base uppercase text-brand-navy">
              LIVE MATCH OVERVIEW
            </h2>
            <p className="font-mono text-xs text-neutral-500">
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
              <tr className="bg-brand-navy text-brand-white font-pixel text-[10px] uppercase border-b-3 border-brand-navy">
                <th className="p-3">SLOT</th>
                <th className="p-3">TEAM NAME</th>
                <th className="p-3 text-right">CASH</th>
                <th className="p-3 text-right">COMPANY VALUE</th>
                <th className="p-3 text-right">TOTAL</th>
                <th className="p-3 text-center">PORTFOLIO</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-brand-navy bg-brand-white">
              {teams.map((t) => {
                const total = t.cash + t.cv;
                return (
                  <tr key={t.id} className="hover:bg-brand-cream-light transition-colors">
                    <td className="p-3 font-pixel text-xs text-brand-navy">
                      #{t.slot}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 border border-brand-navy shadow-pixel-sm"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="font-pixel text-xs text-brand-navy">
                          {t.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-tabular font-bold text-brand-green">
                      {formatINR(t.cash)}
                    </td>
                    <td className="p-3 text-right font-tabular font-bold text-brand-navy">
                      {formatINR(t.cv)}
                    </td>
                    <td className="p-3 text-right font-tabular font-extrabold text-brand-navy">
                      {formatINR(total)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-mono bg-brand-cream px-2 py-0.5 border border-brand-navy text-[11px]">
                        {t.businesses.length}/3
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {t.is_bankrupt ? (
                        <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-2 py-0.5 border border-brand-navy">
                          BANKRUPT
                        </span>
                      ) : (
                        <span className="font-pixel text-[9px] bg-brand-green text-brand-white px-2 py-0.5 border border-brand-navy">
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
