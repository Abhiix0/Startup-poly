import React, { useState } from 'react';
import { PixelButton, PixelCard, TextField, Modal, useToast } from '../../ui';
import { TEAM_COLOR_PALETTE } from '../../domain/teams';
import { rpcAdminUpdateTeamConfig, rpcAdminOpenLobby, AdminRoomSnapshot } from '../../data/rpc';

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
      errorToast(err.message || 'Failed to open lobby.');
    } finally {
      setIsOpeningLobby(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Status Alert Card */}
      <PixelCard title="ROOM INITIALIZED • PRE-LOBBY SETUP" headerBg="navy" padding="md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-xs text-[#102040]">ROOM CODE:</span>
              <span className="font-mono font-bold text-sm bg-[#FFCC00] px-2 py-0.5 border border-[#102040]">
                {room.code}
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                ({room.team_count} Teams)
              </span>
            </div>
            <p className="font-mono text-xs text-[#64748B]">
              Review team names and colors below before opening the lobby. Once opened, players can
              enter the room code on their phones.
            </p>
          </div>

          <PixelButton
            variant="primary"
            size="lg"
            onClick={() => setShowOpenLobbyModal(true)}
            className="flex-shrink-0"
          >
            OPEN LOBBY NOW
          </PixelButton>
        </div>
      </PixelCard>

      {/* Team Roster Grid */}
      <PixelCard title="TEAM ROSTER & COLOR ASSIGNMENTS" headerBg="brick" padding="md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const isEditing = editingTeamId === team.id;
            const isColorInUse = (hex: string) =>
              teams.some((t) => t.id !== team.id && t.color.toUpperCase() === hex.toUpperCase());

            return (
              <div
                key={team.id}
                className="border-3 border-[#102040] bg-white p-4 shadow-[2px_2px_0px_#102040] flex flex-col justify-between gap-3"
              >
                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b-2 border-[#102040] pb-2">
                      <span className="font-pixel text-xs text-[#102040]">
                        EDIT SLOT #{team.slot}
                      </span>
                    </div>

                    <TextField
                      label="Team Name"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      maxLength={30}
                      disabled={isSavingTeam}
                    />

                    <div>
                      <label className="font-pixel text-[10px] uppercase text-[#102040] block mb-1">
                        Select Color
                      </label>
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
                              className={`
                                w-7 h-7 border-2 border-[#102040] cursor-pointer flex items-center justify-center font-pixel text-[9px] text-white
                                ${isSelected ? 'ring-2 ring-[#102040] scale-110 shadow-[2px_2px_0px_#102040]' : ''}
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
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSavingTeam}
                      >
                        CANCEL
                      </PixelButton>
                      <PixelButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveTeam(team.id)}
                        isLoading={isSavingTeam}
                      >
                        SAVE
                      </PixelButton>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-[#102040] pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 border-2 border-[#102040] shadow-[1px_1px_0px_#102040]"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="font-pixel text-xs text-[#102040]">
                          SLOT #{team.slot}
                        </span>
                      </div>
                      <PixelButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(team)}
                        className="py-1 min-h-[36px] text-[10px]"
                      >
                        RENAME
                      </PixelButton>
                    </div>

                    <h3 className="font-pixel text-sm text-[#102040] truncate mb-1">
                      {team.name}
                    </h3>
                    <p className="font-mono text-xs text-[#64748B]">
                      Color: {team.color}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PixelCard>

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
          <p className="font-mono text-sm leading-relaxed text-[#102040]">
            Are you ready to open the lobby for <strong>Room {room.code}</strong>?
          </p>
          <div className="bg-[#FFFBEB] border-2 border-[#102040] p-3">
            <p className="font-mono text-xs text-[#92400E]">
              ★ Once the lobby opens, the 6-character room code becomes active for player phones.
              Each team can enter their designated 4-digit PIN to connect.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
