import React, { useState, useEffect, useRef } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';

export interface BankruptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'declare' | 'undo';
  team: AdminRoomSnapshot['teams'][0];
  onSubmit: (params: { value: boolean; note?: string }) => Promise<void>;
  isTimeExpired: boolean;
}

export const BankruptDialog: React.FC<BankruptDialogProps> = ({
  isOpen,
  onClose,
  mode,
  team,
  onSubmit,
  isTimeExpired,
}) => {
  const [doubleConfirmChecked, setDoubleConfirmChecked] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDoubleConfirmChecked(false);
      setNote('');
      setError(null);
      setIsSubmitting(false);
      if (mode === 'undo' || isTimeExpired) {
        setTimeout(() => noteRef.current?.focus(), 50);
      }
    }
  }, [isOpen, mode, isTimeExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'declare' && !doubleConfirmChecked) {
      setError('Please check the confirmation box to declare bankruptcy.');
      return;
    }
    if (mode === 'undo' && !note.trim()) {
      setError('A note explaining why bankruptcy is being revoked is mandatory.');
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
        value: mode === 'declare',
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update team bankruptcy status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'declare' ? `DECLARE BANKRUPTCY: ${team.name}` : `UNDO BANKRUPTCY: ${team.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'declare' ? (
          <>
            <div className="bg-status-danger-bg border-2 border-brand-red p-3 flex flex-col gap-2">
              <span className="font-pixel text-xs text-brand-red font-bold">
                ⚠ CRITICAL GAME ACTION
              </span>
              <p className="font-sans text-xs text-brand-navy">
                Declaring bankruptcy immediately eliminates <strong>{team.name}</strong> from active gameplay.
              </p>
              <ul className="list-disc list-inside font-mono text-xs text-neutral-500 flex flex-col gap-1">
                <li>All <strong>{team.businesses.length}</strong> owned businesses will be immediately liquidated back to the bank.</li>
                <li>Other teams will become eligible to buy these businesses.</li>
                <li>The team phone will display an ELIMINATED status.</li>
              </ul>
            </div>

            <label className="flex items-start gap-2 bg-brand-cream border-2 border-brand-navy p-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={doubleConfirmChecked}
                onChange={(e) => setDoubleConfirmChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-brand-red cursor-pointer"
              />
              <span className="font-sans text-xs font-bold text-brand-navy">
                I confirm the team physically declared bankruptcy and cannot pay debts.
              </span>
            </label>
          </>
        ) : (
          <div className="bg-brand-cream-light border-2 border-brand-navy p-3 flex flex-col gap-1.5">
            <span className="font-pixel text-xs text-amber-800 font-bold">
              ⚠ REVOKE BANKRUPTCY CORRECTION
            </span>
            <p className="font-sans text-xs text-brand-navy">
              This restores <strong>{team.name}</strong> to active standing. Note: Any businesses liquidated upon bankruptcy are not restored automatically and must be re-added if necessary.
            </p>
          </div>
        )}

        {/* Note input */}
        {(mode === 'undo' || isTimeExpired) && (
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] uppercase text-brand-navy font-bold">
              Mandatory Note *
            </label>
            <input
              ref={noteRef}
              type="text"
              required
              placeholder={
                mode === 'undo'
                  ? 'e.g., Bankruptcy declared by mistake'
                  : 'Reason for post-game bankruptcy adjustment'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="
                w-full px-2.5 py-1.5 font-sans text-xs text-brand-navy bg-brand-white border-2 border-brand-navy
                focus:outline-none focus:ring-2 focus:ring-brand-gold
              "
            />
          </div>
        )}

        {error && (
          <span className="font-mono text-xs text-brand-red font-bold">
            ⚠ {error}
          </span>
        )}

        {/* Actions */}
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
            variant={mode === 'declare' ? 'danger' : 'primary'}
            size="md"
            disabled={
              isSubmitting ||
              (mode === 'declare' && !doubleConfirmChecked) ||
              (mode === 'undo' && !note.trim()) ||
              (isTimeExpired && !note.trim())
            }
            isLoading={isSubmitting}
          >
            {mode === 'declare' ? 'YES, DECLARE BANKRUPT' : 'CONFIRM RESTORATION'}
          </PixelButton>
        </div>
      </form>
    </Modal>
  );
};
