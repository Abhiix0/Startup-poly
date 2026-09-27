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
    navy: 'text-brand-navy',
    green: 'text-brand-green',
    gold: 'text-status-warning-dark',
    red: 'text-brand-red',
    blue: 'text-status-info-dark',
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
        border-3 border-brand-navy bg-brand-white p-3 sm:p-4 shadow-pixel-sm
        flex flex-col justify-between
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-1 text-neutral-500 mb-1">
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
        <div className="mt-1 text-[11px] font-mono text-neutral-500 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
