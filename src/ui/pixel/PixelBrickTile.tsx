import React from 'react';

export const PixelBrickTile: React.FC<{
  className?: string;
  hasGrass?: boolean;
}> = ({ className = '', hasGrass = true }) => {
  return (
    <div
      className={`relative w-full h-8 overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: '#B84418',
        backgroundImage: `
          linear-gradient(to right, #102040 2px, transparent 2px),
          linear-gradient(to bottom, #102040 2px, transparent 2px)
        `,
        backgroundSize: '32px 16px',
        borderTop: hasGrass ? '4px solid #22B14C' : '4px solid #102040',
        boxShadow: hasGrass ? 'inset 0 4px 0 #4ADE80, 0 -2px 0 #102040' : undefined,
        imageRendering: 'pixelated',
      }}
    >
      {/* Decorative staggered brick mortar details */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="brick-pattern"
          width="32"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width="30" height="7" fill="#D96836" fillOpacity="0.4" />
          <rect x="0" y="7" width="32" height="1" fill="#802808" />
          <rect x="16" y="8" width="30" height="7" fill="#D96836" fillOpacity="0.4" />
          <rect x="0" y="15" width="32" height="1" fill="#802808" />
          <rect x="15" y="0" width="1" height="8" fill="#802808" />
          <rect x="31" y="8" width="1" height="8" fill="#802808" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#brick-pattern)" />
      </svg>
    </div>
  );
};
