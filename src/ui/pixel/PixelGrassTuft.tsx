import React from 'react';

export interface PixelGrassTuftProps {
  size?: number;
  variant?: 1 | 2;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * PixelGrassTuft: Small 2-tone pixel grass clump decoration (2 variants).
 */
export const PixelGrassTuft: React.FC<PixelGrassTuftProps> = ({
  size = 16,
  variant = 1,
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
      aria-label={ariaHidden ? undefined : 'Grass'}
    >
      {variant === 1 ? (
        // Variant 1: 3-blade tuft leaning left/center
        <g id="tuft-1">
          {/* Outlines (Navy #102040) */}
          <rect x="2" y="8" width="2" height="7" fill="#102040" />
          <rect x="6" y="5" width="2" height="10" fill="#102040" />
          <rect x="11" y="7" width="2" height="8" fill="#102040" />
          <rect x="1" y="14" width="14" height="2" fill="#102040" />

          {/* Grass Fill (Green #22B14C) */}
          <rect x="3" y="9" width="2" height="6" fill="#22B14C" />
          <rect x="7" y="6" width="2" height="9" fill="#22B14C" />
          <rect x="10" y="8" width="2" height="7" fill="#22B14C" />

          {/* Highlights (#4ADE80) */}
          <rect x="3" y="9" width="1" height="3" fill="#4ADE80" />
          <rect x="7" y="6" width="1" height="4" fill="#4ADE80" />
          <rect x="10" y="8" width="1" height="3" fill="#4ADE80" />
        </g>
      ) : (
        // Variant 2: Double tuft leaning right
        <g id="tuft-2">
          {/* Outlines (Navy #102040) */}
          <rect x="4" y="6" width="2" height="9" fill="#102040" />
          <rect x="9" y="4" width="2" height="11" fill="#102040" />
          <rect x="13" y="9" width="2" height="6" fill="#102040" />
          <rect x="2" y="14" width="13" height="2" fill="#102040" />

          {/* Grass Fill */}
          <rect x="5" y="7" width="2" height="8" fill="#22B14C" />
          <rect x="10" y="5" width="2" height="10" fill="#22B14C" />
          <rect x="12" y="10" width="2" height="5" fill="#22B14C" />

          {/* Highlights */}
          <rect x="5" y="7" width="1" height="4" fill="#4ADE80" />
          <rect x="10" y="5" width="1" height="5" fill="#4ADE80" />
          <rect x="12" y="10" width="1" height="2" fill="#4ADE80" />
        </g>
      )}
    </svg>
  );
};
