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
    gold: 'bg-[#FFCC00] text-[#102040] hover:bg-[#FFE066]',
    green: 'bg-[#22B14C] text-white hover:bg-[#2ED15C]',
    brick: 'bg-[#B84418] text-white hover:bg-[#D9531E]',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        group relative inline-flex items-center justify-center font-pixel text-xs sm:text-sm tracking-wider uppercase
        py-3.5 px-6 border-3 sm:border-4 border-[#102040] select-none transition-transform duration-75 cursor-pointer
        ${bgStyles}
        ${fullWidth ? 'w-full' : ''}
        ${
          disabled
            ? 'opacity-85 cursor-not-allowed'
            : 'hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none'
        }
        ${className}
      `}
      style={{
        boxShadow: disabled ? '2px 2px 0px #102040' : '4px 4px 0px #102040',
        textShadow: variant === 'gold' ? '1px 1px 0px rgba(255, 255, 255, 0.6)' : '1px 1px 0px #102040',
      }}
      {...props}
    >
      {/* Top Plank Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/30 pointer-events-none" />

      {/* Left / Right Wooden Plank Rivet Accents */}
      <div className="absolute left-2 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />
      <div className="absolute right-2 w-1.5 h-1.5 bg-[#102040] pointer-events-none" />

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
