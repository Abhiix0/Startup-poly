import React from 'react';

export type ConnectionStatus = 'LIVE' | 'CONNECTING' | 'RECONNECTING' | 'OFFLINE';

export interface ConnectionPillProps {
  status: ConnectionStatus;
  lastUpdated?: string;
  className?: string;
  showLabel?: boolean;
}

export const ConnectionPill: React.FC<ConnectionPillProps> = ({
  status,
  lastUpdated,
  className = '',
  showLabel = true,
}) => {
  const configs: Record<ConnectionStatus, { bg: string; text: string; dot: string; label: string; pulse: boolean }> = {
    LIVE: {
      bg: 'bg-status-success-bg',
      text: 'text-status-success-dark',
      dot: 'bg-status-success',
      label: 'LIVE',
      pulse: true,
    },
    CONNECTING: {
      bg: 'bg-status-warning-bg',
      text: 'text-status-warning-text',
      dot: 'bg-status-warning',
      label: 'CONNECTING',
      pulse: true,
    },
    RECONNECTING: {
      bg: 'bg-status-warning-bg',
      text: 'text-status-warning-dark',
      dot: 'bg-status-warning',
      label: 'RECONNECTING',
      pulse: true,
    },
    OFFLINE: {
      bg: 'bg-status-danger-bg',
      text: 'text-status-danger-dark',
      dot: 'bg-status-danger',
      label: 'OFFLINE',
      pulse: false,
    },
  };

  const current = configs[status] || configs.OFFLINE;

  return (
    <div
      title={`Connection: ${current.label}${lastUpdated ? ` • Last updated ${lastUpdated}` : ''}`}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 select-none
        border-2 border-brand-navy shadow-[1px_1px_0px_var(--color-brand-navy)]
        ${current.bg} ${current.text} font-mono text-[11px] font-bold
        ${className}
      `}
    >
      <span
        className={`w-2 h-2 rounded-none border border-brand-navy ${current.dot} ${
          current.pulse ? 'animate-ping' : ''
        }`}
      />
      {showLabel && <span className="font-pixel text-[9px] tracking-wider">{current.label}</span>}
      {lastUpdated && (
        <span className="font-mono text-[10px] font-medium opacity-85 border-l border-current pl-1.5 ml-0.5">
          {lastUpdated}
        </span>
      )}
    </div>
  );
};
