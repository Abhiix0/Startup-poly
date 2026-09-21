import React from 'react';

export const PixelCharacter: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Cap (Green #22B14C) */}
      <rect x="4" y="1" width="7" height="1" fill="#102040" />
      <rect x="3" y="2" width="9" height="1" fill="#102040" />
      <rect x="4" y="2" width="7" height="1" fill="#22B14C" />
      {/* Cap visor */}
      <rect x="3" y="3" width="11" height="1" fill="#102040" />
      <rect x="4" y="3" width="9" height="1" fill="#22B14C" />

      {/* Head / Face (Skin #FED7AA, Hair #78350F) */}
      <rect x="3" y="4" width="8" height="4" fill="#FED7AA" />
      {/* Hair */}
      <rect x="3" y="4" width="2" height="3" fill="#78350F" />
      <rect x="3" y="7" width="1" height="1" fill="#78350F" />
      {/* Eye */}
      <rect x="8" y="4" width="1" height="2" fill="#102040" />
      {/* Nose */}
      <rect x="9" y="5" width="2" height="1" fill="#FDBA74" />
      {/* Moustache */}
      <rect x="7" y="6" width="4" height="1" fill="#78350F" />

      {/* Shirt (Gold #FFCC00) */}
      <rect x="2" y="8" width="11" height="3" fill="#FFCC00" />
      <rect x="1" y="9" width="2" height="2" fill="#FFCC00" />
      <rect x="12" y="9" width="2" height="2" fill="#FFCC00" />
      {/* Hands */}
      <rect x="1" y="11" width="2" height="2" fill="#FED7AA" />
      <rect x="12" y="11" width="2" height="2" fill="#FED7AA" />

      {/* Overalls (Blue #3B6FE0) */}
      <rect x="4" y="9" width="2" height="2" fill="#3B6FE0" />
      <rect x="9" y="9" width="2" height="2" fill="#3B6FE0" />
      {/* Overall straps gold button */}
      <rect x="4" y="10" width="1" height="1" fill="#FFCC00" />
      <rect x="10" y="10" width="1" height="1" fill="#FFCC00" />
      {/* Body pants */}
      <rect x="4" y="11" width="7" height="4" fill="#3B6FE0" />

      {/* Legs & Shoes (Walking Pose) */}
      {/* Left leg/shoe forward */}
      <rect x="2" y="15" width="4" height="3" fill="#3B6FE0" />
      <rect x="1" y="17" width="5" height="2" fill="#102040" />
      {/* Right leg/shoe back */}
      <rect x="9" y="15" width="4" height="3" fill="#3B6FE0" />
      <rect x="9" y="17" width="5" height="2" fill="#102040" />
    </svg>
  );
};
