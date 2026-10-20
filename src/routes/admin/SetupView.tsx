import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PixelButton, PixelCard, StatusPill, TextField, Modal, useToast } from '../../ui';
import { TEAM_COLOR_PALETTE } from '../../domain/teams';
import { rpcAdminUpdateTeamConfig, rpcAdminOpenLobby, rpcAdminCancelRoom, rpcRoomStatus, AdminRoomSnapshot } from '../../data/rpc';
import { lifecycleAlreadyDone } from '../../lib/lifecycle';

interface SetupViewProps {
  snapshot: AdminRoomSnapshot;
  onRefetch: () => Promise<void>;
}

export const SetupView: React.FC<SetupViewProps> = ({ snapshot, onRefetch }) => {
  const { room, teams } = snapshot;
  const navigate = useNavigate();

  // Local state for editing teams
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState('');
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  // Modal for Open Lobby confirmation
  const [showOpenLobbyModal, setShowOpenLobbyModal] = useState(false);
  const [isOpeningLobby, setIsOpeningLobby] = useState(false);

  // Modal for Discard/Cancel match confirmation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleCancelRoom = async () => {
    if (isCancelling) return;
    try {
      setIsCancelling(true);
      await rpcAdminCancelRoom(room.id, 'Setup discarded by organizer');
      successToast('Match room discarded.');
      setShowCancelModal(false);
      navigate('/admin');
    } catch (err: any) {
      errorToast(err.message || 'Failed to discard room.');
    } finally {
      setIsCancelling(false);
    }
  };

  const nameError =
    editingTeamId && draftName.trim().length === 0 ? 'Team name is required (1 to 30 characters).' : undefined;
  const createdAt = new Date(room.created_at);

  return (
    <div className="flex flex-col gap-6">
      {/* Structured Breadcrumbs & Header Bar */}
      <section aria-labelledby="setup-heading" className="bg-brand-white border-3 border-brand-navy p-4 shadow-pixel flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand-navy pb-3">
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="font-pixel text-xs text-brand-navy hover:text-brand-brick hover:underline flex items-center gap-1 font-bold"
            >
              ◄ CONSOLE
            </Link>
            <span className="text-neutral-400 font-mono">/</span>
            <span className="font-pixel text-xs text-brand-navy bg-brand-gold border border-brand-navy px-2 py-0.5">
              ROOM {room.code}
            </span>
            <StatusPill status={room.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-status-danger-dark border-status-danger-base hover:bg-status-danger-bg"
              title="Discard this match room and start over"
            >
              ✕ DISCARD MATCH
            </PixelButton>
          </div>
        </div>

        <div>
          <h1 id="setup-heading" className="font-pixel text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
            Match Setup & Team Roster
          </h1>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 mt-0.5">
            Review and customize team names and colors below. When ready, open the lobby so players can connect their phones.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveTeam(team.id);
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between border-b-2 border-brand-navy pb-2">
                        <span className="font-pixel text-xs text-brand-navy font-bold">
                          EDITING SLOT #{team.slot}
                        </span>
                        <span
                          className="w-4 h-4 rounded-sm border-2 border-brand-navy"
                          style={{ backgroundColor: draftColor }}
                        />
                      </div>

                      <TextField
                        id={`team-name-${team.id}`}
                        label="Team Name"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        error={nameError}
                        maxLength={30}
                        required
                        disabled={isSavingTeam}
                      />

                      <div>
                        <label className="font-pixel text-[11px] uppercase tracking-wider text-brand-navy block mb-1">
                          Select Color
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2 bg-brand-white border-2 border-brand-navy">
                          {TEAM_COLOR_PALETTE.map((pal) => {
                            const taken = isColorInUse(pal.hex);
                            const selected = draftColor.toUpperCase() === pal.hex.toUpperCase();
                            return (
                              <button
                                key={pal.hex}
                                type="button"
                                onClick={() => !taken && setDraftColor(pal.hex)}
                                disabled={taken || isSavingTeam}
                                title={`${pal.name}${taken ? ' (in use)' : ''}`}
                                className={`w-6 h-6 rounded-sm border-2 transition-transform ${
                                  selected
                                    ? 'border-brand-navy scale-110 shadow-pixel-sm z-10'
                                    : 'border-brand-navy/60 hover:scale-105'
                                } ${taken ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{ backgroundColor: pal.hex }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-brand-navy/20">
                        <PixelButton
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isSavingTeam}
                          className="flex-1"
                        >
                          CANCEL
                        </PixelButton>
                        <PixelButton
                          variant="primary"
                          size="sm"
                          type="submit"
                          isLoading={isSavingTeam}
                          disabled={!draftName.trim()}
                          className="flex-1"
                        >
                          SAVE
                        </PixelButton>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-brand-navy pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-sm border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]"
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
              <p className="font-mono text-xs text-brand-navy font-bold">
                Ready to invite players? Open the lobby to activate the room code.
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
                disabled={isSavingTeam || isOpeningLobby || isCancelling}
                className="w-full font-pixel text-sm py-3"
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

      {/* Confirmation Modal to Discard Room */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="DISCARD / CANCEL MATCH"
        footer={
          <>
            <PixelButton
              variant="ghost"
              size="md"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              KEEP MATCH
            </PixelButton>
            <PixelButton
              variant="danger"
              size="md"
              onClick={handleCancelRoom}
              isLoading={isCancelling}
            >
              YES, DISCARD MATCH
            </PixelButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm leading-relaxed text-brand-navy">
            Are you sure you want to discard <strong>Room {room.code}</strong>?
          </p>
          <div className="bg-status-danger-bg border-2 border-brand-navy p-3 text-xs text-status-danger-dark font-mono">
            ⚠ This will close the setup session and return you to the Admin Console to create a fresh match.
          </div>
        </div>
      </Modal>
    </div>
  );
};
