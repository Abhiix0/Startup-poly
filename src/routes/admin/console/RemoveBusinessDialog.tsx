import React, { useState, useEffect, useRef } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { OFFICIAL_BUSINESSES } from '../../../domain/economy';

export interface RemoveBusinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessKey: string | null;
  team: AdminRoomSnapshot['teams'][0];
  onSubmit: (params: {
    businessKey: string;
    reason: 'FORCED_SALE' | 'CORRECTION';
    creditResale: boolean;
    note?: string;
  }) => Promise<void>;
  isTimeExpired: boolean;
}

export const RemoveBusinessDialog: React.FC<RemoveBusinessDialogProps> = ({
  isOpen,
  onClose,
  businessKey,
  team,
  onSubmit,
  isTimeExpired,
}) => {
  const ownedBiz = team.businesses.find((b) => b.business_key === businessKey);
  const catalogBiz = businessKey
    ? OFFICIAL_BUSINESSES.find((b) => b.key === businessKey)
    : null;

  const [reason, setReason] = useState<'FORCED_SALE' | 'CORRECTION'>('FORCED_SALE');
  const [creditResale, setCreditResale] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('FORCED_SALE');
      setCreditResale(true);
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
    if (reason === 'CORRECTION' && !note.trim()) {
      setError('A note explaining why this business is removed as a correction is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        businessKey,
        reason,
        creditResale: reason === 'FORCED_SALE' ? creditResale : false,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove business.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ownedBiz || !catalogBiz) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`REMOVE ${catalogBiz.name.toUpperCase()}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Business summary */}
        <div className="bg-[#FAF8F5] border-2 border-[#102040] p-3 flex items-center justify-between">
          <div>
            <span className="font-pixel text-xs text-[#102040]">{catalogBiz.name}</span>
            <span className="font-mono text-xs text-[#64748B] block">
              Current Level: {ownedBiz.level} • Base cost: ₹{catalogBiz.cost}
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-[#D32F2F] bg-[#FEECEB] px-2 py-1 border border-[#D32F2F]">
            Removal
          </span>
        </div>

        {/* Reason choice: Forced sale vs Correction */}
        <div className="flex flex-col gap-2">
          <label className="font-pixel text-[11px] uppercase tracking-wider text-[#102040]">
            Removal Reason
          </label>

          <div className="flex flex-col gap-2">
            <label
              className={`
                p-3 border-2 flex items-start gap-2.5 cursor-pointer transition-all
                ${
                  reason === 'FORCED_SALE'
                    ? 'bg-[#FFFBEB] border-[#102040] shadow-[2px_2px_0px_#102040]'
                    : 'bg-white border-[#CBD5E1] hover:bg-[#FAF8F5]'
                }
              `}
            >
              <input
                type="radio"
                name="remove_reason"
                value="FORCED_SALE"
                checked={reason === 'FORCED_SALE'}
                onChange={() => setReason('FORCED_SALE')}
                className="mt-0.5 accent-[#102040]"
              />
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold text-[#102040]">
                  Forced Sale (Rulebook debt relief)
                </span>
                <span className="font-mono text-[11px] text-[#64748B]">
                  Team surrendered business back to the bank to pay a debt or shortfall.
                </span>
              </div>
            </label>

            <label
              className={`
                p-3 border-2 flex items-start gap-2.5 cursor-pointer transition-all
                ${
                  reason === 'CORRECTION'
                    ? 'bg-[#FFFBEB] border-[#102040] shadow-[2px_2px_0px_#102040]'
                    : 'bg-white border-[#CBD5E1] hover:bg-[#FAF8F5]'
                }
              `}
            >
              <input
                type="radio"
                name="remove_reason"
                value="CORRECTION"
                checked={reason === 'CORRECTION'}
                onChange={() => setReason('CORRECTION')}
                className="mt-0.5 accent-[#102040]"
              />
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold text-[#102040]">
                  Correction (Mistake entry)
                </span>
                <span className="font-mono text-[11px] text-[#64748B]">
                  Business was entered accidentally. No resale payout is credited.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Credit resale value checkbox (only for forced sale) */}
        {reason === 'FORCED_SALE' && (
          <div className="bg-[#FAF8F5] border-2 border-[#102040] p-3 flex flex-col gap-1.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={creditResale}
                onChange={(e) => setCreditResale(e.target.checked)}
                className="w-4 h-4 accent-[#22B14C] cursor-pointer"
              />
              <span className="font-sans text-xs font-bold text-[#102040]">
                Credit resale value (+₹{catalogBiz.cost.toLocaleString('en-IN')})
              </span>
            </label>
            <p className="font-mono text-[11px] text-[#64748B] pl-6">
              {creditResale
                ? `Adds base cost ₹${catalogBiz.cost} to team cash upon return to bank.`
                : 'Does not credit cash.'}
            </p>
          </div>
        )}

        {/* Note input (required if TIME_EXPIRED or CORRECTION) */}
        {(isTimeExpired || reason === 'CORRECTION') && (
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] uppercase text-[#D32F2F] font-bold">
              ⚠ Note Required *
            </label>
            <input
              ref={noteRef}
              type="text"
              required
              placeholder={
                reason === 'CORRECTION'
                  ? 'e.g., Assigned to wrong team by accident'
                  : 'Reason for post-game adjustment'
              }
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
            variant="danger"
            size="md"
            disabled={
              isSubmitting ||
              (isTimeExpired && !note.trim()) ||
              (reason === 'CORRECTION' && !note.trim())
            }
            isLoading={isSubmitting}
          >
            CONFIRM REMOVAL
          </PixelButton>
        </div>
      </form>
    </Modal>
  );
};
