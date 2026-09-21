import React from 'react';

export const PixelTrophy: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Trophy Cup Body Outline */}
      <rect x="3" y="1" width="10" height="1" fill="#102040" />
      <rect x="2" y="2" width="1" height="5" fill="#102040" />
      <rect x="13" y="2" width="1" height="5" fill="#102040" />
      <rect x="3" y="7" width="1" height="2" fill="#102040" />
      <rect x="12" y="7" width="1" height="2" fill="#102040" />
      <rect x="4" y="9" width="8" height="1" fill="#102040" />

      {/* Handles */}
      <rect x="1" y="2" width="1" height="4" fill="#102040" />
      <rect x="14" y="2" width="1" height="4" fill="#102040" />
      <rect x="2" y="6" width="1" height="1" fill="#102040" />
      <rect x="13" y="6" width="1" height="1" fill="#102040" />

      {/* Stem & Base */}
      <rect x="7" y="10" width="2" height="3" fill="#102040" />
      <rect x="4" y="13" width="8" height="1" fill="#102040" />
      <rect x="3" y="14" width="10" height="1" fill="#102040" />

      {/* Gold Infill */}
      <rect x="3" y="2" width="10" height="5" fill="#FFCC00" />
      <rect x="4" y="7" width="8" height="2" fill="#FFCC00" />
      <rect x="5" y="13" width="6" height="1" fill="#FFCC00" />
      <rect x="4" y="14" width="8" height="1" fill="#EAB308" />

      {/* Specular Glint */}
      <rect x="4" y="2" width="2" height="4" fill="#FEF9C3" />
      <rect x="4" y="3" width="1" height="3" fill="#FFFFFF" />
    </svg>
  );
};
