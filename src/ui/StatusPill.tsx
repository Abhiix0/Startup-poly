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
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#92400E]',
      dot: 'bg-[#F59E0B]',
      label: 'CREATED',
    },
    LOBBY: {
      bg: 'bg-[#EFF6FF]',
      text: 'text-[#1E40AF]',
      dot: 'bg-[#3B82F6]',
      label: 'LOBBY',
    },
    ACTIVE: {
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
      dot: 'bg-[#22C55E]',
      label: 'ACTIVE',
    },
    TIME_EXPIRED: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#991B1B]',
      dot: 'bg-[#EF4444]',
      label: 'TIME UP',
    },
    FINALIZED: {
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#334155]',
      dot: 'bg-[#64748B]',
      label: 'FINALIZED',
    },
    BANKRUPT: {
      bg: 'bg-[#450A0A]',
      text: 'text-[#FEF2F2]',
      dot: 'bg-[#EF4444]',
      label: 'BANKRUPT',
    },
    WAITING: {
      bg: 'bg-[#FFF7ED]',
      text: 'text-[#9A3412]',
      dot: 'bg-[#F97316]',
      label: 'WAITING',
    },
  };

  const current = styles[normalized] || {
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#475569]',
    dot: 'bg-[#94A3B8]',
    label: normalized,
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-pixel font-bold uppercase select-none
        border-2 border-[#102040] shadow-[1px_1px_0px_#102040]
        ${current.bg} ${current.text} ${sizeClass}
        ${className}
      `}
    >
      <span
        className={`w-2 h-2 rounded-none border border-[#102040] ${current.dot} ${
          pulse || normalized === 'ACTIVE' ? 'animate-pulse' : ''
        }`}
      />
      {current.label}
    </span>
  );
};
