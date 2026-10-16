import React from 'react';

export interface PixelCardProps {
  children: React.ReactNode;
  title?: string;
  headerRight?: React.ReactNode;
  headerBg?: 'navy' | 'brick' | 'gold' | 'green' | 'default';
  variant?: 'white' | 'cream' | 'gold' | 'dark';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  title,
  headerRight,
  headerBg = 'default',
  variant = 'cream',
  className = '',
  padding = 'md',
}) => {
  const bgStyles = {
    white: 'bg-brand-white',
    cream: 'bg-neutral-50',
    gold: 'bg-status-warning-light',
    dark: 'bg-neutral-800 text-brand-white',
  };

  const headerBgStyles = {
    default: 'bg-neutral-200 text-brand-navy border-b-4 border-brand-navy',
    navy: 'bg-brand-navy text-brand-white border-b-4 border-brand-navy',
    brick: 'bg-brand-brick text-brand-white border-b-4 border-brand-navy',
    gold: 'bg-brand-gold text-brand-navy border-b-4 border-brand-navy',
    green: 'bg-brand-green text-brand-navy border-b-4 border-brand-navy',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`
        border-4 border-brand-navy shadow-pixel
        ${bgStyles[variant]}
        overflow-hidden
        ${className}
      `}
    >
      {title && (
        <div
          className={`
            px-4 py-2.5 flex items-center justify-between font-pixel text-xs sm:text-sm uppercase tracking-wider
            ${headerBgStyles[headerBg]}
          `}
        >
          <span className="truncate">{title}</span>
          {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
    </div>
  );
};
