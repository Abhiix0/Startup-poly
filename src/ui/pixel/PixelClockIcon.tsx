import React from 'react';

export interface PixelClockIconProps {
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}

export const PixelClockIcon: React.FC<PixelClockIconProps> = ({
  size = 16,
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
      aria-label={ariaHidden ? undefined : 'Clock'}
    >
      {/* Top Button / Crown */}
      <rect x="7" y="0" width="2" height="1" fill="#102040" />

      {/* Clock Outer Rim (Navy #102040) */}
      <rect x="5" y="1" width="6" height="1" fill="#102040" />
      <rect x="3" y="2" width="2" height="1" fill="#102040" />
      <rect x="11" y="2" width="2" height="1" fill="#102040" />
      <rect x="2" y="3" width="1" height="2" fill="#102040" />
      <rect x="13" y="3" width="1" height="2" fill="#102040" />
      <rect x="1" y="5" width="1" height="6" fill="#102040" />
      <rect x="14" y="5" width="1" height="6" fill="#102040" />
      <rect x="2" y="11" width="1" height="2" fill="#102040" />
      <rect x="13" y="11" width="1" height="2" fill="#102040" />
      <rect x="3" y="13" width="2" height="1" fill="#102040" />
      <rect x="11" y="13" width="2" height="1" fill="#102040" />
      <rect x="5" y="14" width="6" height="1" fill="#102040" />

      {/* Clock Dial (White #FFFFFF) */}
      <rect x="5" y="2" width="6" height="1" fill="#FFFFFF" />
      <rect x="3" y="3" width="10" height="2" fill="#FFFFFF" />
      <rect x="2" y="5" width="12" height="6" fill="#FFFFFF" />
      <rect x="3" y="11" width="10" height="2" fill="#FFFFFF" />
      <rect x="5" y="13" width="6" height="1" fill="#FFFFFF" />

      {/* Clock Hands (Navy / Gold accent) */}
      <rect x="7" y="4" width="2" height="4" fill="#102040" /> {/* Hour hand */}
      <rect x="8" y="7" width="4" height="2" fill="#B84418" /> {/* Minute hand */}
      <rect x="7" y="7" width="2" height="2" fill="#FFCC00" /> {/* Center pin */}
    </svg>
  );
};
