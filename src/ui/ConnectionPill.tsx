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
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
      dot: 'bg-[#22C55E]',
      label: 'LIVE',
      pulse: true,
    },
    CONNECTING: {
      bg: 'bg-[#FEF9C3]',
      text: 'text-[#854D0E]',
      dot: 'bg-[#EAB308]',
      label: 'CONNECTING',
      pulse: true,
    },
    RECONNECTING: {
      bg: 'bg-[#FFEDD5]',
      text: 'text-[#9A3412]',
      dot: 'bg-[#F97316]',
      label: 'RECONNECTING',
      pulse: true,
    },
    OFFLINE: {
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#991B1B]',
      dot: 'bg-[#EF4444]',
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
        border-2 border-[#102040] shadow-[1px_1px_0px_#102040]
        ${current.bg} ${current.text} font-mono text-[11px] font-bold
        ${className}
      `}
    >
      <span
        className={`w-2 h-2 rounded-none border border-[#102040] ${current.dot} ${
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
