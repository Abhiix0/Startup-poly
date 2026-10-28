import React from 'react';
import { PixelLevelPips } from '../../../ui/pixel';
import { PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { OFFICIAL_BUSINESSES, upgradeCost } from '../../../domain/economy';
import { Level } from '../../../domain/types';
import { MAX_BUSINESSES_PER_TEAM } from '../../../domain/economy';

export interface BusinessListProps {
  team: AdminRoomSnapshot['teams'][0];
  onAddClick: () => void;
  onUpgradeClick: (businessKey: string) => void;
  onEditClick: (businessKey: string) => void;
  onRemoveClick: (businessKey: string) => void;
  disabled?: boolean;
}

export const BusinessList: React.FC<BusinessListProps> = ({
  team,
  onAddClick,
  onUpgradeClick,
  onEditClick,
  onRemoveClick,
  disabled = false,
}) => {
  const isCapReached = team.businesses.length >= 3;

  return (
    <div className="bg-brand-white border-3 sm:border-4 border-brand-navy p-3.5 sm:p-4 shadow-pixel flex flex-col gap-3.5">
      {/* Header with count and Add Business trigger */}
      <div className="flex items-center justify-between border-b-2 border-brand-navy/15 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">🏢</span>
          <h3 className="font-pixel text-xs sm:text-sm uppercase tracking-wider text-brand-navy font-black">
            BUSINESSES ({team.businesses.length}/{MAX_BUSINESSES_PER_TEAM})
          </h3>
          {isCapReached && (
            <span className="font-pixel text-[9px] bg-brand-red text-brand-white px-2 py-0.5 border border-brand-navy font-bold shadow-pixel-sm">
              CAP REACHED ({MAX_BUSINESSES_PER_TEAM}/{MAX_BUSINESSES_PER_TEAM})
            </span>
          )}
        </div>

        <PixelButton
          variant="secondary"
          size="sm"
          disabled={disabled || isCapReached}
          onClick={onAddClick}
        >
          + ADD BUSINESS
        </PixelButton>
      </div>

      {/* List of Owned Businesses */}
      {team.businesses.length === 0 ? (
        <div className="py-6 px-4 text-center bg-brand-cream/60 border-2 border-dashed border-brand-navy/30 flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🏢</span>
          <p className="font-pixel text-xs text-brand-navy font-bold uppercase tracking-wider">
            Team owns no businesses yet.
          </p>
          <p className="font-mono text-xs text-neutral-500 max-w-sm">
            Acquire SaaS, FinTech, EdTech, AI, or CleanTech when team lands on an unowned tile.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {team.businesses.map((tb) => {
            const catalogBiz = OFFICIAL_BUSINESSES.find((b) => b.key === tb.business_key);
            const level = (tb.level ?? 0) as Level;
            const canUpgrade = level < 2;
            const nextCost = catalogBiz && canUpgrade ? upgradeCost(catalogBiz, level) : 0;

            return (
              <div
                key={tb.business_key}
                className="
                  bg-brand-cream border-2 border-brand-navy p-3 shadow-pixel-sm
                  flex flex-wrap items-center justify-between gap-3 hover:-translate-y-0.5 transition-transform
                "
              >
                {/* Left info: Name, Level pips */}
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs sm:text-sm text-brand-navy font-black">
                      {tb.name}
                    </span>
                    <span className="font-pixel text-[9px] bg-brand-navy text-brand-gold px-1.5 py-0.5 border border-brand-navy font-bold">
                      L{level}
                    </span>
                    <PixelLevelPips level={level} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-600">
                    <span>Cost: ₹{tb.cost}</span>
                  </div>
                </div>

                {/* Right actions: Upgrade / Edit / Remove */}
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  {canUpgrade && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onUpgradeClick(tb.business_key)}
                      title={`Upgrade to Level ${level + 1} (−₹${nextCost})`}
                      className="
                        font-pixel text-[10px] uppercase px-3 py-1.5 bg-brand-green text-brand-white font-bold
                        border-2 border-brand-navy shadow-pixel-sm hover:bg-interactive-green-hover
                        active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all
                      "
                    >
                      UPGRADE → L{level + 1} (−₹{nextCost})
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onEditClick(tb.business_key)}
                    title="Manual level change (correction with note)"
                    className="
                      font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-neutral-200 text-brand-navy font-bold
                      border-2 border-brand-navy shadow-pixel-sm hover:bg-brand-gold
                      active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all
                    "
                  >
                    EDIT
                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemoveClick(tb.business_key)}
                    title="Forced sale or correction"
                    className="
                      font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-cream text-brand-red font-bold
                      border-2 border-brand-red shadow-pixel-sm hover:bg-status-danger-bg
                      active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all
                    "
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
