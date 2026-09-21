import React, { useState, useEffect } from 'react';
import { ConsoleTopBar } from './ConsoleTopBar';
import { TeamGrid } from './TeamGrid';
import { TeamEditor } from './TeamEditor';
import { ActivityLog } from './ActivityLog';
import { AddBusinessDialog } from './AddBusinessDialog';
import { UpgradeDialog } from './UpgradeDialog';
import { EditBusinessDialog } from './EditBusinessDialog';
import { RemoveBusinessDialog } from './RemoveBusinessDialog';
import { BankruptDialog } from './BankruptDialog';
import { ConflictDialog } from './ConflictDialog';
import { useToast } from '../../../ui';
import { ConnectionStatus } from '../../../ui/ConnectionPill';
import {
  AdminRoomSnapshot,
  rpcAdminSetTeamValues,
  rpcAdminAddBusiness,
  rpcAdminSetBusinessLevel,
  rpcAdminRemoveBusiness,
  rpcAdminSetBankrupt,
} from '../../../data/rpc';

export interface AdminConsoleViewProps {
  snapshot: AdminRoomSnapshot;
  onRefetch: () => Promise<void>;
  connection: ConnectionStatus;
  lastUpdated: string;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  snapshot,
  onRefetch,
  connection,
  lastUpdated,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    snapshot.teams[0]?.id || ''
  );
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down' | null>>({});

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [upgradeBizKey, setUpgradeBizKey] = useState<string | null>(null);
  const [editBizKey, setEditBizKey] = useState<string | null>(null);
  const [removeBizKey, setRemoveBizKey] = useState<string | null>(null);
  const [bankruptMode, setBankruptMode] = useState<'declare' | 'undo' | null>(null);

  // Conflict & Insufficient Cash states
  const [conflictDetails, setConflictDetails] = useState<{
    expectedVersion?: number;
    currentVersion?: number;
    cash?: number;
    cv?: number;
  } | null>(null);
  const [insufficientCashShortfall, setInsufficientCashShortfall] = useState<number | null>(null);

  const { successToast, errorToast } = useToast();

  const isTimeExpired = snapshot.room.status === 'TIME_EXPIRED';
  const isOffline = connection === 'OFFLINE';

  // Ensure selectedTeamId is always valid even if teams change
  useEffect(() => {
    if (!snapshot.teams.some((t) => t.id === selectedTeamId)) {
      if (snapshot.teams.length > 0) {
        setSelectedTeamId(snapshot.teams[0].id);
      }
    }
  }, [snapshot.teams, selectedTeamId]);

  const selectedTeam = snapshot.teams.find((t) => t.id === selectedTeamId) || snapshot.teams[0];

  const triggerFlash = (teamId: string, direction: 'up' | 'down') => {
    setFlashes((prev) => ({ ...prev, [teamId]: direction }));
    setTimeout(() => {
      setFlashes((prev) => ({ ...prev, [teamId]: null }));
    }, 600);
  };

  const handleManualRefetch = async () => {
    try {
      setIsRefetching(true);
      await onRefetch();
    } finally {
      setIsRefetching(false);
    }
  };

  const handleError = (err: any, expectedVer?: number) => {
    const code = err?.code || '';
    const msg = err?.message || '';

    if (code === 'VERSION_CONFLICT' || msg.includes('VERSION_CONFLICT')) {
      setConflictDetails({
        expectedVersion: expectedVer ?? selectedTeam?.version,
        currentVersion: err?.detail?.current_version ?? (selectedTeam?.version ? selectedTeam.version + 1 : undefined),
        cash: err?.detail?.cash,
        cv: err?.detail?.cv,
      });
      return;
    }

    if (code === 'INSUFFICIENT_CASH' || msg.includes('INSUFFICIENT_CASH')) {
      const shortfall = err?.detail?.shortfall || 0;
      setInsufficientCashShortfall(shortfall);
      errorToast(`Insufficient cash! Shortfall: ₹${shortfall}`);
      setIsAddOpen(false);
      setUpgradeBizKey(null);
      return;
    }

    errorToast(msg || 'An error occurred.');
  };

  // --- MUTATION HANDLERS ---

  const handleUpdateCash = async (newCash: number, note?: string) => {
    if (!selectedTeam) return;
    const direction = newCash >= selectedTeam.cash ? 'up' : 'down';
    try {
      await rpcAdminSetTeamValues({
        team_id: selectedTeam.id,
        cash: newCash,
        expected_version: selectedTeam.version,
        request_id: crypto.randomUUID(),
        note,
      });
      successToast(`${selectedTeam.name} cash updated.`);
      triggerFlash(selectedTeam.id, direction);
      await onRefetch();
    } catch (err: any) {
      handleError(err, selectedTeam.version);
      throw err;
    }
  };

  const handleUpdateCv = async (newCv: number, note?: string) => {
    if (!selectedTeam) return;
    const direction = newCv >= selectedTeam.cv ? 'up' : 'down';
    try {
      await rpcAdminSetTeamValues({
        team_id: selectedTeam.id,
        cv: newCv,
        expected_version: selectedTeam.version,
        request_id: crypto.randomUUID(),
        note,
      });
      successToast(`${selectedTeam.name} CV updated.`);
      triggerFlash(selectedTeam.id, direction);
      await onRefetch();
    } catch (err: any) {
      handleError(err, selectedTeam.version);
      throw err;
    }
  };

  const handleAddBusiness = async ({
    businessKey,
    applyPurchase,
    note,
  }: {
    businessKey: string;
    applyPurchase: boolean;
    note?: string;
  }) => {
    if (!selectedTeam) return;
    try {
      await rpcAdminAddBusiness({
        team_id: selectedTeam.id,
        business_key: businessKey,
        apply_purchase: applyPurchase,
        expected_version: selectedTeam.version,
        request_id: crypto.randomUUID(),
        note,
      });
      successToast(`Added business to ${selectedTeam.name}.`);
      triggerFlash(selectedTeam.id, 'up');
      await onRefetch();
    } catch (err: any) {
      handleError(err, selectedTeam.version);
      throw err;
    }
  };

  const handleUpgradeBusiness = async ({
    businessKey,
    newLevel,
    applyUpgrade,
    note,
  }: {
    businessKey: string;
    newLevel: number;
    applyUpgrade: boolean;
    note?: string;
  }) => {
    if (!selectedTeam) return;
    try {
      await rpcAdminSetBusinessLevel({
        team_id: selectedTeam.id,
        business_key: businessKey,
        new_level: newLevel,
        apply_upgrade: applyUpgrade,
        expected_version: selectedTeam.version,
        request_id: crypto.randomUUID(),
        note,
      });
      successToast(`Upgraded ${businessKey} for ${selectedTeam.name}.`);
      triggerFlash(selectedTeam.id, 'up');
      await onRefetch();
    } catch (err: any) {
      handleError(err, selectedTeam.version);
      throw err;
    }
  };

  const handleEditBusiness = async ({
    businessKey,
    newLevel,
    note,
  }: {
    businessKey: string;
    newLevel: number;
    note: string;
  }) => {
    if (!selectedTeam) return;
    try {
      await rpcAdminSetBusinessLevel({
        team_id: selectedTeam.id,
        business_key: businessKey,
        new_level: newLevel,
        apply_upgrade: false,
        expected_version: selectedTeam.version,
        request_id: crypto.randomUUID(),
        note,
      });
      successToast(`Corrected ${businessKey} level for ${selectedTeam.name}.`);
      triggerFlash(selectedTeam.id, 'up');
      await onRefetch();
    } catch (err: any) {
      handleError(err, selectedTeam.version);
      throw err;
    }
  };

  const handleRemoveBusiness = async ({
    businessKey,
    reason,
    creditResale,
    note,
  }: {
    businessKey: string;
    reason: 'FORCED_SALE' | 'CORRECTION';
    creditResale: boolean;
    note?: string;
  }) => {
    if (!selectedTeam) return;
    try {
      await rpcAdminRemoveBusiness({
        team_id: selectedTeam.id,
        business_key: businessKey,
        reason,
        credit_resale: creditResale,
        expected_version: selectedTeam.version,
        request_id: crypto.randomUUID(),
        note,
      });
      successToast(`Removed ${businessKey} from ${selectedTeam.name}.`);
      triggerFlash(selectedTeam.id, reason === 'FORCED_SALE' ? 'up' : 'down');
      setInsufficientCashShortfall(null);
      await onRefetch();
    } catch (err: any) {
      handleError(err, selectedTeam.version);
      throw err;
    }
  };

  const handleBankrupt = async ({
    value,
    note,
  }: {
    value: boolean;
    note?: string;
  }) => {
    if (!selectedTeam) return;
    try {
      await rpcAdminSetBankrupt({
        team_id: selectedTeam.id,
        value,
        expected_version: selectedTeam.version,
        request_id: crypto.randomUUID(),
        note,
      });
      successToast(
        value
          ? `${selectedTeam.name} marked as bankrupt.`
          : `${selectedTeam.name} bankruptcy revoked.`
      );
      triggerFlash(selectedTeam.id, value ? 'down' : 'up');
      await onRefetch();
    } catch (err: any) {
      handleError(err, selectedTeam.version);
      throw err;
    }
  };

  if (!selectedTeam) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#5C94FC] text-[#102040]">
      {/* 1. TOP BAR */}
      <ConsoleTopBar
        roomCode={snapshot.room.code}
        status={snapshot.room.status}
        endsAt={snapshot.room.ends_at}
        serverNow={snapshot.server_now}
        connection={connection}
        lastUpdated={lastUpdated}
        onRefetch={handleManualRefetch}
        isRefetching={isRefetching}
      />

      {/* 2. FULL-WIDTH SYSTEM ALERTS */}
      {isOffline && (
        <div className="bg-[#D32F2F] text-white px-4 py-2 text-center font-pixel text-xs border-b-2 border-[#102040]">
          ⚠ OFFLINE — Edits disabled until internet connection is restored.
        </div>
      )}

      {isTimeExpired && (
        <div className="bg-[#FFCC00] text-[#102040] px-4 py-2 text-center font-pixel text-xs border-b-4 border-[#102040] shadow-[0_2px_0px_#102040]">
          ⚠ GAME OVER — scores frozen. Post-match corrections require a mandatory note.
        </div>
      )}

      {insufficientCashShortfall !== null && (
        <div className="bg-[#FEECEB] border-b-3 border-[#D32F2F] p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-[#D32F2F]">⚠ INSUFFICIENT CASH</span>
            <span className="font-mono text-xs text-[#102040]">
              Shortfall of <strong>₹{insufficientCashShortfall.toLocaleString('en-IN')}</strong>. Team must perform a forced sale first.
            </span>
          </div>
          {selectedTeam.businesses.length > 0 && (
            <button
              type="button"
              onClick={() => setRemoveBizKey(selectedTeam.businesses[0].business_key)}
              className="
                font-pixel text-[11px] uppercase px-3 py-1 bg-[#D32F2F] text-white
                border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#B71C1C] cursor-pointer
              "
            >
              DO FORCED SALE FIRST
            </button>
          )}
        </div>
      )}

      {/* 3. MAIN DESKTOP CONSOLE BODY */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col xl:flex-row gap-5">
        {/* Left & Center: Team Grid and Selected Team Editor */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          <TeamGrid
            teams={snapshot.teams}
            selectedTeamId={selectedTeam.id}
            onSelectTeam={(id) => {
              setSelectedTeamId(id);
              setInsufficientCashShortfall(null);
            }}
            flashes={flashes}
          />

          <TeamEditor
            team={selectedTeam}
            isTimeExpired={isTimeExpired}
            disabled={isOffline}
            onUpdateCash={handleUpdateCash}
            onUpdateCv={handleUpdateCv}
            onAddBusinessClick={() => setIsAddOpen(true)}
            onUpgradeBusinessClick={(key) => setUpgradeBizKey(key)}
            onEditBusinessClick={(key) => setEditBizKey(key)}
            onRemoveBusinessClick={(key) => setRemoveBizKey(key)}
            onOpenBankruptModal={(mode) => setBankruptMode(mode)}
          />
        </div>

        {/* Right Column: Live Activity Log */}
        <div className="w-full xl:w-[380px] 2xl:w-[440px] flex-shrink-0">
          <ActivityLog events={snapshot.events} teams={snapshot.teams} />
        </div>
      </main>

      {/* 4. MODALS & DIALOGS */}
      <AddBusinessDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        team={selectedTeam}
        allTeams={snapshot.teams}
        onSubmit={handleAddBusiness}
        isTimeExpired={isTimeExpired}
      />

      <UpgradeDialog
        isOpen={Boolean(upgradeBizKey)}
        onClose={() => setUpgradeBizKey(null)}
        businessKey={upgradeBizKey}
        team={selectedTeam}
        onSubmit={handleUpgradeBusiness}
        isTimeExpired={isTimeExpired}
      />

      <EditBusinessDialog
        isOpen={Boolean(editBizKey)}
        onClose={() => setEditBizKey(null)}
        businessKey={editBizKey}
        team={selectedTeam}
        onSubmit={handleEditBusiness}
      />

      <RemoveBusinessDialog
        isOpen={Boolean(removeBizKey)}
        onClose={() => setRemoveBizKey(null)}
        businessKey={removeBizKey}
        team={selectedTeam}
        onSubmit={handleRemoveBusiness}
        isTimeExpired={isTimeExpired}
      />

      <BankruptDialog
        isOpen={Boolean(bankruptMode)}
        onClose={() => setBankruptMode(null)}
        mode={bankruptMode || 'declare'}
        team={selectedTeam}
        onSubmit={handleBankrupt}
        isTimeExpired={isTimeExpired}
      />

      <ConflictDialog
        isOpen={Boolean(conflictDetails)}
        onClose={() => setConflictDetails(null)}
        onReload={handleManualRefetch}
        conflictDetails={conflictDetails}
      />

      {/* 5. NES Ground Pattern */}
      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
