import React from 'react';

export interface PixelCloudFluffyProps {
  size?: number;
  className?: string;
}

export const PixelCloudFluffy: React.FC<PixelCloudFluffyProps> = ({
  size = 64,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 40 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Outer Navy Outline (#102040) */}
      {/* Lump 2 (Tallest peak, left-center) */}
      <rect x="14" y="2" width="7" height="1" fill="#102040" />
      <rect x="12" y="3" width="2" height="1" fill="#102040" />
      <rect x="21" y="3" width="2" height="1" fill="#102040" />
      <rect x="10" y="4" width="2" height="1" fill="#102040" />

      {/* Lump 3 (Medium peak, right-center) */}
      <rect x="23" y="3" width="6" height="1" fill="#102040" />
      <rect x="29" y="4" width="2" height="1" fill="#102040" />
      <rect x="31" y="5" width="2" height="1" fill="#102040" />

      {/* Lump 1 (Left bump) */}
      <rect x="6" y="5" width="4" height="1" fill="#102040" />
      <rect x="4" y="6" width="2" height="1" fill="#102040" />
      <rect x="3" y="7" width="1" height="1" fill="#102040" />

      {/* Lump 4 (Right bump) */}
      <rect x="33" y="6" width="3" height="1" fill="#102040" />
      <rect x="36" y="7" width="1" height="1" fill="#102040" />

      {/* Left and Right Side Outlines */}
      <rect x="2" y="8" width="1" height="9" fill="#102040" />
      <rect x="37" y="8" width="1" height="9" fill="#102040" />

      {/* Bottom Outline */}
      <rect x="3" y="17" width="34" height="1" fill="#102040" />

      {/* White Body Fill (#FFFFFF) */}
      <rect x="14" y="3" width="7" height="1" fill="#FFFFFF" />
      <rect x="12" y="4" width="17" height="1" fill="#FFFFFF" />
      <rect x="10" y="5" width="21" height="1" fill="#FFFFFF" />
      <rect x="6" y="6" width="27" height="1" fill="#FFFFFF" />
      <rect x="4" y="7" width="32" height="1" fill="#FFFFFF" />
      <rect x="3" y="8" width="34" height="7" fill="#FFFFFF" />

      {/* Subtle Shading on Bottom Edge (#E2E8F0) */}
      <rect x="3" y="15" width="34" height="1" fill="#E2E8F0" />
      <rect x="4" y="16" width="32" height="1" fill="#E2E8F0" />
    </svg>
  );
};
