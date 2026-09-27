import React, { useState, useEffect } from 'react';
import { AdminRoomSnapshot, rpcAdminSetTiebreak, rpcAdminFinalize } from '../../../data/rpc';
import { useStandings } from '../../../data/useStandings';
import { StandingsTable } from './StandingsTable';
import { TieBreakOrder } from './TieBreakOrder';
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
  const { standings, hasUnresolvedTie, isLoading, refetch: refetchStandings } = useStandings(
    roomId,
    snapshot.room.status === 'TIME_EXPIRED'
  );

  const [isTiebreakSubmitting, setIsTiebreakSubmitting] = useState<boolean>(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  const { successToast, errorToast } = useToast();

  // Re-fetch standings whenever snapshot changes (e.g. after edits/quick actions)
  useEffect(() => {
    refetchStandings();
  }, [snapshot, refetchStandings]);

  // Teams needing tiebreak
  const unresolvedTiedTeams = standings.filter((s) => s.tie_unresolved);

  const handleSetTiebreak = async (orderedTeamIds: string[], note: string) => {
    try {
      setIsTiebreakSubmitting(true);
      setPanelError(null);
      await rpcAdminSetTiebreak(roomId, orderedTeamIds, note);
      successToast('Tie-break pitch order recorded.');
      await refetchStandings();
      await onRefetch();
    } catch (err: any) {
      const msg = err?.message || 'Failed to record tie-break order.';
      setPanelError(msg);
      errorToast(msg);
    } finally {
      setIsTiebreakSubmitting(false);
    }
  };

  const handleConfirmFinalize = async () => {
    try {
      setIsFinalizing(true);
      setPanelError(null);
      await rpcAdminFinalize(roomId);
      successToast('Match finalized successfully! Leaderboard is now permanent.');
      setIsFinalizeModalOpen(false);
      await onRefetch();
    } catch (err: any) {
      const msg = err?.message || 'Failed to finalize match.';
      setPanelError(msg);
      errorToast(msg);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="bg-brand-cream border-4 border-brand-navy shadow-pixel p-4 flex flex-col gap-4">
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

        <div className="flex items-center gap-2">
          {hasUnresolvedTie ? (
            <span className="font-pixel text-[10px] bg-status-warning-bg text-status-warning-dark border border-brand-gold px-2.5 py-1 animate-pulse">
              ⚠ TIEBREAK REQUIRED BEFORE FINALIZING
            </span>
          ) : (
            <span className="font-pixel text-[10px] bg-status-success-bg text-brand-green border border-brand-green px-2.5 py-1">
              ✓ ALL TIES RESOLVED
            </span>
          )}

          <PixelButton
            variant="danger"
            size="sm"
            disabled={hasUnresolvedTie || isFinalizing || isOffline || isLoading}
            onClick={() => setIsFinalizeModalOpen(true)}
          >
            FINALIZE MATCH
          </PixelButton>
        </div>
      </div>

      {/* Tie-break entry box if ties exist */}
      {unresolvedTiedTeams.length > 0 && (
        <TieBreakOrder
          tiedTeams={unresolvedTiedTeams}
          onSubmit={handleSetTiebreak}
          isSubmitting={isTiebreakSubmitting}
        />
      )}

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
