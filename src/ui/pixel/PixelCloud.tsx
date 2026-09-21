import React from 'react';

export const PixelCloud: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 32 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Outer Navy Outline */}
      <rect x="10" y="2" width="12" height="1" fill="#102040" />
      <rect x="7" y="3" width="3" height="1" fill="#102040" />
      <rect x="22" y="3" width="4" height="1" fill="#102040" />
      <rect x="5" y="4" width="2" height="1" fill="#102040" />
      <rect x="26" y="4" width="2" height="1" fill="#102040" />
      <rect x="3" y="5" width="2" height="1" fill="#102040" />
      <rect x="28" y="5" width="2" height="1" fill="#102040" />
      <rect x="2" y="6" width="1" height="7" fill="#102040" />
      <rect x="30" y="6" width="1" height="7" fill="#102040" />
      <rect x="3" y="13" width="26" height="1" fill="#102040" />

      {/* Cloud Body White */}
      <rect x="10" y="3" width="12" height="10" fill="#FFFFFF" />
      <rect x="7" y="4" width="19" height="9" fill="#FFFFFF" />
      <rect x="5" y="5" width="23" height="8" fill="#FFFFFF" />
      <rect x="3" y="6" width="27" height="7" fill="#FFFFFF" />

      {/* Subtle Shading on Bottom Edge */}
      <rect x="4" y="12" width="25" height="1" fill="#E2E8F0" />
    </svg>
  );
};
