import React from 'react';

export const PixelStar: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Outer Navy Outline */}
      <rect x="7" y="1" width="2" height="1" fill="#102040" />
      <rect x="6" y="2" width="1" height="2" fill="#102040" />
      <rect x="9" y="2" width="1" height="2" fill="#102040" />
      <rect x="1" y="4" width="5" height="1" fill="#102040" />
      <rect x="10" y="4" width="5" height="1" fill="#102040" />
      <rect x="0" y="5" width="1" height="2" fill="#102040" />
      <rect x="15" y="5" width="1" height="2" fill="#102040" />
      <rect x="1" y="7" width="3" height="1" fill="#102040" />
      <rect x="12" y="7" width="3" height="1" fill="#102040" />
      <rect x="4" y="8" width="1" height="2" fill="#102040" />
      <rect x="11" y="8" width="1" height="2" fill="#102040" />
      <rect x="3" y="10" width="1" height="2" fill="#102040" />
      <rect x="12" y="10" width="1" height="2" fill="#102040" />
      <rect x="2" y="12" width="1" height="3" fill="#102040" />
      <rect x="13" y="12" width="1" height="3" fill="#102040" />
      <rect x="3" y="15" width="3" height="1" fill="#102040" />
      <rect x="10" y="15" width="3" height="1" fill="#102040" />
      <rect x="6" y="13" width="1" height="2" fill="#102040" />
      <rect x="9" y="13" width="1" height="2" fill="#102040" />
      <rect x="7" y="12" width="2" height="1" fill="#102040" />

      {/* Gold Body */}
      <rect x="7" y="2" width="2" height="2" fill="#FFCC00" />
      <rect x="6" y="4" width="4" height="2" fill="#FFCC00" />
      <rect x="1" y="5" width="14" height="2" fill="#FFCC00" />
      <rect x="4" y="7" width="8" height="2" fill="#FFCC00" />
      <rect x="5" y="9" width="6" height="2" fill="#FFCC00" />
      <rect x="4" y="11" width="3" height="2" fill="#FFCC00" />
      <rect x="9" y="11" width="3" height="2" fill="#FFCC00" />
      <rect x="3" y="12" width="3" height="3" fill="#FFCC00" />
      <rect x="10" y="12" width="3" height="3" fill="#FFCC00" />

      {/* Specular Highlight */}
      <rect x="7" y="2" width="1" height="2" fill="#FFFBEB" />
      <rect x="6" y="4" width="2" height="1" fill="#FFFBEB" />
      <rect x="2" y="5" width="4" height="1" fill="#FFFBEB" />
      <rect x="6" y="6" width="2" height="2" fill="#FFFBEB" />

      {/* Shadow Inner Accent */}
      <rect x="11" y="6" width="3" height="1" fill="#D97706" />
      <rect x="5" y="14" width="1" height="1" fill="#D97706" />
      <rect x="10" y="14" width="1" height="1" fill="#D97706" />
      <rect x="11" y="13" width="1" height="2" fill="#D97706" />
    </svg>
  );
};
