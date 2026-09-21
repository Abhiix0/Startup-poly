import React from 'react';

export const PixelPipe: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      width={40}
      height={24}
      viewBox="0 0 40 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pipe Lip Border */}
      <rect x="1" y="1" width="38" height="8" fill="#22B14C" stroke="#102040" strokeWidth="2" />
      {/* Pipe Lip Highlight */}
      <rect x="4" y="3" width="6" height="4" fill="#86EFAC" />
      {/* Pipe Stem */}
      <rect x="5" y="9" width="30" height="14" fill="#16A34A" stroke="#102040" strokeWidth="2" />
      {/* Pipe Stem Highlight */}
      <rect x="8" y="10" width="5" height="12" fill="#4ADE80" />
    </svg>
  );
};
