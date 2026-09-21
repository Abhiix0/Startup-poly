import React from 'react';

export interface PixelTeamIconProps {
  size?: number;
  className?: string;
  ariaHidden?: boolean;
}

export const PixelTeamIcon: React.FC<PixelTeamIconProps> = ({
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
      aria-label={ariaHidden ? undefined : 'Teams'}
    >
      {/* Left Founder Avatar */}
      {/* Cap (Green) */}
      <rect x="2" y="2" width="4" height="2" fill="#22B14C" />
      <rect x="1" y="3" width="1" height="1" fill="#102040" />
      <rect x="6" y="3" width="1" height="1" fill="#166534" />
      {/* Face (Skin) */}
      <rect x="2" y="4" width="4" height="3" fill="#FFD1A4" />
      <rect x="3" y="5" width="1" height="1" fill="#102040" /> {/* Eye */}
      {/* Body / Shirt (Gold) */}
      <rect x="1" y="7" width="6" height="5" fill="#FFCC00" />
      <rect x="0" y="8" width="1" height="4" fill="#102040" />
      <rect x="2" y="12" width="4" height="3" fill="#1E3A8A" /> {/* Pants */}

      {/* Right Co-founder Avatar */}
      {/* Hair (Navy) */}
      <rect x="10" y="2" width="4" height="2" fill="#102040" />
      {/* Face (Skin) */}
      <rect x="10" y="4" width="4" height="3" fill="#FFD1A4" />
      <rect x="11" y="5" width="1" height="1" fill="#102040" /> {/* Eye */}
      {/* Body / Shirt (Cyan/Sky) */}
      <rect x="9" y="7" width="6" height="5" fill="#5C94FC" />
      <rect x="15" y="8" width="1" height="4" fill="#102040" />
      <rect x="10" y="12" width="4" height="3" fill="#1E3A8A" /> {/* Pants */}

      {/* Outlines & Separators */}
      <rect x="7" y="7" width="2" height="7" fill="#102040" />
      <rect x="1" y="15" width="14" height="1" fill="#102040" />
    </svg>
  );
};
