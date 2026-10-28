import React, { useEffect } from 'react';
import { Modal } from '../../../ui';
import { AdminRoomSnapshot, StandingsRow } from '../../../data/rpc';

export interface TimeOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: AdminRoomSnapshot;
  standings: StandingsRow[];
  onExtendTenMinutes: () => Promise<void>;
  onOpenFinalize: () => void;
  isExtending?: boolean;
}

export const TimeOverModal: React.FC<TimeOverModalProps> = ({
  isOpen,
  onClose,
  snapshot,
  standings,
  onExtendTenMinutes,
  onOpenFinalize,
  isExtending = false,
}) => {
  // Hotkeys: 'E' to extend 10 minutes, 'F' to finalize, Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onExtendTenMinutes();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onOpenFinalize();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExtendTenMinutes, onOpenFinalize]);

  if (!isOpen) return null;

  // Derive provisional leader
  const leader = standings[0] || null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⏰ GAME OVER: CHOOSE NEXT ACTION"
      maxWidth="lg"
    >
      <div className="flex flex-col gap-5 py-2 select-none text-brand-navy">
        {/* Banner callout */}
        <div className="bg-brand-navy text-brand-white p-4 border-4 border-brand-gold shadow-pixel flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">⏰</span>
            <div>
              <h3 className="font-pixel text-sm sm:text-base text-brand-gold uppercase tracking-wider">
                GAMEPLAY WINDOW EXPIRED
              </h3>
              <p className="font-mono text-xs text-neutral-300 mt-0.5">
                The 50-minute countdown has reached 00:00. Scores are frozen.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-pixel text-[10px] text-brand-gold tracking-widest">
              ROOM {snapshot.room.code}
            </span>
            <span className="hidden sm:inline font-pixel text-xs bg-brand-gold text-brand-navy px-2.5 py-1 font-bold">
              TIME: 00:00
            </span>
          </div>
        </div>

        {/* Provisional Leader & Standings Snapshot */}
        <div className="bg-brand-cream border-3 border-brand-navy p-3.5 shadow-pixel-sm flex flex-col gap-2.5">
          <span className="font-pixel text-[10px] text-neutral-600 uppercase tracking-wider block">
            PROVISIONAL MATCH STANDINGS
          </span>

          {leader && (
            <div className="flex items-center justify-between bg-brand-white border-2 border-brand-navy p-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-brand-gold text-brand-navy font-pixel text-xs font-bold border border-brand-navy flex items-center justify-center">
                  #1
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-xs font-bold text-brand-navy">
                      {leader.name}
                    </span>
                    <span className="font-pixel text-[9px] bg-brand-gold text-brand-navy px-1.5 py-0.2 border border-brand-navy">
                      👑 LEADER
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500">
                    Cash: ₹{leader.cash.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-pixel text-[9px] text-neutral-500 block">CASH</span>
                <span className="font-pixel text-lg font-black text-brand-navy tabular-nums">
                  ₹{leader.cash.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* The Two Main Action Paths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* OPTION 1: EXTEND TIME (+10 MINS) */}
          <div className="bg-brand-white border-4 border-brand-green shadow-pixel hover:shadow-pixel-lg transition-all p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">⚡</span>
                <span className="font-pixel text-[9px] bg-brand-green text-white px-2 py-0.5 font-bold">
                  HOTKEY: [E]
                </span>
              </div>
              <h4 className="font-pixel text-xs sm:text-sm text-brand-green uppercase font-bold tracking-wider">
                +10 MINS EXTRA TIME
              </h4>
              <p className="font-mono text-xs text-neutral-600 mt-1 leading-snug">
                Adds 10:00 to the match clock, resumes active play, unfreezes scores, and notifies all connected player phones.
              </p>
            </div>

            <button
              type="button"
              disabled={isExtending}
              onClick={onExtendTenMinutes}
              className="
                w-full font-pixel text-xs uppercase py-3 px-4 bg-brand-green text-white font-bold
                border-3 border-brand-navy shadow-pixel-sm hover:bg-interactive-green-hover
                active:translate-y-1 active:shadow-none cursor-pointer transition-all flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <span>{isExtending ? 'EXTENDING...' : '⚡ ADD 10 MINUTES [E]'}</span>
            </button>
          </div>

          {/* OPTION 2: FINALIZE RESULTS */}
          <div className="bg-brand-white border-4 border-brand-gold shadow-pixel hover:shadow-pixel-lg transition-all p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">🏆</span>
                <span className="font-pixel text-[9px] bg-brand-gold text-brand-navy px-2 py-0.5 font-bold border border-brand-navy">
                  HOTKEY: [F]
                </span>
              </div>
              <h4 className="font-pixel text-xs sm:text-sm text-brand-navy uppercase font-bold tracking-wider">
                FINALIZE RESULTS
              </h4>
              <p className="font-mono text-xs text-neutral-600 mt-1 leading-snug">
                Permanently closes gameplay, takes an immutable snapshot of final standings, and opens the championship podium celebration.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenFinalize}
              className="
                w-full font-pixel text-xs uppercase py-3 px-4 bg-brand-gold text-brand-navy font-bold
                border-3 border-brand-navy shadow-pixel-sm hover:bg-interactive-gold-hover
                active:translate-y-1 active:shadow-none cursor-pointer transition-all flex items-center justify-center gap-2
              "
            >
              <span>🏆 FINALIZE & LOCK [F]</span>
            </button>
          </div>
        </div>

        {/* Secondary review action */}
        <div className="flex items-center justify-between pt-1 border-t-2 border-neutral-300">
          <span className="font-mono text-[11px] text-neutral-500">
            Need to make a final balance adjustment? Close this modal to review ledger.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-pixel text-[10px] text-brand-navy underline hover:text-brand-red cursor-pointer py-1 px-2"
          >
            REVIEW LEDGER FIRST [ESC]
          </button>
        </div>
      </div>
    </Modal>
  );
};
