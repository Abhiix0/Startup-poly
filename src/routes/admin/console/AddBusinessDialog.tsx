import React, { useState, useEffect, useRef } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { OFFICIAL_BUSINESSES } from '../../../domain/economy';

export interface AddBusinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: AdminRoomSnapshot['teams'][0];
  allTeams: AdminRoomSnapshot['teams'];
  onSubmit: (params: { businessKey: string; applyPurchase: boolean; note?: string }) => Promise<void>;
  isTimeExpired: boolean;
}

export const AddBusinessDialog: React.FC<AddBusinessDialogProps> = ({
  isOpen,
  onClose,
  team,
  allTeams,
  onSubmit,
  isTimeExpired,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [applyPurchase, setApplyPurchase] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const noteRef = useRef<HTMLInputElement>(null);

  const isCapReached = team.businesses.length >= 3;

  // Build a map of business_key -> owner team name across all teams
  const ownerMap = new Map<string, string>();
  for (const t of allTeams) {
    for (const b of t.businesses) {
      ownerMap.set(b.business_key, t.name);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedKey(null);
      setApplyPurchase(true);
      setNote('');
      setError(null);
      setIsSubmitting(false);
      if (isTimeExpired) {
        setTimeout(() => noteRef.current?.focus(), 50);
      }
    }
  }, [isOpen, isTimeExpired]);

  const selectedBiz = OFFICIAL_BUSINESSES.find((b) => b.key === selectedKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) {
      setError('Please choose a business to acquire.');
      return;
    }
    if (isTimeExpired && !note.trim()) {
      setError('Note is required for post-game adjustments.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        businessKey: selectedKey,
        applyPurchase,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      if (err?.code === 'INSUFFICIENT_CASH' || err?.message?.includes('INSUFFICIENT_CASH')) {
        onClose();
      } else {
        setError(err?.message || 'Failed to add business.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ADD BUSINESS TO ${team.name.toUpperCase()}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isCapReached && (
          <div className="bg-[#FEECEB] border-2 border-[#D32F2F] p-2 text-center">
            <p className="font-mono text-xs text-[#D32F2F] font-bold">
              ⚠ Team has reached the business cap (3/3). Forced sale or removal required before adding.
            </p>
          </div>
        )}

        {/* 10 Catalog Businesses Picker */}
        <div className="flex flex-col gap-2">
          <label className="font-pixel text-[11px] uppercase tracking-wider text-[#102040]">
            Select Catalog Business ({team.businesses.length}/3 Owned)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {OFFICIAL_BUSINESSES.map((b) => {
              const ownerName = ownerMap.get(b.key);
              const isOwned = Boolean(ownerName);
              const isSelected = selectedKey === b.key;
              const disabled = isCapReached || isOwned;

              return (
                <button
                  type="button"
                  key={b.key}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedKey(b.key);
                    setError(null);
                  }}
                  className={`
                    p-2.5 text-left border-2 transition-all flex flex-col justify-between gap-1
                    ${
                      disabled
                        ? 'bg-[#F1F5F9] border-[#CBD5E1] opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#FFCC00] border-[#102040] shadow-[2px_2px_0px_#102040]'
                        : 'bg-white border-[#102040] hover:bg-[#FAF8F5] cursor-pointer'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-pixel text-xs text-[#102040] truncate">
                      {b.name}
                    </span>
                    {isSelected && (
                      <span className="font-pixel text-xs text-[#102040]">✓</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#64748B]">Cost: ₹{b.cost}</span>
                    <span className="text-[#102040] font-bold">+₹{b.initial_cv} CV</span>
                  </div>

                  {isOwned && (
                    <span className="font-mono text-[10px] text-[#D32F2F] font-bold truncate">
                      Owned by {ownerName}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply Purchase Financial Side-Effect Checkbox */}
        {selectedBiz && (
          <div className="bg-[#FAF8F5] border-2 border-[#102040] p-3 flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyPurchase}
                onChange={(e) => setApplyPurchase(e.target.checked)}
                className="w-4 h-4 accent-[#22B14C] cursor-pointer"
              />
              <span className="font-sans text-xs font-bold text-[#102040]">
                Apply purchase (−₹{selectedBiz.cost.toLocaleString('en-IN')}, +{selectedBiz.initial_cv.toLocaleString('en-IN')} CV)
              </span>
            </label>
            <p className="font-mono text-[11px] text-[#64748B] pl-6">
              {applyPurchase
                ? `Will deduct ₹${selectedBiz.cost} from team cash and credit ₹${selectedBiz.initial_cv} to CV.`
                : 'Manual entry only: does not modify team cash or CV.'}
            </p>
          </div>
        )}

        {/* Note requirement for post-match adjustments */}
        {isTimeExpired && (
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] uppercase text-[#D32F2F] font-bold">
              ⚠ NOTE REQUIRED (GAME OVER ADJUSTMENT)
            </label>
            <input
              ref={noteRef}
              type="text"
              required
              placeholder="e.g., Physical auction purchase finalized before buzzer"
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
            disabled={!selectedKey || isCapReached || isSubmitting || (isTimeExpired && !note.trim())}
            isLoading={isSubmitting}
          >
            CONFIRM ACQUISITION
          </PixelButton>
        </div>
      </form>
    </Modal>
  );
};
