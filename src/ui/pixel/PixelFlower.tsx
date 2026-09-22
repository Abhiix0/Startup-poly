import React from 'react';

export interface PixelFlowerProps {
  size?: number;
  variant?: 1 | 2;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * PixelFlower: Retro 8-bit wildflower decoration matching 2D platformer aesthetics.
 */
export const PixelFlower: React.FC<PixelFlowerProps> = ({
  size = 18,
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
      aria-label={ariaHidden ? undefined : 'Flower'}
    >
      {variant === 1 ? (
        // Variant 1: White Daisy with Golden Core & Green Stem/Leaf
        <g id="flower-daisy">
          {/* Stem & Leaf Outlines */}
          <rect x="7" y="9" width="2" height="7" fill="#102040" />
          <rect x="4" y="11" width="3" height="3" fill="#102040" />
          <rect x="9" y="12" width="3" height="3" fill="#102040" />

          {/* Stem & Leaf Fills */}
          <rect x="7" y="9" width="2" height="6" fill="#15803D" />
          <rect x="5" y="12" width="2" height="1" fill="#22C55E" />
          <rect x="9" y="13" width="2" height="1" fill="#22C55E" />

          {/* Blossom Outline */}
          <rect x="5" y="2" width="6" height="7" fill="#102040" />
          <rect x="4" y="3" width="8" height="5" fill="#102040" />

          {/* White Petals */}
          <rect x="5" y="3" width="6" height="5" fill="#FFFFFF" />
          <rect x="6" y="2" width="4" height="7" fill="#FFFFFF" />

          {/* Golden Yellow Core */}
          <rect x="6" y="4" width="4" height="3" fill="#FFCC00" />
          <rect x="7" y="5" width="2" height="1" fill="#FF8C00" />
        </g>
      ) : (
        // Variant 2: Orange/Coral Wildflower with White/Cream Core & Green Stem/Leaf
        <g id="flower-orange">
          {/* Stem & Leaf Outlines */}
          <rect x="7" y="9" width="2" height="7" fill="#102040" />
          <rect x="3" y="12" width="4" height="3" fill="#102040" />

          {/* Stem & Leaf Fills */}
          <rect x="7" y="9" width="2" height="6" fill="#15803D" />
          <rect x="4" y="13" width="3" height="1" fill="#22C55E" />

          {/* Blossom Outline */}
          <rect x="5" y="2" width="6" height="7" fill="#102040" />
          <rect x="4" y="3" width="8" height="5" fill="#102040" />

          {/* Orange/Coral Petals */}
          <rect x="5" y="3" width="6" height="5" fill="#FF7A30" />
          <rect x="6" y="2" width="4" height="7" fill="#FF7A30" />

          {/* Cream / White Core */}
          <rect x="6" y="4" width="4" height="3" fill="#FFF5D6" />
          <rect x="7" y="5" width="2" height="1" fill="#FFCC00" />
        </g>
      )}
    </svg>
  );
};
