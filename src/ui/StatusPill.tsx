import React from 'react';

export type StatusType =
  | 'CREATED'
  | 'LOBBY'
  | 'ACTIVE'
  | 'TIME_EXPIRED'
  | 'FINALIZED'
  | 'BANKRUPT'
  | 'WAITING';

export interface StatusPillProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const normalized = status.toUpperCase();

  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    CREATED: {
      bg: 'bg-status-warning-bg',
      text: 'text-status-warning-text',
      dot: 'bg-status-warning',
      label: 'CREATED',
    },
    LOBBY: {
      bg: 'bg-status-info-bg',
      text: 'text-status-info-dark',
      dot: 'bg-status-info',
      label: 'LOBBY',
    },
    ACTIVE: {
      bg: 'bg-status-success-bg',
      text: 'text-status-success-dark',
      dot: 'bg-status-success',
      label: 'ACTIVE',
    },
    TIME_EXPIRED: {
      bg: 'bg-status-danger-bg',
      text: 'text-status-danger-dark',
      dot: 'bg-status-danger',
      label: 'TIME UP',
    },
    FINALIZED: {
      bg: 'bg-neutral-100',
      text: 'text-neutral-700',
      dot: 'bg-neutral-500',
      label: 'FINALIZED',
    },
    BANKRUPT: {
      bg: 'bg-neutral-950',
      text: 'text-status-danger-light',
      dot: 'bg-status-danger',
      label: 'BANKRUPT',
    },
    WAITING: {
      bg: 'bg-status-warning-bg',
      text: 'text-status-warning-text',
      dot: 'bg-status-warning',
      label: 'WAITING',
    },
  };

  const current = styles[normalized] || {
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    dot: 'bg-neutral-400',
    label: normalized,
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-pixel font-bold uppercase select-none
        border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]
        ${current.bg} ${current.text} ${sizeClass}
        ${className}
      `}
    >
      <span
        className={`w-2 h-2 rounded-none border border-brand-navy ${current.dot} ${
          pulse || normalized === 'ACTIVE' ? 'animate-pulse' : ''
        }`}
      />
      {current.label}
    </span>
  );
};
