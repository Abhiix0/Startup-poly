import React from 'react';
import { PixelCoin } from './PixelCoin';

export interface WoodenActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'green' | 'brick';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const WoodenActionButton: React.FC<WoodenActionButtonProps> = ({
  children,
  variant = 'gold',
  isLoading = false,
  fullWidth = true,
  disabled = false,
  className = '',
  ...props
}) => {
  const bgStyles = {
    gold: 'bg-brand-gold text-brand-navy hover:bg-interactive-gold-hover',
    green: 'bg-brand-green text-brand-white hover:bg-interactive-green-hover',
    brick: 'bg-brand-brick text-brand-white hover:bg-interactive-red-hover',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        group relative inline-flex items-center justify-center font-pixel text-xs sm:text-sm tracking-wider uppercase
        py-3.5 px-6 border-3 sm:border-4 border-brand-navy select-none transition-all duration-75 ease-out cursor-pointer
        motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none
        ${bgStyles}
        ${fullWidth ? 'w-full' : ''}
        ${
          disabled
            ? 'opacity-85 cursor-not-allowed shadow-pixel-sm'
            : 'shadow-pixel hover:-translate-y-[2px] hover:shadow-pixel-lg focus-visible:-translate-y-[2px] focus-visible:shadow-pixel-lg active:translate-y-[2px] active:shadow-pixel-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy'
        }
        ${className}
      `}
      style={{
        textShadow: variant === 'gold' ? '1px 1px 0px rgba(255, 255, 255, 0.6)' : '1px 1px 0px var(--color-brand-navy)',
      }}
      {...props}
    >
      {/* Top Plank Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/30 pointer-events-none" />

      {/* Left / Right Wooden Plank Rivet Accents */}
      <div className="absolute left-2 w-1.5 h-1.5 bg-brand-navy pointer-events-none" />
      <div className="absolute right-2 w-1.5 h-1.5 bg-brand-navy pointer-events-none" />

      {/* Content */}
      <span className="flex items-center gap-2 relative z-10">
        {isLoading ? (
          <>
            <PixelCoin size={16} className="anim-coin-idle" />
            <span>CONNECTING...</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};
