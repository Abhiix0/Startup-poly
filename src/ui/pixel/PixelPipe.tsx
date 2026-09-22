import React from 'react';

export interface PixelPipeProps {
  width?: number;
  height?: number;
  size?: number;
  className?: string;
}

export const PixelPipe: React.FC<PixelPipeProps> = ({
  width = 68,
  height = 58,
  size,
  className = '',
}) => {
  const actualWidth = width || (size ? size * (44 / 36) : 68);
  const actualHeight = height || size || 58;

  return (
    <svg
      width={actualWidth}
      height={actualHeight}
      viewBox="0 0 44 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pipe Lip / Rim Header */}
      <rect x="1" y="1" width="42" height="12" fill="#22C55E" stroke="#102040" strokeWidth="2" />
      {/* Lip Highlight */}
      <rect x="5" y="3" width="7" height="8" fill="#86EFAC" />
      <rect x="14" y="3" width="3" height="8" fill="#4ADE80" />
      {/* Lip Shadow */}
      <rect x="32" y="3" width="8" height="8" fill="#15803D" />

      {/* Pipe Stem Body */}
      <rect x="5" y="13" width="34" height="24" fill="#16A34A" stroke="#102040" strokeWidth="2" />
      {/* Stem Highlight */}
      <rect x="7" y="14" width="7" height="22" fill="#4ADE80" />
      <rect x="16" y="14" width="3" height="22" fill="#22C55E" />
      {/* Stem Shadow */}
      <rect x="30" y="14" width="7" height="22" fill="#15803D" />
    </svg>
  );
};
