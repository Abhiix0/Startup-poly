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
    <div className="bg-white border-3 border-[#102040] p-3 shadow-[2px_2px_0px_#102040] flex flex-col gap-3">
      {/* Header with count and Add Business trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-pixel text-[11px] uppercase tracking-wider text-[#102040]">
            BUSINESSES ({team.businesses.length}/3)
          </h3>
          {isCapReached && (
            <span className="font-mono text-[10px] text-[#D32F2F] font-bold">
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
        <div className="py-4 text-center bg-[#FAF8F5] border-2 border-dashed border-[#CBD5E1]">
          <p className="font-mono text-xs text-[#64748B]">
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
                  bg-[#FAF8F5] border-2 border-[#102040] p-2.5 shadow-[1px_1px_0px_#102040]
                  flex flex-wrap items-center justify-between gap-2.5
                "
              >
                {/* Left info: Name, Level pips, CV contribution */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs text-[#102040]">
                      {tb.name}
                    </span>
                    <PixelLevelPips level={level} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#64748B]">
                    <span>Cost: ₹{tb.cost}</span>
                    <span>•</span>
                    <span className="text-[#102040] font-bold">
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
                        font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#22B14C] text-white
                        border-2 border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#1C8D3D]
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
                      font-pixel text-[10px] uppercase px-2 py-1.5 bg-[#EAE5D9] text-[#102040]
                      border-2 border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#FFCC00]
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
                      font-pixel text-[10px] uppercase px-2 py-1.5 bg-[#FAF8F5] text-[#D32F2F]
                      border-2 border-[#D32F2F] shadow-[1px_1px_0px_#102040] hover:bg-[#FEECEB]
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
