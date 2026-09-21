import React from 'react';

export interface PixelBugProps {
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * PixelBug: Original STARTUPOLY critter (small red bug with tiny antennae).
 */
export const PixelBug: React.FC<PixelBugProps> = ({
  size = 20,
  className = '',
  ariaHidden = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`inline-block select-none flex-shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : 'Pixel Bug'}
    >
      {/* Antennae (Navy with Gold tips) */}
      <rect x="5" y="1" width="2" height="2" fill="#FFCC00" />
      <rect x="6" y="3" width="2" height="3" fill="#102040" />
      <rect x="13" y="1" width="2" height="2" fill="#FFCC00" />
      <rect x="12" y="3" width="2" height="3" fill="#102040" />

      {/* Outer Outline (Navy #102040) */}
      <rect x="5" y="5" width="10" height="1" fill="#102040" />
      <rect x="3" y="6" width="14" height="1" fill="#102040" />
      <rect x="2" y="7" width="16" height="8" fill="#102040" />
      <rect x="3" y="15" width="14" height="1" fill="#102040" />
      <rect x="4" y="16" width="12" height="1" fill="#102040" />

      {/* Red Body (#D32F2F) */}
      <rect x="5" y="6" width="10" height="1" fill="#D32F2F" />
      <rect x="3" y="7" width="14" height="8" fill="#D32F2F" />
      <rect x="4" y="15" width="12" height="1" fill="#D32F2F" />

      {/* Top Body Highlight (#F87171) */}
      <rect x="6" y="7" width="8" height="2" fill="#F87171" />

      {/* Large Pixel Eyes */}
      <rect x="4" y="9" width="4" height="4" fill="#FFFFFF" />
      <rect x="12" y="9" width="4" height="4" fill="#FFFFFF" />
      {/* Pupils (Navy #102040) */}
      <rect x="5" y="10" width="2" height="2" fill="#102040" />
      <rect x="13" y="10" width="2" height="2" fill="#102040" />

      {/* Feet (Navy #102040) */}
      <rect x="2" y="16" width="3" height="2" fill="#102040" />
      <rect x="15" y="16" width="3" height="2" fill="#102040" />
    </svg>
  );
};
