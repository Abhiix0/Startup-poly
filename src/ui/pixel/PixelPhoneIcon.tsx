import React from 'react';

export const PixelPhoneIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Phone (Back/Left) */}
      {/* Phone Navy Outline */}
      <rect x="2" y="2" width="10" height="19" fill="#102040" />
      {/* Phone Body White/Cream */}
      <rect x="3" y="3" width="8" height="17" fill="#FAF8F5" />
      {/* Phone Screen Dark Navy */}
      <rect x="4" y="5" width="6" height="11" fill="#102040" />
      {/* Phone Screen Glow / Content */}
      <rect x="5" y="6" width="4" height="2" fill="#5C94FC" />
      <rect x="5" y="9" width="3" height="1" fill="#22B14C" />
      <rect x="5" y="11" width="4" height="1" fill="#FFCC00" />
      {/* Phone Speaker & Home Button */}
      <rect x="6" y="3" width="2" height="1" fill="#64748B" />
      <rect x="6" y="18" width="2" height="1" fill="#64748B" />

      {/* Handheld Console / Controller (Front/Right) */}
      {/* Console Outer Navy Outline */}
      <rect x="10" y="8" width="12" height="14" fill="#102040" />
      {/* Console Body Light Gray */}
      <rect x="11" y="9" width="10" height="12" fill="#E2E8F0" />
      {/* Console Screen Outer Frame */}
      <rect x="12" y="10" width="8" height="6" fill="#102040" />
      {/* Console Screen Inner Green LCD */}
      <rect x="13" y="11" width="6" height="4" fill="#8BAC0F" />
      {/* Pixel sprite on LCD */}
      <rect x="14" y="12" width="2" height="2" fill="#0F380F" />

      {/* D-Pad (Navy) */}
      <rect x="12" y="18" width="3" height="1" fill="#102040" />
      <rect x="13" y="17" width="1" height="3" fill="#102040" />

      {/* Action Buttons (Red/Navy) */}
      <rect x="18" y="18" width="1" height="1" fill="#D32F2F" />
      <rect x="19" y="17" width="1" height="1" fill="#D32F2F" />
    </svg>
  );
};
