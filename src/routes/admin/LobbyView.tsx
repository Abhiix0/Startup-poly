import React, { useState } from 'react';
import { PixelButton, PixelCard, StatusPill, Modal, useToast } from '../../ui';
import { rpcAdminReleaseTeam, rpcAdminStartGame, rpcRoomStatus, AdminRoomSnapshot } from '../../data/rpc';
import { lifecycleAlreadyDone } from '../../lib/lifecycle';

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
    if (!releasingTeam || isReleasing) return;
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
    if (isStarting) return;
    try {
      setIsStarting(true);
      await rpcAdminStartGame(room.id, force);
      successToast('Tournament match STARTED! 50-minute clock is ticking.');
      setShowStartModal(false);
      await onRefetch();
    } catch (err: any) {
      if (await lifecycleAlreadyDone(err, room.id, ['ACTIVE', 'TIME_EXPIRED'], rpcRoomStatus)) {
        successToast('Tournament match STARTED! 50-minute clock is ticking.');
        setShowStartModal(false);
        await onRefetch();
        return;
      }
      if (err.code === 'TEAMS_NOT_JOINED') {
        errorToast('Some teams have not claimed a slot yet. Use Force Start to proceed.');
      } else {
        errorToast(err.message || 'Failed to start game.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction */}
      <section aria-labelledby="lobby-heading" className="flex flex-col gap-3">
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
          <h1 id="lobby-heading" className="font-pixel text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Team Lobby
          </h1>
          <p className="font-mono text-sm text-brand-navy mt-1 max-w-2xl">
            Teams join with the room code and their PIN. Start the match when you are ready.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        {/* Team roster */}
        <PixelCard title="TEAM ROSTER & PINS" headerBg="brick" padding="md">
          {teams.length === 0 ? (
            <p className="font-mono text-sm text-brand-navy">No teams in this room.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className={`border-3 border-brand-navy p-4 shadow-pixel-sm flex flex-col gap-3 min-w-0 ${
                    team.claimed ? 'bg-status-success-bg' : 'bg-brand-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b-2 border-brand-navy pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]"
                        style={{ backgroundColor: team.color }}
                        aria-hidden="true"
                      />
                      <span className="font-pixel text-xs text-brand-navy">SLOT #{team.slot}</span>
                    </div>
                    <span
                      className={`font-pixel text-[10px] uppercase px-2 py-0.5 border-2 border-brand-navy ${
                        team.claimed
                          ? 'bg-status-success-bg text-status-success-dark'
                          : 'bg-status-warning-bg text-status-warning-text'
                      }`}
                    >
                      {team.claimed ? 'CLAIMED' : 'UNCLAIMED'}
                    </span>
                  </div>

                  <h3 className="font-pixel text-sm text-brand-navy truncate" title={team.name}>
                    {team.name}
                  </h3>

                  <div className="bg-neutral-50 border-2 border-brand-navy p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-pixel text-[9px] text-brand-navy font-bold block uppercase">
                        SECRET PIN
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
                        disabled={isStarting || isReleasing}
                        className="text-[10px] min-h-[44px] py-1 px-3"
                        title="Disconnect this team's device"
                      >
                        RELEASE
                      </PixelButton>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PixelCard>

        {/* Summary + primary action */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <PixelCard title="ROOM CODE" headerBg="navy" variant="cream" padding="md">
            <div className="flex flex-col gap-2 items-center text-center">
              <div className="bg-brand-gold border-4 border-brand-navy shadow-pixel-lg px-4 py-3 max-w-full">
                <span className="font-mono text-4xl sm:text-5xl font-black tracking-[0.2em] text-brand-navy select-all break-all">
                  {room.code}
                </span>
              </div>
              <p className="font-mono text-xs text-brand-navy">
                Players go to <strong className="underline">/join</strong>, enter this code, pick a slot and enter the PIN.
              </p>
            </div>
          </PixelCard>

          <PixelCard title="CLAIM STATUS" headerBg="navy" padding="md">
            <dl className="font-mono text-sm text-brand-navy flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Total teams</dt>
                <dd className="font-bold">{teams.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Claimed</dt>
                <dd className="font-bold">{joinedTeams.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Unclaimed</dt>
                <dd className="font-bold">{unjoinedTeams.length}</dd>
              </div>
            </dl>
            <p className="font-mono text-[11px] text-neutral-500 mt-3">
              Claimed means a device entered the PIN. It does not show who is online.
            </p>
          </PixelCard>

          <PixelCard variant="gold" padding="md">
            <div className="flex flex-col gap-3">
              <p role="status" className="font-mono text-xs text-brand-navy">
                {allJoined
                  ? 'Every team has claimed a slot.'
                  : `${unjoinedTeams.length} of ${teams.length} teams have not claimed a slot.`}
              </p>
              <PixelButton
                variant="primary"
                size="lg"
                onClick={() => setShowStartModal(true)}
                disabled={isStarting || isReleasing}
                className="w-full"
              >
                START MATCH
              </PixelButton>
            </div>
          </PixelCard>
        </aside>
      </div>

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
              All <strong>{teams.length} teams</strong> have claimed their slot.
            </p>
            <div className="bg-status-success-bg border-2 border-brand-navy p-3 text-xs text-status-success-dark font-mono">
              ★ Starting the match will activate the 50-minute tournament clock for all players and project the live scoreboard.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-sm leading-relaxed text-brand-navy">
              Warning: <strong>{unjoinedTeams.length} out of {teams.length} teams</strong> have not claimed a slot yet:
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
              You can wait for players to connect, or click <strong>Start anyway (Force)</strong> to begin immediately. Unclaimed teams can still join later with their PIN.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
