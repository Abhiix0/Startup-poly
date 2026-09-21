import React from 'react';
import { ValueEditor } from './ValueEditor';
import { BusinessList } from './BusinessList';
import { PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';

export interface TeamEditorProps {
  team: AdminRoomSnapshot['teams'][0];
  isTimeExpired: boolean;
  disabled?: boolean;
  onUpdateCash: (newCash: number, note?: string) => Promise<void>;
  onUpdateCv: (newCv: number, note?: string) => Promise<void>;
  onAddBusinessClick: () => void;
  onUpgradeBusinessClick: (bizKey: string) => void;
  onEditBusinessClick: (bizKey: string) => void;
  onRemoveBusinessClick: (bizKey: string) => void;
  onOpenBankruptModal: (mode: 'declare' | 'undo') => void;
}

export const TeamEditor: React.FC<TeamEditorProps> = ({
  team,
  isTimeExpired,
  disabled = false,
  onUpdateCash,
  onUpdateCv,
  onAddBusinessClick,
  onUpgradeBusinessClick,
  onEditBusinessClick,
  onRemoveBusinessClick,
  onOpenBankruptModal,
}) => {
  return (
    <div className="bg-[#FAF8F5] border-4 border-[#102040] shadow-[4px_4px_0px_#102040] flex flex-col overflow-hidden">
      {/* Team Header Banner */}
      <div
        className="p-3 border-b-4 border-[#102040] flex flex-wrap items-center justify-between gap-2"
        style={{
          backgroundColor: '#102040',
          color: '#FFFFFF',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-4 h-4 border-2 border-white flex-shrink-0"
            style={{ backgroundColor: team.color }}
          />
          <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wider truncate">
            SLOT #{team.slot}: {team.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-[#1E293B] text-[#94A3B8] px-2 py-0.5 border border-white/20">
            v{team.version}
          </span>
          {team.is_bankrupt && (
            <span className="bg-[#D32F2F] text-white font-pixel text-[10px] px-2 py-0.5 border border-white">
              BANKRUPT
            </span>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-3 sm:p-4 flex flex-col gap-4">
        {/* Bankrupt banner & Undo button if bankrupt */}
        {team.is_bankrupt ? (
          <div className="bg-[#FEECEB] border-3 border-[#D32F2F] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_#D32F2F]">
            <div>
              <span className="font-pixel text-xs text-[#D32F2F] block">
                TEAM IS CURRENTLY ELIMINATED (BANKRUPT)
              </span>
              <p className="font-mono text-xs text-[#64748B] mt-0.5">
                All business assets were liquidated back to the bank. Regular edits are locked.
              </p>
            </div>

            <PixelButton
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => onOpenBankruptModal('undo')}
            >
              UNDO BANKRUPTCY (CORRECTION)
            </PixelButton>
          </div>
        ) : null}

        {/* Cash & Company Value (CV) Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ValueEditor
            label="Cash Balance"
            currentValue={team.cash}
            onUpdate={onUpdateCash}
            isTimeExpired={isTimeExpired}
            disabled={disabled || team.is_bankrupt}
          />
          <ValueEditor
            label="Company Value (CV)"
            currentValue={team.cv}
            onUpdate={onUpdateCv}
            isTimeExpired={isTimeExpired}
            disabled={disabled || team.is_bankrupt}
          />
        </div>

        {/* Businesses Section */}
        <BusinessList
          team={team}
          onAddClick={onAddBusinessClick}
          onUpgradeClick={onUpgradeBusinessClick}
          onEditClick={onEditBusinessClick}
          onRemoveClick={onRemoveBusinessClick}
          disabled={disabled || team.is_bankrupt}
        />

        {/* Team Status / Danger Zone */}
        {!team.is_bankrupt && (
          <div className="pt-2 border-t-2 border-[#CBD5E1] flex items-center justify-between">
            <span className="font-mono text-xs text-[#64748B]">
              If team physically cannot pay debt after forced sales:
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onOpenBankruptModal('declare')}
              className="
                font-pixel text-xs uppercase px-3 py-2 bg-[#D32F2F] text-white
                border-2 border-[#102040] shadow-[2px_2px_0px_#102040] hover:bg-[#B71C1C]
                active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              MARK BANKRUPT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
