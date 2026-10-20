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
  const totalValuation = team.cash + team.cv;

  return (
    <div className="bg-brand-white border-4 border-brand-navy shadow-pixel flex flex-col overflow-hidden w-full">
      {/* Team Header Banner with Arcade Accent */}
      <div className="p-3 sm:p-3.5 border-b-4 border-brand-navy flex flex-wrap items-center justify-between gap-3 bg-brand-navy text-brand-white">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-5 h-5 border-2 border-white flex-shrink-0 shadow-pixel-sm"
            style={{ backgroundColor: team.color }}
          />
          <h2 className="font-pixel text-xs sm:text-base uppercase tracking-wider truncate font-black text-brand-white">
            SLOT #{team.slot}: {team.name}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="font-pixel text-xs sm:text-sm bg-brand-gold text-brand-navy px-2.5 py-1 border-2 border-brand-navy shadow-pixel-sm font-black flex items-center gap-1.5">
            <span className="text-xs">🏆</span>
            <span>TOTAL: ₹{totalValuation.toLocaleString('en-IN')}</span>
          </div>

          <span
            title={team.claimed ? 'Team phone connected live' : 'Waiting for team device to claim'}
            className="font-pixel text-[10px] text-brand-navy bg-brand-white px-2 py-1 border-2 border-brand-navy shadow-pixel-sm flex items-center gap-1.5 font-bold"
          >
            <span
              className={`w-2 h-2 rounded-full border border-brand-navy ${
                team.claimed ? 'bg-brand-green animate-pulse' : 'bg-neutral-400'
              }`}
            />
            {team.claimed ? 'CLAIMED' : 'UNCLAIMED'}
          </span>

          <span className="font-mono text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 border border-white/20">
            v{team.version}
          </span>

          {team.is_bankrupt && (
            <span className="bg-brand-red text-brand-white font-pixel text-[10px] px-2 py-1 border-2 border-white shadow-pixel-sm font-bold">
              ☠ BANKRUPT
            </span>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-3 sm:p-4 flex flex-col gap-4">
        {/* Bankrupt banner & Undo button if bankrupt */}
        {team.is_bankrupt ? (
          <div className="bg-status-danger-bg border-3 border-brand-red p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-pixel-sm">
            <div>
              <span className="font-pixel text-xs text-brand-red block">
                TEAM IS CURRENTLY ELIMINATED (BANKRUPT)
              </span>
              <p className="font-mono text-xs text-neutral-500 mt-0.5">
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
            teamName={team.name}
            currentValue={team.cash}
            onUpdate={onUpdateCash}
            isTimeExpired={isTimeExpired}
            disabled={disabled || team.is_bankrupt}
          />
          <ValueEditor
            label="Company Value (CV)"
            teamName={team.name}
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
          <div className="pt-3 border-t-2 border-neutral-300 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs text-neutral-500">
              If team physically cannot pay debt after forced sales:
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onOpenBankruptModal('declare')}
              className="
                font-pixel text-xs uppercase px-3 py-2 bg-brand-red text-brand-white
                border-2 border-brand-navy shadow-pixel-sm hover:bg-interactive-red-hover
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
