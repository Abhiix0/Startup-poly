import React from 'react';

export const PixelHill: React.FC<{ size?: number; className?: string }> = ({
  size = 80,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size * 0.5625}
      viewBox="0 0 64 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Top Outline */}
      <rect x="24" y="2" width="16" height="2" fill="#102040" />
      <rect x="18" y="4" width="6" height="2" fill="#102040" />
      <rect x="40" y="4" width="6" height="2" fill="#102040" />
      <rect x="12" y="6" width="6" height="3" fill="#102040" />
      <rect x="46" y="6" width="6" height="3" fill="#102040" />
      <rect x="8" y="9" width="4" height="4" fill="#102040" />
      <rect x="52" y="9" width="4" height="4" fill="#102040" />
      <rect x="5" y="13" width="3" height="5" fill="#102040" />
      <rect x="56" y="13" width="3" height="5" fill="#102040" />
      <rect x="3" y="18" width="2" height="6" fill="#102040" />
      <rect x="59" y="18" width="2" height="6" fill="#102040" />
      <rect x="2" y="24" width="1" height="12" fill="#102040" />
      <rect x="61" y="24" width="1" height="12" fill="#102040" />

      {/* Main Light Green Fill (#22B14C / #4ADE80 highlight) */}
      <rect x="24" y="4" width="16" height="32" fill="#22B14C" />
      <rect x="18" y="6" width="6" height="30" fill="#22B14C" />
      <rect x="40" y="6" width="6" height="30" fill="#22B14C" />
      <rect x="12" y="9" width="6" height="27" fill="#22B14C" />
      <rect x="46" y="9" width="6" height="27" fill="#22B14C" />
      <rect x="8" y="13" width="4" height="23" fill="#22B14C" />
      <rect x="52" y="13" width="4" height="23" fill="#22B14C" />
      <rect x="5" y="18" width="3" height="18" fill="#22B14C" />
      <rect x="56" y="18" width="3" height="18" fill="#22B14C" />
      <rect x="3" y="24" width="2" height="12" fill="#22B14C" />
      <rect x="59" y="24" width="2" height="12" fill="#22B14C" />

      {/* Top Left Highlight (#4ADE80) */}
      <rect x="24" y="4" width="10" height="2" fill="#4ADE80" />
      <rect x="18" y="6" width="5" height="2" fill="#4ADE80" />
      <rect x="12" y="9" width="5" height="3" fill="#4ADE80" />
      <rect x="8" y="13" width="3" height="4" fill="#4ADE80" />
      <rect x="5" y="18" width="2" height="5" fill="#4ADE80" />

      {/* Right Shadow Slope (#15803D) */}
      <rect x="36" y="4" width="4" height="32" fill="#15803D" />
      <rect x="40" y="6" width="6" height="30" fill="#15803D" />
      <rect x="46" y="9" width="6" height="27" fill="#15803D" />
      <rect x="52" y="13" width="4" height="23" fill="#15803D" />
      <rect x="56" y="18" width="3" height="18" fill="#15803D" />
      <rect x="59" y="24" width="2" height="12" fill="#15803D" />

      {/* Hill spot accents */}
      <rect x="20" y="14" width="3" height="3" fill="#15803D" />
      <rect x="26" y="22" width="4" height="3" fill="#15803D" />
    </svg>
  );
};
