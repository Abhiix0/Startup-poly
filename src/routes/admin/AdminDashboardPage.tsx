import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { supabase } from '../../data/client';
import { PixelButton, PixelBrickTile, Modal, PixelLoader, ErrorBanner, StatusPill, useToast } from '../../ui';
import { RoamingCharacter } from '../../ui/pixel';
import { CreateRoomView } from './CreateRoomView';
import { rpcAdminCancelRoom } from '../../data/rpc';

interface ActiveRoomSummary {
  id: string;
  status: string;
  code: string;
  team_count: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { successToast, errorToast } = useToast();

  const [checkingActiveRoom, setCheckingActiveRoom] = useState(true);
  const [activeRoom, setActiveRoom] = useState<ActiveRoomSummary | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [roomCheckError, setRoomCheckError] = useState<string | null>(null);
  const [checkAttempt, setCheckAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function checkCurrentRoom() {
      try {
        let query = supabase
          .from('rooms')
          .select('id, status, code, team_count, created_by')
          .neq('status', 'FINALIZED');

        if (user?.id) {
          query = query.eq('created_by', user.id);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }
        if (data && isMounted) {
          setActiveRoom(data as ActiveRoomSummary);
        } else if (isMounted) {
          setActiveRoom(null);
        }
      } catch (err) {
        console.warn('Failed to check active room:', err);
        if (isMounted) {
          setRoomCheckError('Unable to verify the current match room. Check the connection before creating another room.');
        }
      } finally {
        if (isMounted) {
          setCheckingActiveRoom(false);
        }
      }
    }

    checkCurrentRoom();
    return () => {
      isMounted = false;
    };
  }, [checkAttempt, user?.id]);

  const handleDiscardActiveRoom = async () => {
    if (!activeRoom || isDiscarding) return;
    try {
      setIsDiscarding(true);
      await rpcAdminCancelRoom(activeRoom.id, 'Discarded from admin dashboard');
      successToast(`Match room ${activeRoom.code} discarded.`);
      setActiveRoom(null);
      setDiscardConfirmOpen(false);
    } catch (err: any) {
      errorToast(err?.message || 'Failed to discard room.');
    } finally {
      setIsDiscarding(false);
    }
  };

  if (checkingActiveRoom) {
    return <PixelLoader label="CHECKING MATCH STATE..." delayMs={0} />;
  }

  return (
    <div className="min-h-screen bg-nes-sky overflow-x-clip flex flex-col justify-between">
      {/* Admin Top Navigation */}
      <header className="bg-nes-navy text-white border-b-4 border-nes-navy px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-[0_4px_0px_var(--color-brand-navy)]">
        <div className="min-w-0 flex items-center gap-3">
          <span className="font-pixel text-sm text-nes-gold">STARTUPOLY</span>
          <span className="hidden sm:inline font-mono text-xs text-neutral-200 border-l-2 border-white/20 pl-3">
            ADMIN CONSOLE
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="hidden md:inline font-mono text-xs text-neutral-400">
            {user?.email}
          </span>
          {user?.email && (
            <span className="hidden sm:inline font-pixel text-[10px] text-nes-gold bg-nes-navy border border-brand-gold/40 px-2 py-0.5">
              WORKSPACE: {user.email.split('@')[0].toUpperCase()}
            </span>
          )}
          <Link to="/admin/history">
            <PixelButton variant="ghost" size="sm">
              HISTORY
            </PixelButton>
          </Link>
          <PixelButton variant="danger" size="sm" onClick={() => setLogoutConfirmOpen(true)}>
            LOGOUT
          </PixelButton>
        </div>
      </header>

      {/* Main Container: Either Active Match Panel or Create Room Form */}
      <main className="flex-1 max-w-5xl min-w-0 w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {roomCheckError ? (
          <ErrorBanner
            message={roomCheckError}
            onRetry={() => {
              setRoomCheckError(null);
              setCheckingActiveRoom(true);
              setCheckAttempt((attempt) => attempt + 1);
            }}
          />
        ) : activeRoom ? (
          <div className="bg-brand-white border-4 border-brand-navy p-6 sm:p-8 shadow-pixel-lg flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand-navy pb-4">
              <div className="flex items-center gap-3">
                <span className="font-pixel text-xs text-brand-navy bg-brand-gold border-2 border-brand-navy px-3 py-1 font-bold">
                  ROOM {activeRoom.code}
                </span>
                <StatusPill status={activeRoom.status} size="sm" />
              </div>
              <span className="font-mono text-xs text-neutral-500 font-bold tracking-wide uppercase">
                ACTIVE MATCH IN PROGRESS
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-pixel text-xl sm:text-2xl text-brand-navy font-black tracking-tight leading-snug">
                Tournament Match Currently Open
              </h1>
              <p className="font-mono text-sm text-neutral-700 max-w-2xl leading-relaxed">
                Room <strong>{activeRoom.code}</strong> is currently in{' '}
                <span className="font-bold underline">{activeRoom.status}</span> stage with {activeRoom.team_count} teams.
                You can resume managing this match or discard it to start a new game.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-brand-navy/20">
              <Link to={`/admin/room/${activeRoom.id}`}>
                <PixelButton variant="primary" size="lg" className="font-pixel text-xs">
                  RESUME MATCH CONSOLE →
                </PixelButton>
              </Link>
              <PixelButton
                variant="danger"
                size="lg"
                onClick={() => setDiscardConfirmOpen(true)}
                className="font-pixel text-xs"
              >
                ✕ DISCARD MATCH
              </PixelButton>
            </div>
          </div>
        ) : (
          <CreateRoomView />
        )}
      </main>

      {/* Mascot Mario Patrols Ground */}
      <div className="w-full relative h-14 overflow-x-clip pointer-events-none select-none anim-mario-land">
        <div className="absolute inset-x-0 bottom-0 pointer-events-none">
          <RoamingCharacter size={46} variant="admin" />
        </div>
      </div>

      {/* Brick Ground Base */}
      <PixelBrickTile hasGrass={true} className="h-8" />

      {/* Discard Active Match Confirmation Modal */}
      <Modal
        isOpen={discardConfirmOpen}
        onClose={() => setDiscardConfirmOpen(false)}
        title="DISCARD CURRENT MATCH"
        footer={
          <>
            <PixelButton
              variant="ghost"
              size="md"
              onClick={() => setDiscardConfirmOpen(false)}
              disabled={isDiscarding}
            >
              KEEP MATCH
            </PixelButton>
            <PixelButton
              variant="danger"
              size="md"
              onClick={handleDiscardActiveRoom}
              isLoading={isDiscarding}
            >
              YES, DISCARD MATCH
            </PixelButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm leading-relaxed text-brand-navy">
            Are you sure you want to discard <strong>Room {activeRoom?.code}</strong>?
          </p>
          <div className="bg-status-danger-bg border-2 border-brand-navy p-3 text-xs text-status-danger-dark font-mono">
            ⚠ All connected player devices will be released and the match will be closed. You will be able to create a fresh match immediately.
          </div>
        </div>
      </Modal>

      {/* Logout confirm — requires explicit confirmation before calling logout() */}
      <Modal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="CONFIRM LOGOUT"
        maxWidth="sm"
        footer={
          <>
            <PixelButton variant="ghost" size="sm" onClick={() => setLogoutConfirmOpen(false)}>
              CANCEL
            </PixelButton>
            <PixelButton
              variant="danger"
              size="sm"
              onClick={async () => {
                setLogoutConfirmOpen(false);
                await logout();
              }}
            >
              LOG OUT
            </PixelButton>
          </>
        }
      >
        <p className="font-mono text-sm text-nes-navy">
          Are you sure you want to log out of the admin console?
        </p>
      </Modal>
    </div>
  );
};
