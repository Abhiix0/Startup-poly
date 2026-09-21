import React, { useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { PixelCoin } from './pixel';

export interface ArcadeLinkProps extends LinkProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  ctaType?: 'join' | 'admin';
  icon?: React.ReactNode;
}

export const ArcadeLink = React.forwardRef<HTMLAnchorElement, ArcadeLinkProps>(
  (
    {
      to,
      children,
      variant = 'primary',
      size = 'lg',
      fullWidth = false,
      ctaType,
      className = '',
      icon,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);

    const variantStyles = {
      primary: 'bg-[#22B14C] hover:bg-[#1fa145] text-white',
      secondary: 'bg-[#FFCC00] hover:bg-[#f5c400] text-[#102040]',
      danger: 'bg-[#D32F2F] hover:bg-[#bf2626] text-white',
      ghost: 'bg-white hover:bg-[#F0EDE6] text-[#102040]',
    };

    const sizeStyles = {
      sm: 'min-h-[44px] px-3 py-2 text-xs font-pixel',
      md: 'min-h-[48px] px-4 py-2.5 text-xs sm:text-sm font-pixel',
      lg: 'min-h-[56px] px-6 py-3.5 text-sm sm:text-base font-pixel',
    };

    const handlePointerEnter = (e: React.PointerEvent<HTMLAnchorElement>) => {
      setIsHoveredOrFocused(true);
      onPointerEnter?.(e);
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
      setIsHoveredOrFocused(false);
      onPointerLeave?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
      setIsHoveredOrFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
      setIsHoveredOrFocused(false);
      onBlur?.(e);
    };

    return (
      <Link
        ref={ref}
        to={to}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          relative inline-flex items-center justify-center gap-2 cursor-pointer font-bold select-none text-center no-underline
          border-4 border-[#102040] shadow-[4px_4px_0px_#102040]
          hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#102040]
          focus-visible:-translate-y-[2px] focus-visible:shadow-[6px_6px_0px_#102040]
          active:translate-y-[2px] active:shadow-[2px_2px_0px_#102040]
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102040]
          transition-all duration-75 ease-out
          motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none
          ${ctaType === 'admin' ? 'hover:ring-2 hover:ring-[#22B14C] focus-visible:ring-2 focus-visible:ring-[#22B14C]' : ''}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Popping coins effect for JOIN MATCH CTA */}
        {ctaType === 'join' && isHoveredOrFocused && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none flex gap-6 anim-pop-coins"
            aria-hidden="true"
          >
            <PixelCoin size={14} className="opacity-90" />
            <PixelCoin size={14} className="opacity-90" />
          </div>
        )}

        {/* Terminal cursor for ADMIN CONSOLE CTA */}
        {ctaType === 'admin' && isHoveredOrFocused && (
          <span className="text-[#86EFAC] font-pixel text-xs animate-pulse" aria-hidden="true">
            ▮
          </span>
        )}

        {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }
);

ArcadeLink.displayName = 'ArcadeLink';
