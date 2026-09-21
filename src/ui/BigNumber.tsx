import React from 'react';

export interface BigNumberProps {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  variant?: 'green' | 'gold' | 'red' | 'navy' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const BigNumber: React.FC<BigNumberProps> = ({
  label,
  value,
  subtext,
  variant = 'navy',
  size = 'md',
  icon,
  className = '',
}) => {
  const valueColorStyles = {
    navy: 'text-[#102040]',
    green: 'text-[#22B14C]',
    gold: 'text-[#D48800]',
    red: 'text-[#D32F2F]',
    blue: 'text-[#1E40AF]',
  };

  const sizeStyles = {
    sm: {
      val: 'text-xl sm:text-2xl',
      lbl: 'text-[10px]',
    },
    md: {
      val: 'text-2xl sm:text-3xl lg:text-4xl',
      lbl: 'text-xs',
    },
    lg: {
      val: 'text-3xl sm:text-4xl lg:text-5xl',
      lbl: 'text-xs sm:text-sm',
    },
  };

  return (
    <div
      className={`
        border-3 border-[#102040] bg-white p-3 sm:p-4 shadow-[2px_2px_0px_#102040]
        flex flex-col justify-between
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-1 text-[#64748B] mb-1">
        <span className={`font-pixel uppercase tracking-wide truncate ${sizeStyles[size].lbl}`}>
          {label}
        </span>
        {icon && <span className="flex-shrink-0 text-sm">{icon}</span>}
      </div>
      <div
        className={`
          font-tabular font-extrabold tracking-tight tabular-nums truncate
          ${valueColorStyles[variant]}
          ${sizeStyles[size].val}
        `}
      >
        {value}
      </div>
      {subtext && (
        <div className="mt-1 text-[11px] font-mono text-[#64748B] truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
