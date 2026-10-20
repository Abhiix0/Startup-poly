import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PixelButton, PixelCard, StatusPill, Modal, useToast } from '../../ui';
import { rpcAdminReleaseTeam, rpcAdminStartGame, rpcAdminCancelRoom, rpcRoomStatus, AdminRoomSnapshot } from '../../data/rpc';
import { lifecycleAlreadyDone } from '../../lib/lifecycle';

interface LobbyViewProps {
  snapshot: AdminRoomSnapshot;
  onRefetch: () => Promise<void>;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ snapshot, onRefetch }) => {
  const { room, teams } = snapshot;
  const navigate = useNavigate();

  // Release modal state
  const [releasingTeam, setReleasingTeam] = useState<(typeof teams)[0] | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  // Start game modal state
  const [showStartModal, setShowStartModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Cancel room modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Copy feedback state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { successToast, errorToast } = useToast();

  const joinedTeams = teams.filter((t) => t.claimed);
  const unjoinedTeams = teams.filter((t) => !t.claimed);
  const allJoined = unjoinedTeams.length === 0;
  const progressPercent = Math.round((joinedTeams.length / (teams.length || 1)) * 100);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      successToast(`Room code ${room.code} copied!`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      errorToast('Failed to copy code to clipboard.');
    }
  };

  const handleCopyLink = async () => {
    try {
      const joinUrl = `${window.location.origin}/join?code=${room.code}`;
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      successToast('Direct join link copied! Share with players to connect.');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      errorToast('Failed to copy join link.');
    }
  };

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

  const handleCancelRoom = async () => {
    if (isCancelling) return;
    try {
      setIsCancelling(true);
      await rpcAdminCancelRoom(room.id, 'Match cancelled by organizer');
      successToast('Match room cancelled successfully.');
      setShowCancelModal(false);
      navigate('/admin');
    } catch (err: any) {
      errorToast(err.message || 'Failed to cancel room.');
    } finally {
      setIsCancelling(false);
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
      {/* Structured Breadcrumbs & Top Bar */}
      <section aria-labelledby="lobby-heading" className="bg-brand-white border-3 border-brand-navy p-4 shadow-pixel flex flex-col gap-3">
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 id="lobby-heading" className="font-pixel text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
              Match Lobby & Team Roster
            </h1>
            <p className="font-mono text-xs sm:text-sm text-neutral-600 mt-0.5">
              Players go to <strong className="text-brand-navy underline">startupoly.vercel.app/join</strong>, enter room code <strong>{room.code}</strong>, select their team slot, and enter the secret PIN.
            </p>
          </div>

          {/* Quick Copy Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <PixelButton
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              className="text-xs flex items-center gap-1"
            >
              <span>{copiedCode ? '✓' : '📋'}</span>
              <span>{copiedCode ? 'COPIED' : 'COPY CODE'}</span>
            </PixelButton>
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs flex items-center gap-1"
            >
              <span>{copiedLink ? '✓' : '🔗'}</span>
              <span>{copiedLink ? 'LINK COPIED' : 'JOIN LINK'}</span>
            </PixelButton>
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="bg-neutral-50 border-2 border-brand-navy p-3 flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-brand-navy">
            <span>Team Connection Readiness</span>
            <span>{joinedTeams.length} of {teams.length} Teams Connected ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-neutral-200 h-3 border border-brand-navy overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${allJoined ? 'bg-status-success-base' : 'bg-brand-gold'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Grid: Roster + Match Controls Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* Team Roster List */}
        <PixelCard title="TEAM SLOTS & SECRET PINS" headerBg="brick" padding="md">
          {teams.length === 0 ? (
            <p className="font-mono text-sm text-brand-navy">No teams configured in this room.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className={`border-3 border-brand-navy p-4 shadow-pixel-sm flex flex-col justify-between gap-3 min-w-0 transition-colors ${
                    team.claimed ? 'bg-status-success-bg' : 'bg-brand-white'
                  }`}
                >
                  {/* Team Card Header */}
                  <div className="flex items-center justify-between gap-2 border-b-2 border-brand-navy pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-5 h-5 border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)] shrink-0"
                        style={{ backgroundColor: team.color }}
                        aria-hidden="true"
                      />
                      <span className="font-pixel text-xs text-brand-navy">SLOT #{team.slot}</span>
                    </div>

                    <span
                      className={`font-pixel text-[10px] uppercase px-2 py-0.5 border-2 border-brand-navy shrink-0 ${
                        team.claimed
                          ? 'bg-status-success-bg text-status-success-dark font-black'
                          : 'bg-status-warning-bg text-status-warning-text'
                      }`}
                    >
                      {team.claimed ? '✓ CLAIMED' : 'UNCLAIMED'}
                    </span>
                  </div>

                  {/* Team Name */}
                  <h3 className="font-pixel text-base text-brand-navy truncate" title={team.name}>
                    {team.name}
                  </h3>

                  {/* Secret PIN Box & Release Action */}
                  <div className="bg-neutral-50 border-2 border-brand-navy p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-pixel text-[9px] text-neutral-500 font-bold block uppercase tracking-wider">
                        SECRET PIN
                      </span>
                      <span className="font-mono font-black text-2xl text-brand-navy tracking-[0.2em]">
                        {team.pin || '••••'}
                      </span>
                    </div>

                    {team.claimed ? (
                      <PixelButton
                        variant="danger"
                        size="sm"
                        onClick={() => setReleasingTeam(team)}
                        disabled={isStarting || isReleasing}
                        className="text-[10px] py-1 px-3 min-h-[36px]"
                        title="Disconnect this team's device"
                      >
                        RELEASE
                      </PixelButton>
                    ) : (
                      <span className="font-mono text-[11px] text-neutral-400 italic">
                        Waiting...
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PixelCard>

        {/* Sidebar: Match Controls & Actions */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          {/* Room Code Card */}
          <PixelCard title="ROOM CODE" headerBg="navy" variant="cream" padding="md">
            <div className="flex flex-col gap-3 items-center text-center">
              <div className="bg-brand-gold border-4 border-brand-navy shadow-pixel-lg px-4 py-3 w-full">
                <span className="font-mono text-4xl sm:text-5xl font-black tracking-[0.25em] text-brand-navy select-all break-all block">
                  {room.code}
                </span>
              </div>
              <p className="font-mono text-xs text-brand-navy leading-relaxed">
                Project this code on the main screen for all participating teams.
              </p>
            </div>
          </PixelCard>

          {/* Claim Summary Card */}
          <PixelCard title="CLAIM STATUS" headerBg="navy" padding="md">
            <dl className="font-mono text-sm text-brand-navy flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Total teams</dt>
                <dd className="font-bold">{teams.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Claimed</dt>
                <dd className="font-bold text-status-success-dark">{joinedTeams.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-500">Unclaimed</dt>
                <dd className="font-bold text-status-warning-text">{unjoinedTeams.length}</dd>
              </div>
            </dl>
          </PixelCard>

          {/* Launch Match Action Card */}
          <PixelCard variant={allJoined ? 'gold' : 'white'} padding="md">
            <div className="flex flex-col gap-3">
              <p role="status" className="font-mono text-xs text-brand-navy font-bold">
                {allJoined
                  ? '★ All teams are connected and ready!'
                  : `Waiting for ${unjoinedTeams.length} of ${teams.length} teams to enter PIN.`}
              </p>

              <PixelButton
                variant={allJoined ? 'primary' : 'secondary'}
                size="lg"
                onClick={() => setShowStartModal(true)}
                disabled={isStarting || isReleasing || isCancelling}
                className="w-full font-pixel text-sm py-3"
              >
                START MATCH
              </PixelButton>

              {!allJoined && (
                <p className="font-mono text-[11px] text-neutral-500 text-center">
                  Recommended: Wait until all teams connect. Force start is available if needed.
                </p>
              )}
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

      {/* Confirmation Modal to Cancel / Discard Match Room */}
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
            ⚠ This will close the lobby, release all {joinedTeams.length} connected devices, and return you to the Admin Console to create a fresh match.
          </div>
        </div>
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
