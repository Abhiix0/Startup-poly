import React from 'react';

export const PixelMascot: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
      aria-label="Poly the Founder Mascot"
      role="img"
    >
      {/* Cap/Hat (Arcade Green with Dark Bill) */}
      <rect x="7" y="1" width="9" height="1" fill="#102040" />
      <rect x="6" y="2" width="12" height="1" fill="#102040" />
      <rect x="6" y="3" width="13" height="2" fill="#22B14C" />
      <rect x="7" y="2" width="10" height="1" fill="#4ADE80" /> {/* Highlight */}
      <rect x="15" y="4" width="5" height="1" fill="#166534" /> {/* Cap visor */}
      <rect x="5" y="3" width="1" height="2" fill="#102040" />
      <rect x="19" y="4" width="1" height="1" fill="#102040" />

      {/* Hair (Dark Brown / Navy) */}
      <rect x="6" y="5" width="2" height="3" fill="#102040" />
      <rect x="16" y="5" width="2" height="2" fill="#102040" />

      {/* Face (Skin Tone #FFD1A4) */}
      <rect x="8" y="5" width="8" height="6" fill="#FFD1A4" />
      <rect x="7" y="7" width="1" height="3" fill="#FFD1A4" />
      <rect x="16" y="7" width="1" height="3" fill="#FFD1A4" />

      {/* Eyes (Dark Navy) */}
      <rect x="10" y="7" width="2" height="2" fill="#102040" />
      <rect x="14" y="7" width="2" height="2" fill="#102040" />
      {/* Eye highlights */}
      <rect x="10" y="7" width="1" height="1" fill="#FFFFFF" />
      <rect x="14" y="7" width="1" height="1" fill="#FFFFFF" />

      {/* Cheeks / Smile */}
      <rect x="8" y="9" width="1" height="1" fill="#F87171" />
      <rect x="15" y="9" width="1" height="1" fill="#F87171" />
      <rect x="11" y="10" width="3" height="1" fill="#102040" />

      {/* Hoodie Body (Coin Gold #FFCC00 with Dark Navy outlines) */}
      <rect x="6" y="11" width="12" height="6" fill="#FFCC00" />
      <rect x="5" y="12" width="1" height="5" fill="#102040" />
      <rect x="18" y="12" width="1" height="5" fill="#102040" />
      <rect x="8" y="11" width="8" height="1" fill="#FFFBEB" /> {/* Collar highlight */}
      <rect x="11" y="12" width="2" height="4" fill="#D97706" /> {/* Zipper */}

      {/* Laptop Held by Poly (Silver & Cyan screen) */}
      <rect x="12" y="13" width="7" height="1" fill="#102040" />
      <rect x="13" y="14" width="6" height="4" fill="#38BDF8" /> {/* Screen glow */}
      <rect x="14" y="15" width="4" height="2" fill="#E0F2FE" /> {/* Code on screen */}
      <rect x="11" y="17" width="8" height="1" fill="#94A3B8" /> {/* Keyboard base */}
      <rect x="10" y="17" width="1" height="1" fill="#102040" />
      <rect x="19" y="17" width="1" height="1" fill="#102040" />

      {/* Arms / Hands */}
      <rect x="5" y="13" width="2" height="3" fill="#FFCC00" />
      <rect x="6" y="16" width="2" height="1" fill="#FFD1A4" /> {/* Left hand */}
      <rect x="12" y="17" width="2" height="1" fill="#FFD1A4" /> {/* Right hand */}

      {/* Jeans (Dark Navy #102040 / Slate Blue #1E3A8A) */}
      <rect x="7" y="17" width="4" height="4" fill="#1E3A8A" />
      <rect x="13" y="18" width="4" height="3" fill="#1E3A8A" />
      <rect x="11" y="18" width="2" height="3" fill="#102040" />

      {/* Sneakers (Brick Brown #B84418 with White soles) */}
      <rect x="6" y="21" width="5" height="2" fill="#B84418" />
      <rect x="5" y="23" width="6" height="1" fill="#FFFFFF" />
      <rect x="13" y="21" width="5" height="2" fill="#B84418" />
      <rect x="13" y="23" width="6" height="1" fill="#FFFFFF" />

      {/* Outer base shadows */}
      <rect x="5" y="23" width="1" height="1" fill="#102040" />
      <rect x="18" y="23" width="1" height="1" fill="#102040" />
    </svg>
  );
};
