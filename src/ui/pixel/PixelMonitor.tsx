import React from 'react';

export interface PixelMonitorProps {
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * PixelMonitor: Retro desktop console with an arcade-green screen and blinking cursor.
 */
export const PixelMonitor: React.FC<PixelMonitorProps> = ({
  size = 24,
  className = '',
  ariaHidden = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : 'Pixel Monitor'}
    >
      {/* Outer Monitor Frame (Navy #102040) */}
      <rect x="2" y="2" width="20" height="14" fill="#102040" />
      {/* Bezel / Casing (Gray #CBD5E1) */}
      <rect x="3" y="3" width="18" height="12" fill="#E2E8F0" />
      <rect x="4" y="4" width="16" height="10" fill="#102040" />

      {/* Screen (Dark Green #14532D) */}
      <rect x="5" y="5" width="14" height="8" fill="#14532D" />

      {/* Terminal prompt ">" */}
      <rect x="6" y="7" width="1" height="3" fill="#4ADE80" />
      <rect x="7" y="8" width="1" height="1" fill="#4ADE80" />

      {/* Blinking green cursor */}
      <rect
        x="9"
        y="7"
        width="2"
        height="3"
        fill="#22C55E"
        className="anim-blink"
      />

      {/* Monitor Stand */}
      <rect x="10" y="16" width="4" height="3" fill="#102040" />
      <rect x="11" y="16" width="2" height="3" fill="#94A3B8" />

      {/* Base Pedestal */}
      <rect x="6" y="19" width="12" height="2" fill="#102040" />
      <rect x="7" y="19" width="10" height="1" fill="#E2E8F0" />
    </svg>
  );
};
