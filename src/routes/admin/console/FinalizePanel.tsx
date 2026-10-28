import React, { useState, useEffect } from 'react';
import { AdminRoomSnapshot, rpcAdminFinalize, rpcRoomStatus } from '../../../data/rpc';
import { lifecycleAlreadyDone } from '../../../lib/lifecycle';
import { useStandings } from '../../../data/useStandings';
import { StandingsTable } from './StandingsTable';
import { Modal, PixelButton, useToast } from '../../../ui';

export interface FinalizePanelProps {
  roomId: string;
  snapshot: AdminRoomSnapshot;
  onRefetch: () => Promise<void>;
  isOffline?: boolean;
}

export const FinalizePanel: React.FC<FinalizePanelProps> = ({
  roomId,
  snapshot,
  onRefetch,
  isOffline = false,
}) => {
  const { standings, isLoading, refetch: refetchStandings } = useStandings(
    roomId,
    snapshot.room.status === 'TIME_EXPIRED'
  );

  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  const { successToast, errorToast } = useToast();

  // Re-fetch standings whenever snapshot changes (e.g. after edits/quick actions)
  useEffect(() => {
    refetchStandings();
  }, [snapshot, refetchStandings]);

  const handleConfirmFinalize = async () => {
    try {
      setIsFinalizing(true);
      setPanelError(null);
      await rpcAdminFinalize(roomId);
      successToast('Match finalized successfully! Leaderboard is now permanent.');
      setIsFinalizeModalOpen(false);
      await onRefetch();
    } catch (err: any) {
      if (await lifecycleAlreadyDone(err, roomId, 'FINALIZED', rpcRoomStatus)) {
        successToast('Match finalized successfully! Leaderboard is now permanent.');
        setIsFinalizeModalOpen(false);
        await onRefetch();
        return;
      }
      const msg = err?.message || 'Failed to finalize match.';
      setPanelError(msg);
      errorToast(msg);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div id="finalize-panel" className="bg-brand-cream border-4 border-brand-navy shadow-pixel p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-brand-navy pb-3">
        <div>
          <span className="font-pixel text-[10px] text-brand-red uppercase tracking-wider block">
            MATCH CONCLUSION & AUDIT RECONCILIATION
          </span>
          <h2 className="font-pixel text-sm sm:text-base text-brand-navy uppercase">
            LIVE PROVISIONAL STANDINGS
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-pixel text-[10px] bg-status-info-bg text-status-info-dark border border-status-info px-2.5 py-1">
            Ranked by cash, owned business cost, then upgrades. Equal teams share a rank.
          </span>

          <PixelButton
            variant="danger"
            size="sm"
            disabled={isFinalizing || isOffline || isLoading}
            onClick={() => setIsFinalizeModalOpen(true)}
          >
            FINALIZE MATCH
          </PixelButton>
        </div>
      </div>

      {/* Standings Table */}
      <StandingsTable standings={standings} teams={snapshot.teams} />

      {panelError && (
        <div className="bg-status-danger-bg border-2 border-brand-red p-2 text-xs font-mono text-brand-red font-bold">
          ⚠ {panelError}
        </div>
      )}

      {/* Confirmation Modal for Finalization */}
      <Modal
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        title="PERMANENTLY FINALIZE MATCH"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4">
          <div className="bg-status-danger-bg border-2 border-brand-red p-3 flex items-start gap-2.5 shadow-pixel-sm">
            <span className="text-xl">⚠</span>
            <div>
              <span className="font-pixel text-xs text-brand-red block">
                PERMANENT & IRREVERSIBLE ACTION
              </span>
              <p className="font-sans text-xs text-brand-navy mt-1">
                Final scores and standings will be locked forever into the immutable tournament history.
                The official leaderboard will immediately publish to all team devices.
                No further edits or corrections will be possible.
              </p>
            </div>
          </div>

          <p className="font-mono text-xs text-neutral-500">
            Room Code: <strong>{snapshot.room.code}</strong> • Teams: <strong>{snapshot.teams.length}</strong>
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-brand-navy">
            <button
              type="button"
              disabled={isFinalizing}
              onClick={() => setIsFinalizeModalOpen(false)}
              className="font-pixel text-xs uppercase px-3 py-1.5 bg-brand-white text-brand-navy border-2 border-brand-navy shadow-pixel-sm hover:bg-neutral-200 cursor-pointer"
            >
              CANCEL (Esc)
            </button>
            <PixelButton
              variant="danger"
              size="md"
              isLoading={isFinalizing}
              onClick={handleConfirmFinalize}
            >
              CONFIRM FINALIZATION
            </PixelButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
