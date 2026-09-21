import React from 'react';

export const PixelSparkle: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Center Core (White) */}
      <rect x="4" y="4" width="3" height="3" fill="#FFFFFF" />

      {/* 4 Points (Gold/Cream) */}
      <rect x="5" y="1" width="1" height="3" fill="#FFFBEB" />
      <rect x="5" y="7" width="1" height="3" fill="#FFFBEB" />
      <rect x="1" y="5" width="3" height="1" fill="#FFFBEB" />
      <rect x="7" y="5" width="3" height="1" fill="#FFFBEB" />

      {/* Diagonal subtle glints */}
      <rect x="3" y="3" width="1" height="1" fill="#FFCC00" />
      <rect x="7" y="3" width="1" height="1" fill="#FFCC00" />
      <rect x="3" y="7" width="1" height="1" fill="#FFCC00" />
      <rect x="7" y="7" width="1" height="1" fill="#FFCC00" />
    </svg>
  );
};
