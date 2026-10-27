import React from 'react';
import { PixelCloudFluffy, PixelSparkle, PixelCoin } from '../../ui/pixel';

export interface SkyLayerProps {
  className?: string;
}

export const SkyLayer: React.FC<SkyLayerProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 h-full max-h-[85vh] pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      {/* ===================================================================== */}
      {/* Distant Pixel-Art Sky Details: Subtle Stars/Sparkles in Flanks         */}
      {/* ===================================================================== */}
      <div className="absolute top-3 left-6 sm:left-12 anim-sparkle-cycle opacity-75">
        <PixelSparkle size={14} />
      </div>
      <div className="absolute top-14 left-20 sm:left-28 anim-sparkle-cycle opacity-60" style={{ animationDelay: '-1.8s' }}>
        <PixelSparkle size={10} />
      </div>
      <div className="absolute top-4 right-8 sm:right-16 anim-sparkle-cycle opacity-75" style={{ animationDelay: '-0.9s' }}>
        <PixelSparkle size={14} />
      </div>
      <div className="absolute top-16 right-22 sm:right-32 anim-sparkle-cycle opacity-60" style={{ animationDelay: '-2.4s' }}>
        <PixelSparkle size={10} />
      </div>

      {/* Distant ambient floating coin in upper far sky */}
      <div className="hidden sm:block absolute top-6 right-4 sm:right-10 anim-coin-idle opacity-70">
        <PixelCoin size={15} />
      </div>

      {/* Distant Gliding Pixel Birds (Far sky, gentle slow trajectory) */}
      <div className="absolute top-8 left-[18%] sm:left-[22%] opacity-60 pointer-events-none flex items-center gap-4">
        {/* Bird 1 */}
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="shrink-0 anim-float-bob">
          <path d="M 0,3 L 3,1 L 6,3 L 7,4 L 8,3 L 11,1 L 14,3 L 11,2 L 7,5 L 3,2 Z" fill="#1E3A5F" />
        </svg>
        {/* Bird 2 (Smaller, trailing behind) */}
        <svg width="10" height="6" viewBox="0 0 14 8" fill="none" className="shrink-0 anim-float-bob" style={{ animationDelay: '-1.2s' }}>
          <path d="M 0,3 L 3,1 L 6,3 L 7,4 L 8,3 L 11,1 L 14,3 L 11,2 L 7,5 L 3,2 Z" fill="#1E3A5F" />
        </svg>
      </div>

      {/* ===================================================================== */}
      {/* Cloud Lane 1: High-Altitude Upper Clouds (Smooth 110s Drift, 3 Aligned) */}
      {/* ===================================================================== */}
      <div className="absolute inset-x-0 top-1 sm:top-2.5 h-16 overflow-hidden pointer-events-none">
        <div
          className="flex w-[200%] shrink-0 anim-cloud-drift-far opacity-70"
          style={{ animationDelay: '-18s' }}
        >
          {/* Panel 1 */}
          <div className="w-1/2 relative h-14 shrink-0">
            <div className="absolute top-0.5 left-[5%]">
              <PixelCloudFluffy size={48} />
            </div>
            <div className="absolute top-1 left-[64%]">
              <PixelCloudFluffy size={42} />
            </div>
            <div className="absolute top-0.5 left-[86%]">
              <PixelCloudFluffy size={48} />
            </div>
          </div>
          {/* Panel 2 (Identical for seamless infinite loop) */}
          <div className="w-1/2 relative h-14 shrink-0">
            <div className="absolute top-0.5 left-[5%]">
              <PixelCloudFluffy size={48} />
            </div>
            <div className="absolute top-1 left-[64%]">
              <PixelCloudFluffy size={42} />
            </div>
            <div className="absolute top-0.5 left-[86%]">
              <PixelCloudFluffy size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* Cloud Lane 2: Upper-Mid Flank Clouds (Smooth 80s Drift, 2 Aligned)     */}
      {/* ===================================================================== */}
      <div className="absolute inset-x-0 top-10 sm:top-14 h-16 overflow-hidden pointer-events-none">
        <div
          className="flex w-[200%] shrink-0 anim-cloud-drift-mid opacity-60"
          style={{ animationDelay: '-32s' }}
        >
          {/* Panel 1 */}
          <div className="w-1/2 relative h-14 shrink-0">
            <div className="absolute top-1 left-[18%]">
              <PixelCloudFluffy size={42} />
            </div>
            <div className="absolute top-1 left-[76%]">
              <PixelCloudFluffy size={44} />
            </div>
          </div>
          {/* Panel 2 (Identical for seamless infinite loop) */}
          <div className="w-1/2 relative h-14 shrink-0">
            <div className="absolute top-1 left-[18%]">
              <PixelCloudFluffy size={42} />
            </div>
            <div className="absolute top-1 left-[76%]">
              <PixelCloudFluffy size={44} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
