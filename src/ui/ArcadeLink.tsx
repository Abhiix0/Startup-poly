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
    const [hasPressBurst, setHasPressBurst] = useState(false);

    const isReducedMotion = () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const variantStyles = {
      primary: 'bg-brand-green hover:bg-interactive-green-hover text-brand-white',
      secondary: 'bg-brand-gold hover:bg-interactive-gold-hover text-brand-navy',
      danger: 'bg-brand-red hover:bg-interactive-red-hover text-brand-white',
      ghost: 'bg-brand-white hover:bg-neutral-100 text-brand-navy',
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

    const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (ctaType === 'join' && !isReducedMotion()) {
        setHasPressBurst(true);
      }
      props.onPointerDown?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && ctaType === 'join' && !isReducedMotion()) {
        setHasPressBurst(true);
      }
      props.onKeyDown?.(e);
    };

    return (
      <Link
        ref={ref}
        to={to}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center justify-center gap-2 cursor-pointer font-bold select-none text-center no-underline
          border-4 border-brand-navy shadow-pixel
          hover:-translate-y-[2px] hover:shadow-pixel-lg
          focus-visible:-translate-y-[2px] focus-visible:shadow-pixel-lg
          active:translate-y-[2px] active:shadow-pixel-sm
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy
          transition-all duration-75 ease-out
          motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none
          ${ctaType === 'admin' ? 'hover:ring-2 hover:ring-brand-green focus-visible:ring-2 focus-visible:ring-brand-green' : ''}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Popping coins effect for JOIN MATCH CTA on hover/focus (suppressed in reduced motion) */}
        {ctaType === 'join' && isHoveredOrFocused && !isReducedMotion() && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none flex gap-6 anim-pop-coins"
            aria-hidden="true"
          >
            <PixelCoin size={14} className="opacity-90" />
            <PixelCoin size={14} className="opacity-90" />
          </div>
        )}

        {/* Phase 4: Button-press coin feedback for JOIN MATCH CTA */}
        {ctaType === 'join' && hasPressBurst && (
          <div
            data-testid="join-press-coins"
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none flex gap-5 anim-press-coins z-20"
            aria-hidden="true"
            onAnimationEnd={() => setHasPressBurst(false)}
          >
            <PixelCoin size={12} className="opacity-95" />
            <PixelCoin size={12} className="opacity-95" />
          </div>
        )}

        {/* Terminal cursor for ADMIN CONSOLE CTA */}
        {ctaType === 'admin' && isHoveredOrFocused && (
          <span className="text-status-success-light font-pixel text-xs animate-pulse" aria-hidden="true">
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
