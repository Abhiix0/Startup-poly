import React from 'react';
import { useServerClock } from '../lib/useServerClock';

export interface CountdownProps {
  endsAt: string | null;
  status: string;
  serverNow?: string | null;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showLabel?: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({
  endsAt,
  status,
  serverNow,
  onExpire,
  size = 'md',
  className = '',
  showLabel = true,
}) => {
  const { formatted, remainingMs, isExpired, isRunning } = useServerClock({
    endsAt,
    status,
    serverNow,
    onExpire,
  });

  const isLowTime = isRunning && remainingMs < 5 * 60 * 1000; // < 5 minutes

  const sizeStyles = {
    sm: 'text-lg px-2.5 py-1',
    md: 'text-2xl px-4 py-1.5',
    lg: 'text-4xl px-5 py-2',
    hero: 'text-5xl sm:text-7xl px-6 py-4',
  };

  const colorStyles = isExpired
    ? 'bg-status-danger-bg text-brand-red border-brand-red'
    : isLowTime
    ? 'bg-status-warning-bg text-brand-red border-brand-red animate-pulse'
    : 'bg-brand-navy text-brand-gold border-brand-navy';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {showLabel && (
        <span className="font-pixel text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
          {isExpired ? 'MATCH ENDED' : isRunning ? 'TIME REMAINING' : 'GAME TIMER'}
        </span>
      )}
      <div
        className={`
          font-tabular font-extrabold tracking-widest tabular-nums
          border-4 shadow-pixel
          ${colorStyles}
          ${sizeStyles[size]}
        `}
      >
        {formatted}
      </div>
    </div>
  );
};
