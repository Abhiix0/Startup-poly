import React, { useState, useEffect, useRef } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { OFFICIAL_BUSINESSES, upgradeCost, upgradeCvGain } from '../../../domain/economy';
import { Level } from '../../../domain/types';

export interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessKey: string | null;
  team: AdminRoomSnapshot['teams'][0];
  onSubmit: (params: {
    businessKey: string;
    newLevel: number;
    applyUpgrade: boolean;
    note?: string;
  }) => Promise<void>;
  isTimeExpired: boolean;
}

export const UpgradeDialog: React.FC<UpgradeDialogProps> = ({
  isOpen,
  onClose,
  businessKey,
  team,
  onSubmit,
  isTimeExpired,
}) => {
  const [applyUpgrade, setApplyUpgrade] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const noteRef = useRef<HTMLInputElement>(null);

  const ownedBiz = team.businesses.find((b) => b.business_key === businessKey);
  const catalogBiz = businessKey
    ? OFFICIAL_BUSINESSES.find((b) => b.key === businessKey)
    : null;

  const currentLevel = (ownedBiz?.level ?? 0) as Level;
  const nextLevel = Math.min(2, currentLevel + 1);
  const cost = catalogBiz ? upgradeCost(catalogBiz, currentLevel) : 0;
  const cvGain = catalogBiz ? upgradeCvGain(catalogBiz, currentLevel) : 0;

  useEffect(() => {
    if (isOpen) {
      setApplyUpgrade(true);
      setNote('');
      setError(null);
      setIsSubmitting(false);
      if (isTimeExpired) {
        setTimeout(() => noteRef.current?.focus(), 50);
      }
    }
  }, [isOpen, isTimeExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessKey) return;
    if (isTimeExpired && !note.trim()) {
      setError('Note is required for post-game corrections.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        businessKey,
        newLevel: nextLevel,
        applyUpgrade,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to upgrade business.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ownedBiz || !catalogBiz) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`UPGRADE ${catalogBiz.name.toUpperCase()}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Transition Summary Box */}
        <div className="bg-[#FAF8F5] border-2 border-[#102040] p-3 shadow-[2px_2px_0px_#102040] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-pixel text-xs text-[#102040]">{catalogBiz.name}</span>
            <span className="font-mono text-xs text-[#64748B]">
              Level {currentLevel} → <strong className="text-[#22B14C]">Level {nextLevel}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-[#FEECEB] text-[#D32F2F] px-2 py-1 border border-[#D32F2F] font-bold">
              −₹{cost.toLocaleString('en-IN')}
            </span>
            <span className="bg-[#E8F8EE] text-[#22B14C] px-2 py-1 border border-[#22B14C] font-bold">
              +₹{cvGain.toLocaleString('en-IN')} CV
            </span>
          </div>
        </div>

        {/* Apply Upgrade Checkbox */}
        <div className="bg-white border-2 border-[#102040] p-3 flex flex-col gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyUpgrade}
              onChange={(e) => setApplyUpgrade(e.target.checked)}
              className="w-4 h-4 accent-[#22B14C] cursor-pointer"
            />
            <span className="font-sans text-xs font-bold text-[#102040]">
              Apply standard financial transaction
            </span>
          </label>
          <p className="font-mono text-[11px] text-[#64748B] pl-6">
            {applyUpgrade
              ? `Deducts ₹${cost} from cash and adds ₹${cvGain} to company value.`
              : 'Does not modify team cash or CV.'}
          </p>
        </div>

        {/* Post-match Note Requirement */}
        {isTimeExpired && (
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] uppercase text-[#D32F2F] font-bold">
              ⚠ NOTE REQUIRED (GAME OVER UPGRADE)
            </label>
            <input
              ref={noteRef}
              type="text"
              required
              placeholder="e.g., Upgrade completed physically during play"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="
                w-full px-2.5 py-1.5 font-sans text-xs text-[#102040] bg-white border-2 border-[#102040]
                focus:outline-none focus:ring-2 focus:ring-[#D32F2F]
              "
            />
          </div>
        )}

        {error && (
          <span className="font-mono text-xs text-[#D32F2F] font-bold">
            ⚠ {error}
          </span>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#102040]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              font-pixel text-xs uppercase px-3 py-1.5 bg-white text-[#102040]
              border-2 border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#EAE5D9]
              cursor-pointer active:translate-y-0.5 disabled:opacity-50
            "
          >
            CANCEL
          </button>
          <PixelButton
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || (isTimeExpired && !note.trim())}
            isLoading={isSubmitting}
          >
            CONFIRM UPGRADE
          </PixelButton>
        </div>
      </form>
    </Modal>
  );
};
