import React from 'react';
import { PixelCoin, PixelMushroom } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { TeamStateResponse } from '../../data/rpc';
import { Panel, Metric } from './TeamScene';

interface LobbyWaitViewProps {
  state: TeamStateResponse;
}

export const LobbyWaitView: React.FC<LobbyWaitViewProps> = ({ state }) => {
  const { team } = state;

  return (
    <div className="flex flex-col gap-4">
      {/* Central Waiting Room Status Card */}
      <Panel label="Match Lobby" className="flex flex-col items-center text-center gap-3 py-6 sm:py-8">
        <div className="relative">
          <PixelMushroom size={56} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success-base opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success-base" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 font-pixel text-[11px] font-bold uppercase tracking-widest text-brand-navy bg-brand-gold border-2 border-brand-navy px-3 py-1 shadow-[2px_2px_0px_var(--color-brand-navy)]">
          <span>⏳</span>
          <span>LOBBY STAGE · MATCH NOT STARTED</span>
        </div>

        <h1 className="font-pixel text-2xl sm:text-3xl font-extrabold text-brand-navy uppercase tracking-tight">
          Connected & Waiting for Host
        </h1>

        <p className="font-mono text-sm text-neutral-700 max-w-md leading-relaxed">
          Your device is securely connected to <strong>Slot #{team.slot} ({team.name})</strong>.
          The 50-minute tournament clock is stopped and will begin when the organizer starts the match.
        </p>

        <div className="inline-flex items-center gap-2 rounded-md border-2 border-brand-navy bg-neutral-50 px-4 py-2 mt-1 shadow-pixel-sm">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-sm border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]"
            style={{ backgroundColor: team.color }}
          />
          <span className="font-pixel text-sm font-bold text-brand-navy">
            Slot #{team.slot} · {team.name}
          </span>
        </div>
      </Panel>

      {/* Starting Allocation Preview */}
      <div className="border-2 border-brand-navy bg-brand-white p-3 shadow-pixel-sm">
        <h2 className="font-pixel text-[11px] font-bold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>💼</span>
          <span>Starting Allocation (Unlocks on Match Start)</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric
            label="Initial Cash"
            value={formatINR(team.cash)}
            valueClass="text-status-success-dark font-extrabold"
            className="bg-neutral-50"
            badge={<PixelCoin size={22} />}
          />
          <Metric
            label="Initial Company Value"
            value={
              <>
                {team.cv.toLocaleString('en-IN')} <span className="text-xl text-neutral-600 font-bold">CV</span>
              </>
            }
            valueClass="text-status-info-dark font-extrabold"
            className="bg-neutral-50"
          />
        </div>
      </div>
    </div>
  );
};
