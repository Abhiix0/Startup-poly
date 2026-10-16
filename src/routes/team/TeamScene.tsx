import React from 'react';
import { PixelHill, PixelCloud } from '../../ui/pixel';

// Mirrors the DB trigger on team_businesses and admin_add_business (both reject the 4th business).
export const MAX_BUSINESSES = 3;

/** Quiet Mushroom Kingdom backdrop: two hills and a cloud, behind content, never animated. */
export const TeamScene: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <PixelCloud size={96} className="absolute top-20 left-[6%] opacity-70" />
    <PixelCloud size={64} className="absolute top-40 right-[8%] opacity-60 hidden sm:block" />
    <PixelHill size={220} className="absolute bottom-6 -left-10 opacity-60" />
    <PixelHill size={160} className="absolute bottom-6 right-[-30px] opacity-60" />
  </div>
);

/** Standard content panel: white surface, thin navy border, small hard shadow. */
export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div';
  label?: string;
}> = ({ children, className = '', as: Tag = 'section', label }) => (
  <Tag
    aria-label={label}
    className={`bg-white border-2 border-brand-navy rounded-lg shadow-pixel-sm p-4 sm:p-5 ${className}`}
  >
    {children}
  </Tag>
);

/** Small uppercase label used above values and as section headings. */
export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={`font-pixel text-[11px] font-bold uppercase tracking-widest text-neutral-600 ${className}`}
  >
    {children}
  </span>
);

/** Read-only metric: label, big tabular value, optional accent colour class for the value. */
export const Metric: React.FC<{
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  badge?: React.ReactNode;
  className?: string;
}> = ({ label, value, valueClass = 'text-brand-navy', badge, className = '' }) => (
  <div
    className={`border-2 border-brand-navy rounded-lg shadow-pixel-sm p-4 sm:p-5 transition-colors duration-300 motion-reduce:transition-none ${className}`}
  >
    <div className="flex items-center justify-between gap-2 min-h-6">
      <Eyebrow>{label}</Eyebrow>
      {badge}
    </div>
    <div
      className={`font-tabular font-black tabular-nums tracking-tight leading-tight mt-1 text-4xl sm:text-5xl break-words ${valueClass}`}
    >
      {value}
    </div>
  </div>
);
