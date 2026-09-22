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
          <PixelMushroom size={34} className="drop-shadow-[2px_2px_0px_#102040]" />
        </div>
      )}

      {/* Top Hanging Posts / Iron Mount Brackets */}
      <div className="w-full flex justify-between px-8 sm:px-12 -mb-1.5 z-10 pointer-events-none">
        {/* Left Bracket */}
        <div className="flex flex-col items-center">
          <div className="w-4 h-5 bg-[#102040] flex flex-col justify-between py-0.5 items-center">
            <div className="w-2 h-1 bg-[#94A3B8]" />
            <div className="w-2 h-1 bg-[#475569]" />
          </div>
        </div>
        {/* Right Bracket */}
        <div className="flex flex-col items-center">
          <div className="w-4 h-5 bg-[#102040] flex flex-col justify-between py-0.5 items-center">
            <div className="w-2 h-1 bg-[#94A3B8]" />
            <div className="w-2 h-1 bg-[#475569]" />
          </div>
        </div>
      </div>

      {/* Main Wooden Board Body */}
      <div
        className={`w-full relative z-20 ${animClass} rounded-none border-4 border-[#102040] shadow-[8px_8px_0px_#102040] ${
          isCastle
            ? 'bg-[#3D2817] border-4 border-[#102040]'
            : 'bg-[#B8652A]'
        }`}
        style={{
          boxShadow: '6px 6px 0px #102040, 10px 10px 0px rgba(16, 32, 64, 0.4)',
        }}
      >
        {/* Overgrown Ivy / Vines for Wood Variant */}
        {!isCastle && (
          <>
            {/* Top-Left Ivy Cluster */}
            <div className="absolute -top-3 -left-3 pointer-events-none z-30 flex flex-col">
              <div className="flex">
                <div className="w-3.5 h-3.5 bg-[#22C55E] border-2 border-[#102040] rounded-sm -rotate-12" />
                <div className="w-3 h-3 bg-[#16A34A] border-2 border-[#102040] rounded-sm -ml-1 mt-1" />
              </div>
              <div className="flex -mt-1 ml-0.5">
                <div className="w-3.5 h-3.5 bg-[#15803D] border-2 border-[#102040] rounded-sm" />
                <div className="w-2.5 h-2.5 bg-[#22C55E] border border-[#102040] rounded-sm -ml-1" />
              </div>
            </div>

            {/* Right Edge Ivy Cluster */}
            <div className="absolute top-1/4 -right-2.5 pointer-events-none z-30 flex flex-col">
              <div className="w-3.5 h-3.5 bg-[#22C55E] border-2 border-[#102040] rounded-sm rotate-12" />
              <div className="w-3 h-3 bg-[#15803D] border-2 border-[#102040] rounded-sm -mt-1 -ml-1" />
              <div className="w-2.5 h-2.5 bg-[#16A34A] border border-[#102040] rounded-sm mt-0.5 ml-1" />
            </div>
          </>
        )}

        {/* Corner Iron Rivets */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-[#102040] flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-[#CBD5E1]" />
        </div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#102040] flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-[#CBD5E1]" />
        </div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#102040] flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-[#CBD5E1]" />
        </div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#102040] flex items-center justify-center pointer-events-none z-30">
          <div className="w-1 h-1 bg-[#CBD5E1]" />
        </div>

        {/* Top Header Plank (Title area) */}
        <div
          className={`relative border-b-4 border-[#102040] px-4 sm:px-6 py-4 text-center ${
            isCastle
              ? 'bg-[#1E293B] text-white'
              : 'bg-[#9E521D] text-[#FFFBEB]'
          }`}
        >
          {/* Plank wood bevel highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-white/20 pointer-events-none" />

          {icon && (
            <div className="inline-flex items-center justify-center mb-1.5 drop-shadow-[2px_2px_0px_#102040]">
              {icon}
            </div>
          )}

          <h1
            className="font-pixel text-base sm:text-lg md:text-xl tracking-wider uppercase text-[#FFCC00]"
            style={{
              textShadow: isCastle
                ? '2px 2px 0 #102040'
                : '3px 3px 0 #6E330C, 5px 5px 0 #102040, -1px -1px 0 #102040, 1px -1px 0 #102040, -1px 1px 0 #102040, 1px 1px 0 #102040',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <div className="mt-1.5">
              <span className="inline-block font-pixel text-[9px] sm:text-[11px] text-[#FFFBEB] tracking-wider uppercase font-bold drop-shadow-[1px_1px_0px_#102040]">
                {subtitle}
              </span>
            </div>
          )}

          {instruction && (
            <p className="font-mono text-[10px] sm:text-[11px] text-[#FFFBEB]/80 mt-1 tracking-wide">
              {instruction}
            </p>
          )}
        </div>

        {/* Inner Content Mounting Area */}
        <div
          className={`p-4 sm:p-6 relative ${
            isCastle
              ? 'bg-[#4A3320]'
              : 'bg-[#C26E30]'
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
        <div className="h-2 bg-[#5A2C0D] border-t-2 border-[#102040]/30" />
      </div>

      {/* Wooden Mounting Support Posts planted into ground */}
      <div className="w-full flex justify-between px-10 sm:px-16 pointer-events-none -mt-1">
        {/* Left Post */}
        <div className="relative flex flex-col items-center">
          <div
            className="w-7 sm:w-8 h-16 sm:h-24 bg-[#69310E] border-x-4 border-b-4 border-[#102040] relative"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 3px, transparent 3px, transparent 100%)',
            }}
          >
            {/* Post Rivet */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#102040]" />
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
            className="w-7 sm:w-8 h-16 sm:h-24 bg-[#69310E] border-x-4 border-b-4 border-[#102040] relative"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 3px, transparent 3px, transparent 100%)',
            }}
          >
            {/* Post Rivet */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#102040]" />
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
