import React, { useState } from 'react';
import { PixelButton, PixelCard, StatusPill, Modal, useToast } from '../../ui';
import { rpcAdminReleaseTeam, rpcAdminStartGame, AdminRoomSnapshot } from '../../data/rpc';

interface LobbyViewProps {
  snapshot: AdminRoomSnapshot;
  onRefetch: () => Promise<void>;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ snapshot, onRefetch }) => {
  const { room, teams } = snapshot;

  // Release modal state
  const [releasingTeam, setReleasingTeam] = useState<(typeof teams)[0] | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  // Start game modal state
  const [showStartModal, setShowStartModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const { successToast, errorToast } = useToast();

  const joinedTeams = teams.filter((t) => t.claimed);
  const unjoinedTeams = teams.filter((t) => !t.claimed);
  const allJoined = unjoinedTeams.length === 0;

  const handleRelease = async () => {
    if (!releasingTeam) return;
    try {
      setIsReleasing(true);
      await rpcAdminReleaseTeam(releasingTeam.id);
      successToast(`Slot #${releasingTeam.slot} (${releasingTeam.name}) released.`);
      setReleasingTeam(null);
      await onRefetch();
    } catch (err: any) {
      errorToast(err.message || 'Failed to release team slot.');
    } finally {
      setIsReleasing(false);
    }
  };

  const handleStartGame = async (force: boolean) => {
    try {
      setIsStarting(true);
      await rpcAdminStartGame(room.id, force);
      successToast('Tournament match STARTED! 50-minute clock is ticking.');
      setShowStartModal(false);
      await onRefetch();
    } catch (err: any) {
      if (err.code === 'TEAMS_NOT_JOINED') {
        errorToast('Some teams have not joined yet. Use Force Start to proceed.');
      } else {
        errorToast(err.message || 'Failed to start game.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 3-Meter Projector Hero Card */}
      <PixelCard
        title="LIVE TOURNAMENT LOBBY • PROJECTOR VIEW"
        headerBg="navy"
        variant="cream"
        padding="lg"
        className="text-center"
      >
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <span className="font-pixel text-xs sm:text-sm uppercase tracking-widest text-brand-navy font-bold">
            ROOM CODE TO JOIN ON PHONES
          </span>

          {/* Huge 3-meter readable room code */}
          <div className="my-2 bg-brand-gold border-4 border-brand-navy shadow-pixel-lg px-8 py-4 sm:py-6 inline-block">
            <span className="font-mono text-5xl sm:text-7xl lg:text-8xl font-black tracking-[0.25em] text-brand-navy select-all">
              {room.code}
            </span>
          </div>

          <p className="font-mono text-xs sm:text-sm text-brand-navy font-semibold mt-1">
            Players navigate to <strong className="underline">/join</strong>, enter the code above, select their slot, and input their PIN
          </p>
        </div>

        {/* Live Joined Tracker Bar */}
        <div className="mt-4 pt-4 border-t-3 border-brand-navy flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs sm:text-sm text-brand-navy">
              STATUS:
            </span>
            <span className={`font-pixel text-xs sm:text-sm px-3 py-1 border-2 border-brand-navy ${allJoined ? 'bg-status-success-bg text-status-success-dark' : 'bg-status-warning-bg text-status-warning-text'}`}>
              {joinedTeams.length} / {teams.length} TEAMS CONNECTED
            </span>
          </div>

          <PixelButton
            variant={allJoined ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => setShowStartModal(true)}
            className="w-full sm:w-auto"
          >
            {allJoined ? 'START GAME (50:00)' : 'START GAME...'}
          </PixelButton>
        </div>
      </PixelCard>

      {/* Team Cards Grid with PINs and Connection Status */}
      <PixelCard title="TEAM CONNECTIONS & SECRET PINS" headerBg="brick" padding="md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`
                border-3 border-brand-navy p-4 shadow-[3px_3px_0px_var(--color-brand-navy)] flex flex-col justify-between gap-3
                ${team.claimed ? 'bg-status-success-bg' : 'bg-brand-white'}
              `}
            >
              {/* Header: Slot & Connection Pill */}
              <div className="flex items-center justify-between border-b-2 border-brand-navy pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="font-pixel text-xs text-brand-navy">
                    SLOT #{team.slot}
                  </span>
                </div>

                <StatusPill
                  status={team.claimed ? 'ACTIVE' : 'WAITING'}
                  size="sm"
                  pulse={!team.claimed}
                />
              </div>

              {/* Team Name */}
              <div>
                <h3 className="font-pixel text-sm text-brand-navy truncate mb-1">
                  {team.name}
                </h3>
              </div>

              {/* PIN and Release Action */}
              <div className="bg-neutral-50 border-2 border-brand-navy p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-pixel text-[9px] text-brand-navy font-bold block uppercase">
                    SECRET PIN:
                  </span>
                  <span className="font-mono font-extrabold text-xl text-brand-navy tracking-widest">
                    {team.pin || '••••'}
                  </span>
                </div>

                {team.claimed && (
                  <PixelButton
                    variant="danger"
                    size="sm"
                    onClick={() => setReleasingTeam(team)}
                    className="text-[10px] min-h-[44px] py-1 px-3"
                    title="Disconnect this team's device"
                  >
                    RELEASE
                  </PixelButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </PixelCard>

      {/* Confirmation Modal to Release Team Device */}
      <Modal
        isOpen={Boolean(releasingTeam)}
        onClose={() => setReleasingTeam(null)}
        title="RELEASE TEAM CONNECTION"
        footer={
          <>
            <PixelButton
              variant="ghost"
              size="md"
              onClick={() => setReleasingTeam(null)}
              disabled={isReleasing}
            >
              CANCEL
            </PixelButton>
            <PixelButton
              variant="danger"
              size="md"
              onClick={handleRelease}
              isLoading={isReleasing}
            >
              RELEASE DEVICE
            </PixelButton>
          </>
        }
      >
        {releasingTeam && (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-sm leading-relaxed text-brand-navy">
              Are you sure you want to disconnect the active device for{' '}
              <strong>Slot #{releasingTeam.slot} ({releasingTeam.name})</strong>?
            </p>
            <div className="bg-status-danger-bg border-2 border-brand-navy p-3 text-xs text-status-danger-dark font-mono">
              ⚠ The current phone session will be invalidated. The team will need to re-enter their PIN ({releasingTeam.pin}) to reconnect.
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal to Start Game */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title={allJoined ? 'CONFIRM START GAME' : 'UNJOINED TEAMS WARNING'}
        footer={
          <>
            <PixelButton
              variant="ghost"
              size="md"
              onClick={() => setShowStartModal(false)}
              disabled={isStarting}
            >
              CANCEL
            </PixelButton>
            {allJoined ? (
              <PixelButton
                variant="primary"
                size="md"
                onClick={() => handleStartGame(false)}
                isLoading={isStarting}
              >
                START 50:00 MATCH
              </PixelButton>
            ) : (
              <PixelButton
                variant="danger"
                size="md"
                onClick={() => handleStartGame(true)}
                isLoading={isStarting}
              >
                START ANYWAY (FORCE)
              </PixelButton>
            )}
          </>
        }
      >
        {allJoined ? (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-sm leading-relaxed text-brand-navy">
              All <strong>{teams.length} teams</strong> have connected their phones!
            </p>
            <div className="bg-status-success-bg border-2 border-brand-navy p-3 text-xs text-status-success-dark font-mono">
              ★ Starting the match will activate the 50-minute tournament clock for all players and project the live scoreboard.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-sm leading-relaxed text-brand-navy">
              Warning: <strong>{unjoinedTeams.length} out of {teams.length} teams</strong> have not connected yet:
            </p>

            <div className="bg-status-danger-bg border-2 border-brand-navy p-3 flex flex-col gap-1.5">
              {unjoinedTeams.map((t) => (
                <div key={t.id} className="flex items-center gap-2 font-mono text-xs text-status-danger-dark font-bold">
                  <span
                    className="w-3 h-3 border border-brand-navy"
                    style={{ backgroundColor: t.color }}
                  />
                  <span>Slot #{t.slot}: {t.name} (PIN: {t.pin})</span>
                </div>
              ))}
            </div>

            <p className="font-mono text-xs text-neutral-500">
              You can wait for players to connect, or click <strong>Start anyway (Force)</strong> to begin immediately. Unconnected teams can still join later with their PIN.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
