import React from 'react';
import { Link } from 'react-router-dom';
import { TeamStateResponse } from '../../data/rpc';
import { PixelCoin, PixelTrophy } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { Panel, Eyebrow, Metric, MAX_BUSINESSES } from './TeamScene';
import { TeamBusinessList } from './TeamBusinessList';

export interface FinalBoardViewProps {
  state: TeamStateResponse;
}

const ordinal = (n: number) => {
  const v = n % 100;
  const suffix = ['th', 'st', 'nd', 'rd'][(v - 20) % 10] ?? ['th', 'st', 'nd', 'rd'][v] ?? 'th';
  return `${n}${suffix}`;
};

// Only the team's own get_my_state.final_result is shown; other teams' standings are admin-only.
export const FinalBoardView: React.FC<FinalBoardViewProps> = ({ state }) => {
  const { team, businesses, final_result } = state;

  const rank = final_result?.rank ?? null;
  const isWinner = rank === 1;
  const finalCash = final_result?.cash ?? team.cash;
  const isBankrupt = final_result?.is_bankrupt ?? team.is_bankrupt;
  const businessCount = final_result?.business_count ?? businesses.length;
  const upgradeCount = businesses.reduce((sum, b) => sum + b.level, 0);

  const heading = isWinner ? 'STARTUPOLY CHAMPION' : rank !== null ? `${ordinal(rank)} PLACE` : 'MATCH COMPLETE';

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Panel
        label="Final result"
        className={`flex flex-col items-center text-center gap-2 py-6 sm:py-8 ${
          isWinner ? 'bg-brand-gold!' : ''
        }`}
      >
        <span className="rounded border border-brand-navy bg-white px-2 py-0.5 font-pixel text-[11px] font-bold uppercase tracking-widest text-brand-navy">
          OFFICIAL FINAL RESULT
        </span>
        <PixelTrophy size={isWinner ? 64 : 48} />
        <p className="font-pixel text-xs font-bold uppercase tracking-widest text-neutral-700">
          Match complete
        </p>
        <h1 className="font-pixel text-3xl sm:text-4xl font-extrabold text-brand-navy uppercase">
          {heading}
        </h1>
        {rank !== null && (
          <span className="inline-flex items-center gap-2 rounded-md bg-brand-navy px-3 py-1 font-pixel text-sm font-bold text-brand-gold">
            RANK #{rank}
          </span>
        )}
        <div className="mt-1 inline-flex items-center gap-2 rounded-md border-2 border-brand-navy bg-white px-3 py-1.5">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-sm border border-brand-navy"
            style={{ backgroundColor: team.color }}
          />
          <span className="font-pixel text-sm font-bold text-brand-navy">
            {team.name} · Slot #{team.slot}
          </span>
          <span className="rounded border border-brand-navy bg-brand-green px-1.5 py-0.5 font-pixel text-[10px] font-bold uppercase text-white">
            YOU
          </span>
        </div>
      </Panel>

      <section aria-label="Your final cash">
        <Metric
          label="Final cash"
          value={formatINR(finalCash)}
          valueClass="text-status-success-dark"
          className="bg-white"
          badge={<PixelCoin size={22} />}
        />
      </section>

      <Panel label="Match summary" className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <Eyebrow>Businesses held</Eyebrow>
          <span className="font-tabular text-xl font-black text-brand-navy tabular-nums">
            {businessCount}/{MAX_BUSINESSES}
          </span>
        </div>
        <div className="flex flex-col">
          <Eyebrow>Upgrades</Eyebrow>
          <span className="font-tabular text-xl font-black text-brand-navy tabular-nums">{upgradeCount}</span>
        </div>
        <span
          className={`rounded border-2 border-brand-navy px-2 py-1 font-pixel text-xs font-bold uppercase text-white ${
            isBankrupt ? 'bg-brand-red' : 'bg-brand-green'
          }`}
        >
          {isBankrupt ? 'Bankrupt' : 'Solvent'}
        </span>
      </Panel>

      <TeamBusinessList
        businesses={businesses}
        emptyText="No businesses were held at the end of the match."
      />

      <p className="text-center font-mono text-xs text-neutral-700">
        Team results are private to your device. Full standings are shown on the organizer's console.
      </p>

      <Link
        to="/"
        className="self-center inline-flex items-center justify-center font-pixel text-xs uppercase bg-brand-navy text-brand-gold border-2 border-brand-navy px-5 py-3 shadow-pixel-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
      >
        ← BACK TO HOME
      </Link>
    </div>
  );
};
