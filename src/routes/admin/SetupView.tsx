import React, { useState } from 'react';
import { PixelButton, PixelCard, StatusPill, TextField, Modal, useToast } from '../../ui';
import { TEAM_COLOR_PALETTE } from '../../domain/teams';
import { rpcAdminUpdateTeamConfig, rpcAdminOpenLobby, rpcRoomStatus, AdminRoomSnapshot } from '../../data/rpc';
import { lifecycleAlreadyDone } from '../../lib/lifecycle';

interface SetupViewProps {
  snapshot: AdminRoomSnapshot;
  onRefetch: () => Promise<void>;
}

export const SetupView: React.FC<SetupViewProps> = ({ snapshot, onRefetch }) => {
  const { room, teams } = snapshot;

  // Local state for editing teams
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState('');
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  // Modal for Open Lobby confirmation
  const [showOpenLobbyModal, setShowOpenLobbyModal] = useState(false);
  const [isOpeningLobby, setIsOpeningLobby] = useState(false);

  const { successToast, errorToast } = useToast();

  const handleStartEdit = (team: (typeof teams)[0]) => {
    setEditingTeamId(team.id);
    setDraftName(team.name);
    setDraftColor(team.color);
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
  };

  const handleSaveTeam = async (teamId: string) => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed.length > 30) {
      errorToast('Team name must be 1 to 30 characters.');
      return;
    }

    try {
      setIsSavingTeam(true);
      await rpcAdminUpdateTeamConfig(teamId, trimmed, draftColor.toUpperCase());
      successToast('Team updated successfully!');
      setEditingTeamId(null);
      await onRefetch();
    } catch (err: any) {
      errorToast(err.message || 'Failed to update team config.');
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleOpenLobby = async () => {
    try {
      setIsOpeningLobby(true);
      await rpcAdminOpenLobby(room.id);
      successToast('Lobby is now OPEN for team connections!');
      setShowOpenLobbyModal(false);
      await onRefetch();
    } catch (err: any) {
      if (await lifecycleAlreadyDone(err, room.id, 'LOBBY', rpcRoomStatus)) {
        successToast('Lobby is now OPEN for team connections!');
        setShowOpenLobbyModal(false);
        await onRefetch();
        return;
      }
      errorToast(err.message || 'Failed to open lobby.');
    } finally {
      setIsOpeningLobby(false);
    }
  };

  const nameError =
    editingTeamId && draftName.trim().length === 0 ? 'Team name is required (1 to 30 characters).' : undefined;
  const createdAt = new Date(room.created_at);

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction */}
      <section aria-labelledby="setup-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-pixel text-[11px] uppercase tracking-widest text-brand-navy bg-brand-gold border-2 border-brand-navy px-2 py-0.5">
            STARTUPOLY · ADMIN
          </span>
          <span className="font-pixel text-[11px] uppercase tracking-widest text-brand-navy">
            ROOM {room.code}
          </span>
          <StatusPill status={room.status} size="sm" />
        </div>
        <div>
          <h1 id="setup-heading" className="font-pixel text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Match Setup
          </h1>
          <p className="font-mono text-sm text-brand-navy mt-1 max-w-2xl">
            Review team names and colors below before opening the lobby. Once opened, players can
            enter the room code on their phones.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        {/* Configuration: Team Roster */}
        <PixelCard title="TEAM ROSTER & COLOR ASSIGNMENTS" headerBg="brick" padding="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => {
              const isEditing = editingTeamId === team.id;
              const isColorInUse = (hex: string) =>
                teams.some((t) => t.id !== team.id && t.color.toUpperCase() === hex.toUpperCase());

              return (
                <div
                  key={team.id}
                  className={`border-3 border-brand-navy p-4 shadow-pixel-sm flex flex-col justify-between gap-3 ${
                    isEditing ? 'bg-status-warning-bg' : 'bg-brand-white'
                  }`}
                >
                  {isEditing ? (
                    <form
                      className="flex flex-col gap-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!isSavingTeam) handleSaveTeam(team.id);
                      }}
                    >
                      <div className="flex items-center justify-between border-b-2 border-brand-navy pb-2">
                        <span className="font-pixel text-xs text-brand-navy">
                          EDIT SLOT #{team.slot}
                        </span>
                      </div>

                      <TextField
                        label="Team Name"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        maxLength={30}
                        disabled={isSavingTeam}
                        error={nameError}
                        helperText={`${draftName.length}/30`}
                        autoFocus
                      />

                      <div role="group" aria-label="Select Color">
                        <span className="font-pixel text-[10px] uppercase text-brand-navy block mb-1">
                          Select Color
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {TEAM_COLOR_PALETTE.map((c) => {
                            const inUse = isColorInUse(c.hex);
                            const isSelected = draftColor.toUpperCase() === c.hex.toUpperCase();

                            return (
                              <button
                                type="button"
                                key={c.hex}
                                disabled={inUse || isSavingTeam}
                                onClick={() => setDraftColor(c.hex)}
                                aria-label={`${c.hex}${inUse ? ' (used by another team)' : ''}`}
                                aria-pressed={isSelected}
                                title={inUse ? 'Used by another team' : c.hex}
                                className={`
                                  w-8 h-8 border-2 border-brand-navy cursor-pointer flex items-center justify-center font-pixel text-[9px] text-brand-white
                                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy
                                  ${isSelected ? 'ring-2 ring-brand-navy scale-110 shadow-pixel-sm' : ''}
                                  ${inUse ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105'}
                                `}
                                style={{ backgroundColor: c.hex }}
                              >
                                {isSelected ? '✓' : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <PixelButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isSavingTeam}
                        >
                          CANCEL
                        </PixelButton>
                        <PixelButton type="submit" variant="primary" size="sm" isLoading={isSavingTeam}>
                          SAVE
                        </PixelButton>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-brand-navy pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-pixel text-xs text-brand-navy">
                            SLOT #{team.slot}
                          </span>
                        </div>
                        <PixelButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(team)}
                          disabled={isSavingTeam}
                          aria-label={`Rename team in slot ${team.slot}`}
                          className="py-1 min-h-[36px] text-[10px]"
                        >
                          RENAME
                        </PixelButton>
                      </div>

                      <h3 className="font-pixel text-sm text-brand-navy truncate mb-1">
                        {team.name}
                      </h3>
                      <p className="font-mono text-xs text-neutral-500">
                        Color: {team.color}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PixelCard>

        {/* Summary + primary action */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <PixelCard title="ROOM SUMMARY" headerBg="navy" padding="md">
            <dl className="font-mono text-sm text-brand-navy flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Room code</dt>
                <dd className="font-bold bg-brand-gold px-2 py-0.5 border border-brand-navy">{room.code}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Teams</dt>
                <dd className="font-bold">{room.team_count}</dd>
              </div>
              {!Number.isNaN(createdAt.getTime()) && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-neutral-500">Created</dt>
                  <dd className="font-bold text-right">{createdAt.toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </PixelCard>

          <PixelCard variant="gold" padding="md">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs text-brand-navy">
                Opening the lobby makes the room code active for player phones.
              </p>
              {editingTeamId && (
                <p role="status" className="font-mono text-xs text-status-warning-text font-semibold">
                  ★ A team edit is in progress. Save or cancel it first.
                </p>
              )}
              <PixelButton
                variant="primary"
                size="lg"
                onClick={() => setShowOpenLobbyModal(true)}
                disabled={isSavingTeam || isOpeningLobby}
                className="w-full"
              >
                OPEN LOBBY NOW
              </PixelButton>
            </div>
          </PixelCard>
        </aside>
      </div>

      {/* Confirmation Modal to Open Lobby */}
      <Modal
        isOpen={showOpenLobbyModal}
        onClose={() => setShowOpenLobbyModal(false)}
        title="CONFIRM OPEN LOBBY"
        footer={
          <>
            <PixelButton
              variant="ghost"
              size="md"
              onClick={() => setShowOpenLobbyModal(false)}
              disabled={isOpeningLobby}
            >
              CANCEL
            </PixelButton>
            <PixelButton
              variant="primary"
              size="md"
              onClick={handleOpenLobby}
              isLoading={isOpeningLobby}
            >
              CONFIRM & OPEN LOBBY
            </PixelButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm leading-relaxed text-brand-navy">
            Are you ready to open the lobby for <strong>Room {room.code}</strong>?
          </p>
          <div className="bg-status-warning-bg border-2 border-brand-navy p-3">
            <p className="font-mono text-xs text-status-warning-text">
              ★ Once the lobby opens, the 6-character room code becomes active for player phones.
              Each team can enter their designated 4-digit PIN to connect.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
