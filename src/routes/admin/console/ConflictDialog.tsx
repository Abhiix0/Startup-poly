import React from 'react';
import { Modal, PixelButton } from '../../../ui';

export interface ConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  conflictDetails?: {
    expectedVersion?: number;
    currentVersion?: number;
    cash?: number;
    cv?: number;
  } | null;
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  isOpen,
  onClose,
  onReload,
  conflictDetails,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TEAM CHANGED ELSEWHERE"
      maxWidth="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="bg-brand-cream-light border-2 border-brand-navy p-3 flex flex-col gap-2">
          <p className="font-pixel text-xs text-amber-800 font-bold">
            ⚠ CONCURRENCY CONFLICT DETECTED
          </p>
          <p className="font-sans text-xs text-brand-navy">
            Another referee or device modified this team while your draft was open. To prevent accidental data loss, your changes were not applied.
          </p>
        </div>

        {conflictDetails && (
          <div className="bg-brand-cream border-2 border-brand-navy p-3 font-mono text-xs flex flex-col gap-1 text-neutral-500">
            <div>
              Latest Version: <strong className="text-brand-navy">v{conflictDetails.currentVersion}</strong> (your draft was on v{conflictDetails.expectedVersion})
            </div>
            {conflictDetails.cash !== undefined && (
              <div>
                Latest Cash on server: <strong className="text-brand-navy">₹{conflictDetails.cash.toLocaleString('en-IN')}</strong>
              </div>
            )}
            {conflictDetails.cv !== undefined && (
              <div>
                Latest CV on server: <strong className="text-brand-navy">₹{conflictDetails.cv.toLocaleString('en-IN')}</strong>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-brand-navy">
          <button
            type="button"
            onClick={onClose}
            className="
              font-pixel text-xs uppercase px-3 py-1.5 bg-brand-white text-brand-navy
              border-2 border-brand-navy shadow-pixel-sm hover:bg-neutral-200
              cursor-pointer active:translate-y-0.5
            "
          >
            DISMISS
          </button>
          <PixelButton
            variant="primary"
            size="md"
            onClick={() => {
              onReload();
              onClose();
            }}
          >
            RELOAD AND RETRY
          </PixelButton>
        </div>
      </div>
    </Modal>
  );
};
