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
    white: 'bg-white',
    cream: 'bg-[#FAF8F5]',
    gold: 'bg-[#FFEDB3]',
    dark: 'bg-[#182848] text-white',
  };

  const headerBgStyles = {
    default: 'bg-[#EAE5D9] text-[#102040] border-b-4 border-[#102040]',
    navy: 'bg-[#102040] text-white border-b-4 border-[#102040]',
    brick: 'bg-[#B84418] text-white border-b-4 border-[#102040]',
    gold: 'bg-[#FFCC00] text-[#102040] border-b-4 border-[#102040]',
    green: 'bg-[#22B14C] text-[#102040] border-b-4 border-[#102040]',
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
        border-4 border-[#102040] shadow-[4px_4px_0px_#102040]
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
