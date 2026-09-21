import React from 'react';

export const PixelCoin: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
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
      {/* Outer Dark Navy Border */}
      <rect x="4" y="1" width="8" height="1" fill="#102040" />
      <rect x="2" y="2" width="2" height="2" fill="#102040" />
      <rect x="12" y="2" width="2" height="2" fill="#102040" />
      <rect x="1" y="4" width="1" height="8" fill="#102040" />
      <rect x="14" y="4" width="1" height="8" fill="#102040" />
      <rect x="2" y="12" width="2" height="2" fill="#102040" />
      <rect x="12" y="12" width="2" height="2" fill="#102040" />
      <rect x="4" y="14" width="8" height="1" fill="#102040" />

      {/* Gold Body */}
      <rect x="4" y="2" width="8" height="12" fill="#FFCC00" />
      <rect x="2" y="4" width="2" height="8" fill="#FFCC00" />
      <rect x="12" y="4" width="2" height="8" fill="#FFCC00" />

      {/* Specular Highlight (White Top-Left) */}
      <rect x="4" y="2" width="5" height="1" fill="#FFFBEB" />
      <rect x="3" y="3" width="2" height="2" fill="#FFFBEB" />
      <rect x="2" y="5" width="1" height="3" fill="#FFFBEB" />

      {/* Shadow Inner Rim (Dark Amber Bottom-Right) */}
      <rect x="5" y="13" width="7" height="1" fill="#D97706" />
      <rect x="12" y="11" width="2" height="2" fill="#D97706" />
      <rect x="13" y="6" width="1" height="6" fill="#D97706" />

      {/* Center Currency Symbol (₹ / $) */}
      <rect x="6" y="5" width="4" height="1" fill="#78350F" />
      <rect x="6" y="7" width="4" height="1" fill="#78350F" />
      <rect x="7" y="5" width="1" height="6" fill="#78350F" />
      <rect x="8" y="9" width="2" height="2" fill="#78350F" />
    </svg>
  );
};
