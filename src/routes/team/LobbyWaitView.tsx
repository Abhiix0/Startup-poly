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
      <Panel label="Lobby status" className="flex flex-col items-center text-center gap-3 py-6 sm:py-8">
        <PixelMushroom size={56} />
        <span className="font-pixel text-[11px] font-bold uppercase tracking-widest text-status-success-dark">
          Team joined
        </span>
        <h1 className="font-pixel text-2xl sm:text-3xl font-extrabold text-brand-navy uppercase">
          Waiting for the match to start
        </h1>
        <p className="font-mono text-sm text-neutral-700 max-w-md leading-relaxed">
          You're in. The match has not started yet. Keep this screen open: the game clock and your live
          financials appear here automatically when the organizer launches the game.
        </p>
        <div className="inline-flex items-center gap-2 rounded-md border-2 border-brand-navy bg-neutral-50 px-3 py-1.5">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-sm border border-brand-navy"
            style={{ backgroundColor: team.color }}
          />
          <span className="font-pixel text-sm font-bold text-brand-navy">
            Slot #{team.slot} · {team.name}
          </span>
        </div>
      </Panel>

      <section aria-label="Starting resources" className="grid gap-4 sm:grid-cols-2">
        <Metric
          label="Starting cash"
          value={formatINR(team.cash)}
          valueClass="text-status-success-dark"
          className="bg-white"
          badge={<PixelCoin size={22} />}
        />
        <Metric
          label="Starting company value"
          value={
            <>
              {team.cv.toLocaleString('en-IN')} <span className="text-2xl text-neutral-600">CV</span>
            </>
          }
          valueClass="text-status-info-dark"
          className="bg-white"
        />
      </section>
    </div>
  );
};
