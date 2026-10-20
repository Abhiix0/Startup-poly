import React, { useState, useEffect, useRef } from 'react';
import { Modal, PixelButton } from '../../../ui';
import { sounds } from '../../../lib/sound';

export interface PitchTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName?: string;
  defaultSeconds?: number;
}

export const PitchTimerModal: React.FC<PitchTimerModalProps> = ({
  isOpen,
  onClose,
  teamName,
  defaultSeconds = 30,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(defaultSeconds);
      setIsRunning(true);
      sounds.playWhistle();
    } else {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, defaultSeconds]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            sounds.playGong();
            return 0;
          }
          if (prev === 6) {
            sounds.playDamage(); // countdown warning
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsLeft]);

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(defaultSeconds);
  };

  const handleAddTen = () => {
    setSecondsLeft((s) => s + 10);
  };

  const pct = Math.max(0, Math.min(100, (secondsLeft / defaultSeconds) * 100));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎤 30-SECOND PITCH TIMER" maxWidth="md">
      <div className="flex flex-col items-center gap-5 py-4 text-center select-none">
        {teamName && (
          <div className="bg-brand-navy text-brand-gold px-4 py-1.5 border-2 border-brand-navy shadow-pixel-sm font-pixel text-xs">
            PITCHING: {teamName.toUpperCase()}
          </div>
        )}

        {/* Big Giant Timer Display */}
        <div
          className={`
            w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 border-brand-navy shadow-pixel flex flex-col items-center justify-center transition-colors
            ${secondsLeft === 0 ? 'bg-status-danger-bg anim-pulse' : secondsLeft <= 5 ? 'bg-status-warning-bg' : 'bg-brand-cream'}
          `}
        >
          <span
            className={`font-pixel tabular-nums text-6xl sm:text-7xl font-black drop-shadow-[2px_2px_0px_var(--color-brand-navy)] ${
              secondsLeft === 0 ? 'text-brand-red' : secondsLeft <= 5 ? 'text-brand-navy' : 'text-brand-navy'
            }`}
          >
            {secondsLeft}s
          </span>
          <span className="font-pixel text-[10px] text-neutral-600 mt-1 uppercase">
            {secondsLeft === 0 ? 'TIME EXPIRED!' : isRunning ? 'PITCH IN PROGRESS' : 'PAUSED'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 border-2 border-brand-navy h-4 overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-300 ${
              secondsLeft <= 5 ? 'bg-brand-red' : secondsLeft <= 10 ? 'bg-brand-gold' : 'bg-brand-green'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-center w-full">
          <PixelButton
            variant={isRunning ? 'secondary' : 'primary'}
            onClick={handleToggle}
            className="flex-1 min-w-[120px]"
          >
            {isRunning ? '⏸ PAUSE' : secondsLeft === 0 ? '🔄 RESTART' : '▶ START'}
          </PixelButton>

          <PixelButton variant="secondary" onClick={handleReset} className="min-w-[80px]">
            RESET
          </PixelButton>

          <PixelButton variant="secondary" onClick={handleAddTen} className="min-w-[80px]">
            +10s
          </PixelButton>
        </div>

        <p className="font-mono text-[11px] text-neutral-500">
          Action B / Tiebreaker rule: Pitch is strictly timed. When gong sounds, judges vote immediately.
        </p>
      </div>
    </Modal>
  );
};
