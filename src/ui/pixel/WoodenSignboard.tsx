import React from 'react';
import { PixelMushroom } from './PixelMushroom';
import { PixelGrassTuft } from './PixelGrassTuft';
import { PixelFlower } from './PixelFlower';

export interface WoodenSignboardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  instruction?: React.ReactNode;
  icon?: React.ReactNode;
  state?: 'idle' | 'shake' | 'bounce';
  variant?: 'wood' | 'castle';
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const WoodenSignboard: React.FC<WoodenSignboardProps> = ({
  title,
  subtitle,
  instruction,
  icon,
  state = 'idle',
  variant = 'wood',
  children,
  className = '',
  maxWidth = 'max-w-md',
}) => {
  const isCastle = variant === 'castle';

  const animClass =
    state === 'shake'
      ? 'anim-signboard-error'
      : state === 'bounce'
      ? 'anim-signboard-success'
      : 'anim-signboard-enter';

  return (
    <div className={`relative flex flex-col items-center w-full ${maxWidth} mx-auto select-none ${className}`}>
      {/* Top Center Red Mushroom Header Topper (for Wood variant) */}
      {!isCastle && (
        <div className="flex justify-center -mb-2 z-30 pointer-events-none">
          <PixelMushroom size={34} className="drop-shadow-[2px_2px_0px_var(--color-brand-navy)]" />
        </div>
      )}

      {/* Top Hanging Posts / Iron Mount Brackets */}
      <div className="w-full flex justify-between px-8 sm:px-12 -mb-1.5 z-10 pointer-events-none">
        {/* Left Bracket */}
        <div className="flex flex-col items-center">
          <div className="w-4 h-5 bg-brand-navy flex flex-col justify-between py-0.5 items-center">
            <div className="w-2 h-1 bg-neutral-400" />
            <div className="w-2 h-1 bg-neutral-600" />
          </div>
        </div>
        {/* Right Bracket */}
        <div className="flex flex-col items-center">
          <div className="w-4 h-5 bg-brand-navy flex flex-col justify-between py-0.5 items-center">
            <div className="w-2 h-1 bg-neutral-400" />
            <div className="w-2 h-1 bg-neutral-600" />
          </div>
        </div>
      </div>

      {/* Main Wooden Board Body */}
      <div
        className={`w-full relative z-20 ${animClass} rounded-none border-4 border-brand-navy shadow-[8px_8px_0px_var(--color-brand-navy)] ${
          isCastle
            ? 'bg-[var(--color-wood-dark)] border-4 border-brand-navy'
            : 'bg-[var(--color-wood-light)]'
        }`}
        style={{
          boxShadow: '6px 6px 0px var(--color-brand-navy), 10px 10px 0px rgba(16, 32, 64, 0.4)',
        }}
      >
        {/* Overgrown Ivy / Vines for Wood Variant */}
        {!isCastle && (
          <>
            {/* Top-Left Ivy Cluster */}
            <div className="absolute -top-3 -left-3 pointer-events-none z-30 flex flex-col">
              <div className="flex">
                <div className="w-3.5 h-3.5 bg-brand-green border-2 border-brand-navy rounded-sm -rotate-12" />
                <div className="w-3 h-3 bg-status-success-dark border-2 border-brand-navy rounded-sm -ml-1 mt-1" />
              </div>
              <div className="flex -mt-1 ml-0.5">
                <div className="w-3.5 h-3.5 bg-status-success-dark border-2 border-brand-navy rounded-sm" />
                <div className="w-2.5 h-2.5 bg-brand-green border border-brand-navy rounded-sm -ml-1" />
              </div>
            </div>

            {/* Right Edge Ivy Cluster */}
            <div className="absolute top-1/4 -right-2.5 pointer-events-none z-30 flex flex-col">
              <div className="w-3.5 h-3.5 bg-brand-green border-2 border-brand-navy rounded-sm rotate-12" />
              <div className="w-3 h-3 bg-status-success-dark border-2 border-brand-navy rounded-sm -mt-1 -ml-1" />
              <div className="w-2.5 h-2.5 bg-status-success-dark border border-brand-navy rounded-sm mt-0.5 ml-1" />
            </div>
          </>
        )}

        {/* Corner Iron Rivets */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-brand-navy flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-neutral-300" />
        </div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-brand-navy flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-neutral-300" />
        </div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-brand-navy flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-neutral-300" />
        </div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-brand-navy flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-neutral-300" />
        </div>

        {/* Top Header Plank (Title area) */}
        <div
          className={`relative border-b-4 border-brand-navy px-4 sm:px-6 py-4 text-center ${
            isCastle
              ? 'bg-neutral-800 text-white'
              : 'bg-[var(--color-wood-base)] text-status-warning-bg'
          }`}
        >
          {/* Plank wood bevel highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-white/20 pointer-events-none" />

          {icon && (
            <div className="inline-flex items-center justify-center mb-1.5 drop-shadow-[2px_2px_0px_var(--color-brand-navy)]">
              {icon}
            </div>
          )}

          <h1
            className="font-pixel text-base sm:text-lg md:text-xl tracking-wider uppercase text-brand-gold"
            style={{
              textShadow: isCastle
                ? '2px 2px 0 var(--color-brand-navy)'
                : '3px 3px 0 var(--color-wood-dark), 5px 5px 0 var(--color-brand-navy), -1px -1px 0 var(--color-brand-navy), 1px -1px 0 var(--color-brand-navy), -1px 1px 0 var(--color-brand-navy), 1px 1px 0 var(--color-brand-navy)',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <div className="mt-1.5">
              <span className="inline-block font-pixel text-[9px] sm:text-[11px] text-status-warning-bg tracking-wider uppercase font-bold drop-shadow-[1px_1px_0px_var(--color-brand-navy)]">
                {subtitle}
              </span>
            </div>
          )}

          {instruction && (
            <p className="font-mono text-[10px] sm:text-[11px] text-status-warning-bg/80 mt-1 tracking-wide">
              {instruction}
            </p>
          )}
        </div>

        {/* Inner Content Mounting Area */}
        <div
          className={`p-4 sm:p-6 relative ${
            isCastle
              ? 'bg-[var(--color-wood-dark)]'
              : 'bg-[var(--color-wood-light)]'
          }`}
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.08) 0px, transparent 4px, rgba(0,0,0,0.12) 100%)',
          }}
        >
          {/* Subtle horizontal plank divider lines */}
          <div className="space-y-4">{children}</div>
        </div>

        {/* Bottom Wood Plank Bevel Shadow */}
        <div className="h-2 bg-[var(--color-wood-dark)] border-t-2 border-brand-navy/30" />
      </div>

      {/* Wooden Mounting Support Posts planted into ground */}
      <div className="w-full flex justify-between px-10 sm:px-16 pointer-events-none -mt-1">
        {/* Left Post */}
        <div className="relative flex flex-col items-center">
          <div
            className="w-7 sm:w-8 h-16 sm:h-24 bg-[var(--color-wood-base)] border-x-4 border-b-4 border-brand-navy relative"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 3px, transparent 3px, transparent 100%)',
            }}
          >
            {/* Post Rivet */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-navy" />
          </div>
          {/* Grass & Flower at Left Post Base */}
          {!isCastle && (
            <div className="absolute -bottom-1 -left-3 flex items-end gap-0.5">
              <PixelGrassTuft size={18} variant={1} />
              <PixelFlower size={16} variant={2} />
            </div>
          )}
        </div>

        {/* Right Post */}
        <div className="relative flex flex-col items-center">
          <div
            className="w-7 sm:w-8 h-16 sm:h-24 bg-[var(--color-wood-base)] border-x-4 border-b-4 border-brand-navy relative"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 3px, transparent 3px, transparent 100%)',
            }}
          >
            {/* Post Rivet */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-navy" />
          </div>
          {/* Grass & Flower at Right Post Base */}
          {!isCastle && (
            <div className="absolute -bottom-1 -right-3 flex items-end gap-0.5">
              <PixelFlower size={16} variant={1} />
              <PixelGrassTuft size={18} variant={2} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
