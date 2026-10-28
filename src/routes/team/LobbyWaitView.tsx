import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelCoin, PixelMushroom } from '../../ui/pixel';
import { PixelButton, Modal, useToast } from '../../ui';
import { formatINR } from '../../lib/format';
import { TeamStateResponse, rpcLeaveTeam } from '../../data/rpc';
import { Panel, Metric } from './TeamScene';

interface LobbyWaitViewProps {
  state: TeamStateResponse;
}

export const LobbyWaitView: React.FC<LobbyWaitViewProps> = ({ state }) => {
  const { team } = state;
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveTeam = async () => {
    try {
      setIsLeaving(true);
      await rpcLeaveTeam();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('startupoly_active_team_state');
        localStorage.removeItem('startupoly_active_team_claim');
      }
      successToast('Disconnected from team slot.');
      navigate('/join', {
        state: { notice: `Disconnected from ${team.name}. You can now select a different team.` },
        replace: true,
      });
    } catch (err: any) {
      errorToast(err?.message || 'Failed to leave team.');
    } finally {
      setIsLeaving(false);
      setShowLeaveModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Central Waiting Room Status Card */}
      <Panel label="Match Lobby" className="flex flex-col items-center text-center gap-3 py-5 sm:py-7">
        <div className="relative">
          <PixelMushroom size={52} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success-base opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success-base" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 font-pixel text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-navy bg-brand-gold border-2 border-brand-navy px-3 py-1 shadow-[2px_2px_0px_var(--color-brand-navy)]">
          <span>⏳</span>
          <span>LOBBY · MATCH NOT STARTED</span>
        </div>

        <h1 className="font-sans font-black text-xl sm:text-2xl text-brand-navy uppercase tracking-tight leading-snug">
          Waiting for Host to Launch
        </h1>

        <p className="font-mono text-xs sm:text-sm text-neutral-700 max-w-md leading-relaxed px-2">
          Your device is securely connected to <strong>{team.name}</strong>.
          The 50-minute tournament clock will begin when the organizer launches the match.
        </p>

        <div className="inline-flex items-center gap-2 rounded-md border-2 border-brand-navy bg-neutral-50 px-4 py-2 mt-1 shadow-pixel-sm">
          <span
            aria-hidden="true"
            className="w-4 h-4 rounded-sm border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]"
            style={{ backgroundColor: team.color }}
          />
          <span className="font-pixel text-xs sm:text-sm font-bold text-brand-navy">
            {team.name}
          </span>
        </div>

        {/* Change Slot / Leave Button */}
        <div className="pt-2">
          <PixelButton
            variant="ghost"
            size="sm"
            onClick={() => setShowLeaveModal(true)}
            className="text-xs text-neutral-600 hover:text-status-danger-dark border-neutral-300 hover:border-status-danger-base"
          >
            ◄ LEAVE TEAM / CHANGE SLOT
          </PixelButton>
        </div>
      </Panel>

      {/* Starting Allocation Preview */}
      <div className="border-2 border-brand-navy bg-brand-white p-3.5 shadow-pixel-sm">
        <h2 className="font-pixel text-[10px] sm:text-[11px] font-bold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>💼</span>
          <span>Starting Allocation (Unlocks on Match Start)</span>
        </h2>
        <div>
          <Metric
            label="Initial Cash"
            value={formatINR(team.cash)}
            valueClass="text-status-success-dark font-extrabold"
            className="bg-neutral-50"
            badge={<PixelCoin size={22} />}
          />
        </div>
      </div>

      {/* Leave Team Confirmation Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="LEAVE TEAM SLOT"
        footer={
          <>
            <PixelButton
              variant="ghost"
              size="md"
              onClick={() => setShowLeaveModal(false)}
              disabled={isLeaving}
            >
              STAY IN TEAM
            </PixelButton>
            <PixelButton
              variant="danger"
              size="md"
              onClick={handleLeaveTeam}
              isLoading={isLeaving}
            >
              CONFIRM LEAVE
            </PixelButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm leading-relaxed text-brand-navy">
            Are you sure you want to disconnect from <strong>{team.name}</strong>?
          </p>
          <div className="bg-status-warning-bg border-2 border-brand-navy p-3 text-xs text-status-warning-text font-mono">
            ⚠ Your team will be freed up so another device can claim it. You will return to the join screen where you can pick a different team or enter another room.
          </div>
        </div>
      </Modal>
    </div>
  );
};
