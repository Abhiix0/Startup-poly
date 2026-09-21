import React from 'react';

export const PixelGoomba: React.FC<{ size?: number; className?: string }> = ({
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
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Head Outer Outline */}
      <rect x="6" y="1" width="4" height="1" fill="#102040" />
      <rect x="4" y="2" width="2" height="1" fill="#102040" />
      <rect x="10" y="2" width="2" height="1" fill="#102040" />
      <rect x="2" y="3" width="2" height="2" fill="#102040" />
      <rect x="12" y="3" width="2" height="2" fill="#102040" />
      <rect x="1" y="5" width="1" height="5" fill="#102040" />
      <rect x="14" y="5" width="1" height="5" fill="#102040" />
      <rect x="2" y="10" width="12" height="1" fill="#102040" />

      {/* Mushroom Cap (Brown #B84418) */}
      <rect x="6" y="2" width="4" height="1" fill="#B84418" />
      <rect x="4" y="3" width="8" height="2" fill="#B84418" />
      <rect x="2" y="5" width="12" height="3" fill="#B84418" />
      {/* Cap highlight */}
      <rect x="6" y="2" width="3" height="1" fill="#D96836" />
      <rect x="4" y="3" width="2" height="1" fill="#D96836" />

      {/* Face (Cream #FAF8F5) */}
      <rect x="2" y="8" width="12" height="2" fill="#FAF8F5" />
      {/* Eyes & Brows */}
      <rect x="4" y="7" width="2" height="1" fill="#102040" />
      <rect x="10" y="7" width="2" height="1" fill="#102040" />
      <rect x="5" y="8" width="1" height="2" fill="#102040" />
      <rect x="10" y="8" width="1" height="2" fill="#102040" />

      {/* Feet (Navy #102040) */}
      <rect x="1" y="11" width="5" height="4" fill="#102040" />
      <rect x="10" y="11" width="5" height="4" fill="#102040" />
      {/* Foot sole detail */}
      <rect x="2" y="12" width="3" height="2" fill="#64748B" />
      <rect x="11" y="12" width="3" height="2" fill="#64748B" />
    </svg>
  );
};
