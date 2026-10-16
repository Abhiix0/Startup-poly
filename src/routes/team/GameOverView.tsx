import React from 'react';
import { PixelClockIcon, PixelCoin } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { TeamStateResponse } from '../../data/rpc';
import { Panel, Metric, MAX_BUSINESSES } from './TeamScene';

interface GameOverViewProps {
  state: TeamStateResponse;
}

export const GameOverView: React.FC<GameOverViewProps> = ({ state }) => {
  const { team, businesses } = state;

  return (
    <div className="flex flex-col gap-4">
      <Panel label="Match status" className="flex flex-col items-center text-center gap-3 py-6 sm:py-8">
        <PixelClockIcon size={44} />
        <h1 className="font-pixel text-3xl sm:text-4xl font-extrabold text-brand-navy uppercase">
          Time's up
        </h1>
        <span className="inline-block rounded-md border-2 border-brand-navy bg-status-warning-bg px-3 py-1 font-pixel text-xs font-bold uppercase tracking-wider text-status-warning-text">
          Final scores pending
        </span>
        <p className="font-mono text-sm text-neutral-700 max-w-md leading-relaxed">
          The match clock has run out. The organizer is checking the final board and will publish official
          results. This screen updates on its own, so keep it open.
        </p>
      </Panel>

      <section aria-label="Latest balances" className="grid gap-4 sm:grid-cols-2">
        <Metric
          label="Latest cash"
          value={formatINR(team.cash)}
          valueClass="text-status-success-dark"
          className="bg-white"
          badge={<PixelCoin size={22} />}
        />
        <Metric
          label="Latest company value"
          value={
            <>
              {team.cv.toLocaleString('en-IN')} <span className="text-2xl text-neutral-600">CV</span>
            </>
          }
          valueClass="text-status-info-dark"
          className="bg-white"
        />
      </section>

      <p className="text-center font-mono text-xs text-neutral-700">
        {team.name} · {businesses.length}/{MAX_BUSINESSES} businesses held. Figures are not official until the
        organizer finalizes the match.
      </p>
    </div>
  );
};
