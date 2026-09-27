import React, { useState, useEffect, useRef } from 'react';
import { PixelButton } from '../../../ui';

export interface ValueEditorProps {
  label: string;
  unit?: string;
  currentValue: number;
  onUpdate: (newValue: number, note?: string) => Promise<void>;
  isTimeExpired: boolean;
  disabled?: boolean;
}

export const ValueEditor: React.FC<ValueEditorProps> = ({
  label,
  unit = '₹',
  currentValue,
  onUpdate,
  isTimeExpired,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(currentValue));
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const noteInputRef = useRef<HTMLInputElement>(null);
  const numInputRef = useRef<HTMLInputElement>(null);

  // Sync draft value if currentValue changes from server while user is NOT in confirm strip
  useEffect(() => {
    if (!isConfirming) {
      setInputValue(String(currentValue));
    }
  }, [currentValue, isConfirming]);

  // Focus note input when confirm strip opens in post-match mode
  useEffect(() => {
    if (isConfirming && isTimeExpired) {
      setTimeout(() => {
        noteInputRef.current?.focus();
      }, 50);
    }
  }, [isConfirming, isTimeExpired]);

  const parsedValue = parseInt(inputValue, 10);
  const targetValue = isNaN(parsedValue) ? 0 : Math.max(0, parsedValue);
  const delta = targetValue - currentValue;

  // Handle direct typing in the input - blocks negative numbers
  const handleInputChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    setInputValue(cleaned);
    setError(null);
  };

  // Delta quick chip buttons
  const applyDelta = (chipDelta: number) => {
    if (disabled || isConfirming) return;
    const nextVal = Math.max(0, currentValue + chipDelta);
    setInputValue(String(nextVal));
    setError(null);
  };

  const handleStartConfirm = () => {
    if (disabled) return;
    if (isNaN(parsedValue)) {
      setError('Please enter a valid amount.');
      return;
    }
    if (targetValue === currentValue) {
      setError('Amount unchanged.');
      return;
    }
    setError(null);
    setIsConfirming(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirming(false);
    setInputValue(String(currentValue));
    setNote('');
    setError(null);
  };

  const handleConfirmSubmit = async () => {
    if (isTimeExpired && !note.trim()) {
      setError('Note is required for post-game corrections.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdate(targetValue, note.trim() || undefined);
      setIsConfirming(false);
      setNote('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update value.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut listener for the inline confirm strip: Enter confirms, Esc cancels
  const handleStripKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelConfirm();
    }
  };

  return (
    <div className="bg-white border-3 border-brand-navy p-3 shadow-pixel-sm flex flex-col gap-2.5">
      {/* Label and current display */}
      <div className="flex items-center justify-between">
        <label className="font-pixel text-[11px] uppercase tracking-wider text-brand-navy">
          {label}
        </label>
        <span className="font-mono text-xs text-neutral-500">
          Current: <strong className="text-brand-navy">{unit}{currentValue.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {/* Input and UPDATE button row */}
      {!isConfirming ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-neutral-500">
                {unit}
              </span>
              <input
                ref={numInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={disabled}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleStartConfirm();
                  }
                }}
                className="
                  w-full pl-7 pr-3 py-2 font-tabular font-bold text-sm sm:text-base text-brand-navy
                  bg-brand-cream border-2 border-brand-navy shadow-[inset_2px_2px_0px_rgba(0,0,0,0.06)]
                  focus:bg-brand-white focus:outline-none focus:ring-2 focus:ring-brand-gold
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              />
            </div>
            <PixelButton
              variant="primary"
              size="md"
              disabled={disabled || targetValue === currentValue}
              onClick={handleStartConfirm}
            >
              UPDATE
            </PixelButton>
          </div>

          {/* Quick Delta Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="font-pixel text-[9px] text-neutral-500 uppercase select-none mr-0.5">
              QUICK:
            </span>
            {[
              { label: '+50', val: 50 },
              { label: '+100', val: 100 },
              { label: '−100', val: -100 },
              { label: '+200', val: 200 },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                disabled={disabled}
                onClick={() => applyDelta(chip.val)}
                className="
                  font-mono text-xs font-bold px-2 py-1 bg-neutral-200 text-brand-navy
                  border border-brand-navy shadow-pixel-sm hover:bg-brand-gold
                  active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Inline Confirmation Strip */
        <div
          onKeyDown={handleStripKeyDown}
          className="bg-brand-cream-light border-2 border-brand-navy p-3 shadow-pixel-sm flex flex-col gap-2.5 animate-in fade-in duration-100"
        >
          {/* Diff Preview */}
          <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-bold">
            <span className="text-neutral-500">
              {unit}{currentValue.toLocaleString('en-IN')} → {unit}{targetValue.toLocaleString('en-IN')}
            </span>
            <span
              className={`px-1.5 py-0.5 border ${
                delta >= 0
                  ? 'bg-status-success-bg text-brand-green border-brand-green'
                  : 'bg-status-danger-bg text-brand-red border-brand-red'
              }`}
            >
              {delta >= 0 ? `+${unit}${delta.toLocaleString('en-IN')}` : `−${unit}${Math.abs(delta).toLocaleString('en-IN')}`}
            </span>
          </div>

          {/* Post-match Note Requirement */}
          {isTimeExpired && (
            <div className="flex flex-col gap-1">
              <label className="font-pixel text-[10px] uppercase text-brand-red font-bold flex items-center gap-1">
                <span>⚠ NOTE REQUIRED (GAME OVER CORRECTION)</span>
              </label>
              <input
                ref={noteInputRef}
                type="text"
                required
                placeholder="Reason for post-game adjustment..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="
                  w-full px-2.5 py-1.5 font-sans text-xs text-brand-navy bg-brand-white border-2 border-brand-navy
                  focus:outline-none focus:ring-2 focus:ring-brand-red
                "
              />
            </div>
          )}

          {/* Confirm & Cancel Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancelConfirm}
              disabled={isSubmitting}
              className="
                font-pixel text-[11px] uppercase px-3 py-1.5 bg-brand-white text-brand-navy
                border-2 border-brand-navy shadow-pixel-sm hover:bg-neutral-200
                cursor-pointer active:translate-y-0.5 disabled:opacity-50
              "
            >
              CANCEL (Esc)
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting || (isTimeExpired && !note.trim())}
              className="
                font-pixel text-[11px] uppercase px-4 py-1.5 bg-brand-green text-brand-white
                border-2 border-brand-navy shadow-pixel-sm hover:bg-interactive-green-hover
                cursor-pointer active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? 'SAVING…' : 'CONFIRM (↵)'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <span className="font-mono text-xs text-brand-red font-bold">
          ⚠ {error}
        </span>
      )}
    </div>
  );
};
