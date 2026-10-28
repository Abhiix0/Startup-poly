import React from 'react';
import { Countdown } from '../../ui';
import { PixelCoin } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { TeamStateResponse } from '../../data/rpc';
import { FlashDirection } from '../../data/useMyTeam';
import { Panel, Metric } from './TeamScene';
import { TeamBusinessList } from './TeamBusinessList';

interface ActiveDashboardViewProps {
  state: TeamStateResponse;
  onExpire: () => void;
  cashFlash: FlashDirection;
}

const flashSurface = (dir: FlashDirection, upClass: string) =>
  dir === 'up'
    ? `${upClass} ring-2`
    : dir === 'down'
    ? 'bg-status-danger-bg border-status-danger-dark ring-status-danger ring-2'
    : 'bg-white';

const FlashBadge: React.FC<{ dir: FlashDirection }> = ({ dir }) =>
  dir ? (
    <span
      className={`font-pixel text-[10px] font-bold px-1.5 py-0.5 rounded border border-brand-navy text-white ${
        dir === 'up' ? 'bg-brand-green' : 'bg-brand-red'
      }`}
    >
      {dir === 'up' ? '▲ UP' : '▼ DOWN'}
    </span>
  ) : null;

export const ActiveDashboardView: React.FC<ActiveDashboardViewProps> = ({
  state,
  onExpire,
  cashFlash,
}) => {
  const { team, room, businesses } = state;

  return (
    <div className="flex flex-col gap-4">
      {team.is_bankrupt && (
        <div
          role="status"
          className="bg-brand-red text-white border-2 border-brand-navy rounded-lg shadow-pixel-sm p-4 text-center"
        >
          <span className="font-pixel text-base font-extrabold tracking-wider block">
            <span aria-hidden="true">☠ </span>ELIMINATED • TEAM IS BANKRUPT<span aria-hidden="true"> ☠</span>
          </span>
          <span className="font-mono text-xs opacity-90 block mt-1">
            Unable to settle board obligations. Financial assets frozen.
          </span>
        </div>
      )}

      {/* Server-backed clock: Countdown owns all timing, do not add another timer here. */}
      <Panel
        label="Match timer"
        className="flex flex-col items-center gap-1 bg-brand-navy! text-white"
      >
        <span className="font-pixel text-[11px] font-bold uppercase tracking-widest text-brand-gold">
          GAME TIME LEFT
        </span>
        <Countdown
          endsAt={room.ends_at}
          status={room.status}
          serverNow={room.server_now}
          onExpire={onExpire}
          size="lg"
          showLabel={false}
        />
      </Panel>

      <section aria-label="Financial summary">
        <Metric
          label="Available cash"
          value={formatINR(team.cash)}
          valueClass="text-status-success-dark"
          className={flashSurface(cashFlash, 'bg-status-success-bg border-status-success-dark ring-status-success')}
          badge={
            <span className="flex items-center gap-1.5">
              <FlashBadge dir={cashFlash} />
              <PixelCoin size={22} />
            </span>
          }
        />
      </section>

      {team.debt > 0 && (
        <section aria-label="Debt recovery">
          <Metric
            label="Outstanding debt"
            value={formatINR(team.debt)}
            valueClass="text-status-danger-dark"
            className="bg-status-danger-bg border-brand-red"
            badge={<span aria-hidden="true">⚠</span>}
          />
          <p className="mt-2 text-center font-mono text-xs font-bold text-status-danger-dark">
            Debt Recovery: all incoming cash pays the debt first. You cannot buy or upgrade until it is cleared, and a team
            still in debt when time ends cannot win.
          </p>
        </section>
      )}

      <TeamBusinessList
        businesses={businesses}
        emptyText="Your portfolio is empty. Businesses you acquire on the physical board will appear here."
      />

      <p className="text-center font-mono text-xs text-neutral-700">
        Game progress is managed by the organizer. This screen is read-only.
      </p>
    </div>
  );
};
