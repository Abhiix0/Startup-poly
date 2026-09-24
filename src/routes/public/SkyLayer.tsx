import React from 'react';
import { PixelCloudFluffy } from '../../ui/pixel';

export interface SkyLayerProps {
  className?: string;
}

export const SkyLayer: React.FC<SkyLayerProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 h-48 sm:h-60 md:h-72 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      {/* ===================================================================== */}
      {/* Cloud Track 1: High-Altitude Clouds (Slow 110s Drift Loop)            */}
      {/* ===================================================================== */}
      <div className="absolute inset-x-0 top-2 sm:top-5 h-20 overflow-hidden pointer-events-none">
        <div
          className="flex w-[200%] shrink-0 anim-cloud-drift-far opacity-50"
          style={{ animationDelay: '-22s' }}
        >
          {/* Panel 1 */}
          <div className="w-1/2 relative h-16 shrink-0">
            <div className="absolute top-1 left-[14%]">
              <PixelCloudFluffy size={42} />
            </div>
            <div className="absolute top-5 left-[52%]">
              <PixelCloudFluffy size={48} />
            </div>
            <div className="absolute top-2 left-[84%]">
              <PixelCloudFluffy size={38} />
            </div>
          </div>
          {/* Panel 2 (Identical for seamless infinite loop) */}
          <div className="w-1/2 relative h-16 shrink-0">
            <div className="absolute top-1 left-[14%]">
              <PixelCloudFluffy size={42} />
            </div>
            <div className="absolute top-5 left-[52%]">
              <PixelCloudFluffy size={48} />
            </div>
            <div className="absolute top-2 left-[84%]">
              <PixelCloudFluffy size={38} />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* Cloud Track 2: Mid-Sky Fluffy Clouds (70s Drift Loop)                 */}
      {/* ===================================================================== */}
      <div className="absolute inset-x-0 top-12 sm:top-20 h-24 overflow-hidden pointer-events-none">
        <div
          className="flex w-[200%] shrink-0 anim-cloud-drift-mid opacity-80"
          style={{ animationDelay: '-10s' }}
        >
          {/* Panel 1 */}
          <div className="w-1/2 relative h-20 shrink-0">
            <div className="absolute top-2 left-[30%]">
              <PixelCloudFluffy size={68} />
            </div>
            <div className="absolute top-4 left-[74%]">
              <PixelCloudFluffy size={58} />
            </div>
          </div>
          {/* Panel 2 (Identical for seamless infinite loop) */}
          <div className="w-1/2 relative h-20 shrink-0">
            <div className="absolute top-2 left-[30%]">
              <PixelCloudFluffy size={68} />
            </div>
            <div className="absolute top-4 left-[74%]">
              <PixelCloudFluffy size={58} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
