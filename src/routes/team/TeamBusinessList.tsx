import React from 'react';
import { PixelBusinessIcon, PixelLevelPips } from '../../ui/pixel';
import { formatINR } from '../../lib/format';
import { TeamStateResponse } from '../../data/rpc';
import { Panel, Eyebrow, MAX_BUSINESSES } from './TeamScene';

interface TeamBusinessListProps {
  businesses: TeamStateResponse['businesses'];
  emptyText: string;
}

export const TeamBusinessList: React.FC<TeamBusinessListProps> = ({ businesses, emptyText }) => (
  <Panel label="Business portfolio">
    <div className="flex items-baseline justify-between gap-2 mb-3">
      <h2 className="font-pixel text-base font-extrabold uppercase tracking-wide text-brand-navy">
        Portfolio
      </h2>
      <Eyebrow>
        {businesses.length}/{MAX_BUSINESSES} businesses
      </Eyebrow>
    </div>

    {businesses.length === 0 ? (
      <p className="rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center font-mono text-sm text-neutral-600">
        <strong className="block font-pixel text-brand-navy uppercase tracking-wide mb-1">
          No businesses yet
        </strong>
        {emptyText}
      </p>
    ) : (
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((biz) => (
          <li
            key={biz.business_key}
            className="rounded-md border-2 border-neutral-300 bg-neutral-50 p-3 flex flex-col gap-2 min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <PixelBusinessIcon businessKey={biz.business_key} size={28} />
              <h3 className="font-pixel text-sm font-bold text-brand-navy truncate">{biz.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[11px] font-bold uppercase text-neutral-700">
                {biz.level === 0 ? 'Base' : `Upgrade ${biz.level}`}
              </span>
              <PixelLevelPips level={biz.level} />
            </div>
            <dl className="font-mono text-xs text-neutral-600 flex flex-col gap-0.5">
              <div className="flex justify-between gap-2">
                <dt>Initial cost</dt>
                <dd className="font-bold text-brand-navy tabular-nums">{formatINR(biz.cost)}</dd>
              </div>
              <div className="flex justify-between gap-2 border-t border-neutral-200 pt-1 mt-1">
                <dt className="text-brand-green font-bold">Rent visitors pay</dt>
                <dd className="font-bold text-brand-green tabular-nums">
                  {formatINR(biz.level === 0 ? Math.round(biz.cost * 0.5) : biz.level === 1 ? Math.round(biz.cost * 0.75) : biz.cost)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    )}
  </Panel>
);
