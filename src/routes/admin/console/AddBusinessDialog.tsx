import React, { useState, useEffect, useRef } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { OFFICIAL_BUSINESSES, MAX_BUSINESSES_PER_TEAM, canAddBusiness } from '../../../domain/economy';

export interface AddBusinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: AdminRoomSnapshot['teams'][0];
  allTeams: AdminRoomSnapshot['teams'];
  onSubmit: (params: { businessKey: string; applyPurchase: boolean; note?: string }) => Promise<void>;
  isTimeExpired: boolean;
  /** Board-landing flow: show and preselect only this business. */
  lockedBusinessKey?: string | null;
}

export const AddBusinessDialog: React.FC<AddBusinessDialogProps> = ({
  isOpen,
  onClose,
  team,
  allTeams,
  onSubmit,
  isTimeExpired,
  lockedBusinessKey = null,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [applyPurchase, setApplyPurchase] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const noteRef = useRef<HTMLInputElement>(null);
  // A free (manual) entry bypasses the purchase rules, so it is explained and audited like a post-game correction.
  const needsNote = isTimeExpired || !applyPurchase;

  const isCapReached = !canAddBusiness(team.businesses.length);

  // Build a map of business_key -> owner team name across all teams
  const ownerMap = new Map<string, string>();
  for (const t of allTeams) {
    for (const b of t.businesses) {
      ownerMap.set(b.business_key, t.name);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedKey(lockedBusinessKey);
      setApplyPurchase(true);
      setNote('');
      setError(null);
      setIsSubmitting(false);
      if (isTimeExpired) {
        setTimeout(() => noteRef.current?.focus(), 50);
      }
    }
  }, [isOpen, isTimeExpired, lockedBusinessKey]);

  const selectedBiz = OFFICIAL_BUSINESSES.find((b) => b.key === selectedKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) {
      setError('Please choose a business to acquire.');
      return;
    }
    if (needsNote && !note.trim()) {
      setError(applyPurchase ? 'Note is required for post-game adjustments.' : 'A note is required for a manual business entry.');
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
          <div className="bg-status-danger-bg border-2 border-brand-red p-2 text-center">
            <p className="font-mono text-xs text-brand-red font-bold">
              ⚠ Team has reached the business cap ({MAX_BUSINESSES_PER_TEAM}/{MAX_BUSINESSES_PER_TEAM}). Forced sale or removal required before adding.
            </p>
          </div>
        )}

        {/* 10 Catalog Businesses Picker */}
        <div className="flex flex-col gap-2">
          <label className="font-pixel text-[11px] uppercase tracking-wider text-brand-navy">
            {lockedBusinessKey ? 'Landed on' : 'Select Catalog Business'} ({team.businesses.length}/{MAX_BUSINESSES_PER_TEAM} Owned)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {OFFICIAL_BUSINESSES.filter((b) => !lockedBusinessKey || b.key === lockedBusinessKey).map((b) => {
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
                        ? 'bg-neutral-100 border-neutral-300 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-brand-gold border-brand-navy shadow-pixel-sm'
                        : 'bg-brand-white border-brand-navy hover:bg-brand-cream cursor-pointer'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-pixel text-xs text-brand-navy truncate">
                      {b.name}
                    </span>
                    {isSelected && (
                      <span className="font-pixel text-xs text-brand-navy">✓</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-neutral-500">Cost: ₹{b.cost}</span>
                  </div>

                  {isOwned && (
                    <span className="font-mono text-[10px] text-brand-red font-bold truncate">
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
          <div className="bg-brand-cream border-2 border-brand-navy p-3 flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyPurchase}
                onChange={(e) => setApplyPurchase(e.target.checked)}
                className="w-4 h-4 accent-brand-green cursor-pointer"
              />
              <span className="font-sans text-xs font-bold text-brand-navy">
                Apply purchase (−₹{selectedBiz.cost.toLocaleString('en-IN')})
              </span>
            </label>
            <p className="font-mono text-[11px] text-neutral-500 pl-6">
              {applyPurchase
                ? `Will deduct ₹${selectedBiz.cost} from team cash.`
                : 'Manual entry only: does not modify team cash.'}
            </p>
          </div>
        )}

        {/* Note requirement for post-match adjustments */}
        {needsNote && (
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] uppercase text-brand-red font-bold">
              ⚠ NOTE REQUIRED ({isTimeExpired ? 'GAME OVER ADJUSTMENT' : 'MANUAL ENTRY'})
            </label>
            <input
              ref={noteRef}
              type="text"
              required
              placeholder="e.g., Physical auction purchase finalized before buzzer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="
                w-full px-2.5 py-1.5 font-sans text-xs text-brand-navy bg-brand-white border-2 border-brand-navy
                focus:outline-none focus:ring-2 focus:ring-brand-red
              "
            />
          </div>
        )}

        {error && (
          <span className="font-mono text-xs text-brand-red font-bold">
            ⚠ {error}
          </span>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-brand-navy">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              font-pixel text-xs uppercase px-3 py-1.5 bg-brand-white text-brand-navy
              border-2 border-brand-navy shadow-pixel-sm hover:bg-neutral-200
              cursor-pointer active:translate-y-0.5 disabled:opacity-50
            "
          >
            CANCEL
          </button>
          <PixelButton
            type="submit"
            variant="primary"
            size="md"
            disabled={!selectedKey || isCapReached || isSubmitting || (needsNote && !note.trim())}
            isLoading={isSubmitting}
          >
            CONFIRM ACQUISITION
          </PixelButton>
        </div>
      </form>
    </Modal>
  );
};
