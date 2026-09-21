import React from 'react';

export interface PixelBuildingIconProps {
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}

export const PixelBuildingIcon: React.FC<PixelBuildingIconProps> = ({
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
      aria-label={ariaHidden ? undefined : 'Building'}
    >
      {/* Tower Antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#102040" />
      <rect x="7" y="0" width="2" height="1" fill="#D32F2F" />

      {/* Building Body Outer Outline (Navy #102040) */}
      <rect x="2" y="2" width="12" height="14" fill="#102040" />

      {/* Building Main Facade (Slate Blue / Sky Tint) */}
      <rect x="3" y="3" width="10" height="12" fill="#E2E8F0" />
      <rect x="3" y="3" width="2" height="12" fill="#CBD5E1" /> {/* Left shadow */}

      {/* Office Windows (Cyan / Gold illuminated) */}
      {/* Row 1 */}
      <rect x="6" y="4" width="2" height="2" fill="#38BDF8" />
      <rect x="9" y="4" width="2" height="2" fill="#FFCC00" />
      {/* Row 2 */}
      <rect x="6" y="7" width="2" height="2" fill="#FFCC00" />
      <rect x="9" y="7" width="2" height="2" fill="#38BDF8" />
      {/* Row 3 */}
      <rect x="6" y="10" width="2" height="2" fill="#38BDF8" />
      <rect x="9" y="10" width="2" height="2" fill="#FFCC00" />

      {/* Main Entrance Door */}
      <rect x="7" y="13" width="2" height="2" fill="#102040" />

      {/* Ground Foundation */}
      <rect x="1" y="15" width="14" height="1" fill="#102040" />
    </svg>
  );
};
