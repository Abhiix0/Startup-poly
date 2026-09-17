import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatTimer } from '../../constants/theme';
import { Clock, AlertTriangle } from 'lucide-react';

export const TimerBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { state } = useGame();
  const seconds = state.secondsRemaining;

  const isCritical = seconds <= 60;
  const isWarning = seconds <= 300 && !isCritical;
  const isFinished = state.status === 'finished' || seconds === 0;

  const getStyle = () => {
    if (isFinished) return 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/30';
    if (isCritical) return 'bg-[#FF4D6D]/20 text-[#FF4D6D] border-[#FF4D6D]/40 animate-pulse';
    if (isWarning) return 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/30';
    return 'bg-[#2E2E2E] text-[#F7F2F6] border-[#F7F2F6]/10';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold ${getStyle()}`}>
        {isCritical ? (
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D6D]" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-[#A5A2A5]" />
        )}
        <span>{formatTimer(seconds)}</span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-2xl border flex items-center justify-between ${getStyle()}`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#A5A2A5]" />
        <div>
          <span className="text-[10px] uppercase font-bold text-[#A5A2A5] tracking-wider block">
            {isFinished ? 'MATCH COMPLETE' : state.timerRunning ? 'MATCH TIME REMAINING' : 'TIMER PAUSED'}
          </span>
          <span className="font-mono text-2xl font-black tracking-tight">
            {formatTimer(seconds)}
          </span>
        </div>
      </div>
      {isCritical && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF4D6D]/30 text-[#FF4D6D] border border-[#FF4D6D]/40 uppercase tracking-wide">
          FINAL MINUTE
        </span>
      )}
    </div>
  );
};
