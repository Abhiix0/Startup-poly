import React from 'react';

export const PixelQuestionBlock: React.FC<{ size?: number; className?: string }> = ({
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
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Outer Navy Border */}
      <rect width="16" height="16" fill="#102040" />

      {/* Main Gold Body */}
      <rect x="1" y="1" width="14" height="14" fill="#FFCC00" />

      {/* Top & Left Highlight */}
      <rect x="1" y="1" width="14" height="1" fill="#FFFBEB" />
      <rect x="1" y="1" width="1" height="14" fill="#FFFBEB" />

      {/* Bottom & Right Brick Shadow */}
      <rect x="2" y="14" width="13" height="1" fill="#B84418" />
      <rect x="14" y="2" width="1" height="13" fill="#B84418" />

      {/* Corner Rivets (Navy) */}
      <rect x="2" y="2" width="1" height="1" fill="#102040" />
      <rect x="13" y="2" width="1" height="1" fill="#102040" />
      <rect x="2" y="13" width="1" height="1" fill="#102040" />
      <rect x="13" y="13" width="1" height="1" fill="#102040" />

      {/* Question Mark "?" Pixel Pattern (Navy) */}
      <rect x="6" y="4" width="4" height="1" fill="#102040" />
      <rect x="5" y="5" width="2" height="2" fill="#102040" />
      <rect x="9" y="5" width="2" height="3" fill="#102040" />
      <rect x="7" y="7" width="2" height="2" fill="#102040" />
      {/* Dot */}
      <rect x="7" y="10" width="2" height="2" fill="#102040" />
    </svg>
  );
};
