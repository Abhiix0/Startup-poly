import React from 'react';

export interface PixelMushroomProps {
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * PixelMushroom: Classic 8-bit power-up red mushroom perched atop signboards.
 */
export const PixelMushroom: React.FC<PixelMushroomProps> = ({
  size = 28,
  className = '',
  ariaHidden = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`inline-block select-none flex-shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : 'Mushroom'}
    >
      {/* Black / Navy Outline */}
      <rect x="5" y="1" width="6" height="1" fill="#102040" />
      <rect x="3" y="2" width="2" height="1" fill="#102040" />
      <rect x="11" y="2" width="2" height="1" fill="#102040" />
      <rect x="2" y="3" width="1" height="2" fill="#102040" />
      <rect x="13" y="3" width="1" height="2" fill="#102040" />
      <rect x="1" y="5" width="1" height="5" fill="#102040" />
      <rect x="14" y="5" width="1" height="5" fill="#102040" />
      <rect x="2" y="10" width="12" height="1" fill="#102040" />
      <rect x="3" y="11" width="1" height="4" fill="#102040" />
      <rect x="12" y="11" width="1" height="4" fill="#102040" />
      <rect x="4" y="15" width="8" height="1" fill="#102040" />

      {/* Red Cap Base */}
      <rect x="5" y="2" width="6" height="8" fill="#E11D48" />
      <rect x="3" y="3" width="10" height="7" fill="#E11D48" />
      <rect x="2" y="5" width="12" height="5" fill="#E11D48" />

      {/* Top Red Highlight */}
      <rect x="6" y="2" width="4" height="1" fill="#FB7185" />
      <rect x="4" y="3" width="2" height="1" fill="#FB7185" />

      {/* White Spots */}
      {/* Center Top Spot */}
      <rect x="6" y="4" width="4" height="4" fill="#FFFFFF" />
      {/* Left Spot */}
      <rect x="2" y="6" width="2" height="3" fill="#FFFFFF" />
      {/* Right Spot */}
      <rect x="12" y="6" width="2" height="3" fill="#FFFFFF" />

      {/* Cream Stem Body */}
      <rect x="4" y="11" width="8" height="4" fill="#FFF5D6" />
      {/* Stem Shadow */}
      <rect x="4" y="14" width="8" height="1" fill="#E2D0A4" />

      {/* Eyes */}
      <rect x="5" y="12" width="1" height="2" fill="#102040" />
      <rect x="10" y="12" width="1" height="2" fill="#102040" />
    </svg>
  );
};
