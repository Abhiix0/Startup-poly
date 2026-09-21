import React, { useState, useEffect, useRef } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { OFFICIAL_BUSINESSES } from '../../../domain/economy';

export interface EditBusinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessKey: string | null;
  team: AdminRoomSnapshot['teams'][0];
  onSubmit: (params: {
    businessKey: string;
    newLevel: number;
    note: string;
  }) => Promise<void>;
}

export const EditBusinessDialog: React.FC<EditBusinessDialogProps> = ({
  isOpen,
  onClose,
  businessKey,
  team,
  onSubmit,
}) => {
  const ownedBiz = team.businesses.find((b) => b.business_key === businessKey);
  const catalogBiz = businessKey
    ? OFFICIAL_BUSINESSES.find((b) => b.key === businessKey)
    : null;

  const [level, setLevel] = useState<number>(ownedBiz?.level ?? 0);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && ownedBiz) {
      setLevel(ownedBiz.level);
      setNote('');
      setError(null);
      setIsSubmitting(false);
      setTimeout(() => noteRef.current?.focus(), 50);
    }
  }, [isOpen, ownedBiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessKey) return;
    if (!note.trim()) {
      setError('A note explaining this manual correction is mandatory.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        businessKey,
        newLevel: level,
        note: note.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to edit business level.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ownedBiz || !catalogBiz) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`EDIT ${catalogBiz.name.toUpperCase()} (ADVANCED)`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="bg-[#FFFBEB] border-2 border-[#102040] p-3 text-xs text-[#92400E]">
          <p className="font-bold">⚠ Manual Level Correction</p>
          <p className="mt-0.5">
            This bypasses standard purchase calculations and changes the upgrade level directly. Team cash and CV will NOT be adjusted automatically. A mandatory note is required for the audit log.
          </p>
        </div>

        {/* Level Choice Radios */}
        <div className="flex flex-col gap-2">
          <label className="font-pixel text-[11px] uppercase tracking-wider text-[#102040]">
            Target Upgrade Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((lvl) => (
              <button
                type="button"
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`
                  p-3 font-pixel text-xs border-2 text-center transition-all cursor-pointer
                  ${
                    level === lvl
                      ? 'bg-[#FFCC00] border-[#102040] shadow-[2px_2px_0px_#102040]'
                      : 'bg-white border-[#CBD5E1] hover:bg-[#FAF8F5]'
                  }
                `}
              >
                LEVEL {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Mandatory Note Input */}
        <div className="flex flex-col gap-1">
          <label className="font-pixel text-[10px] uppercase text-[#102040] font-bold">
            Mandatory Correction Note *
          </label>
          <input
            ref={noteRef}
            type="text"
            required
            placeholder="e.g., Table scorekeeper missed previous physical upgrade"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="
              w-full px-2.5 py-2 font-sans text-xs text-[#102040] bg-white border-2 border-[#102040]
              focus:outline-none focus:ring-2 focus:ring-[#FFCC00]
            "
          />
        </div>

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
            disabled={!note.trim() || isSubmitting}
            isLoading={isSubmitting}
          >
            SAVE CORRECTION
          </PixelButton>
        </div>
      </form>
    </Modal>
  );
};
