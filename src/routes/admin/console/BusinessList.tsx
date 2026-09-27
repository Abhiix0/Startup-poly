import React from 'react';
import { PixelLevelPips } from '../../../ui/pixel';
import { PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { OFFICIAL_BUSINESSES, cvContribution, upgradeCost, upgradeCvGain } from '../../../domain/economy';
import { Level } from '../../../domain/types';

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
    <div className="bg-white border-3 border-brand-navy p-3 shadow-pixel-sm flex flex-col gap-3">
      {/* Header with count and Add Business trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-pixel text-[11px] uppercase tracking-wider text-brand-navy">
            BUSINESSES ({team.businesses.length}/3)
          </h3>
          {isCapReached && (
            <span className="font-mono text-[10px] text-brand-red font-bold">
              [CAP REACHED]
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
        <div className="py-4 text-center bg-brand-cream border-2 border-dashed border-neutral-300">
          <p className="font-mono text-xs text-neutral-500">
            Team owns no businesses yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {team.businesses.map((tb) => {
            const catalogBiz = OFFICIAL_BUSINESSES.find((b) => b.key === tb.business_key);
            const level = (tb.level ?? 0) as Level;
            const currentCv = catalogBiz ? cvContribution(catalogBiz, level) : tb.initial_cv;
            const canUpgrade = level < 2;
            const nextCost = catalogBiz && canUpgrade ? upgradeCost(catalogBiz, level) : 0;
            const nextCvGain = catalogBiz && canUpgrade ? upgradeCvGain(catalogBiz, level) : 0;

            return (
              <div
                key={tb.business_key}
                className="
                  bg-brand-cream border-2 border-brand-navy p-2.5 shadow-pixel-sm
                  flex flex-wrap items-center justify-between gap-2.5
                "
              >
                {/* Left info: Name, Level pips, CV contribution */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs text-brand-navy">
                      {tb.name}
                    </span>
                    <PixelLevelPips level={level} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                    <span>Cost: ₹{tb.cost}</span>
                    <span>•</span>
                    <span className="text-brand-navy font-bold">
                      CV contribution: ₹{currentCv.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Right actions: Upgrade / Edit / Remove */}
                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                  {canUpgrade && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onUpgradeClick(tb.business_key)}
                      title={`Upgrade to Level ${level + 1} (−₹${nextCost}, +₹${nextCvGain} CV)`}
                      className="
                        font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-green text-brand-white
                        border-2 border-brand-navy shadow-pixel-sm hover:bg-interactive-green-hover
                        active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      UPGRADE → L{level + 1} (−₹{nextCost}/+{nextCvGain}CV)
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onEditClick(tb.business_key)}
                    title="Manual level change (correction with note)"
                    className="
                      font-pixel text-[10px] uppercase px-2 py-1.5 bg-neutral-200 text-brand-navy
                      border-2 border-brand-navy shadow-pixel-sm hover:bg-brand-gold
                      active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
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
                      font-pixel text-[10px] uppercase px-2 py-1.5 bg-brand-cream text-brand-red
                      border-2 border-brand-red shadow-pixel-sm hover:bg-status-danger-bg
                      active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
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
