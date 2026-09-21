import React from 'react';

export const PixelTerminalIcon: React.FC<{ size?: number; className?: string }> = ({
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
      {/* CRT Monitor Outer Outline (Navy) */}
      <rect x="2" y="2" width="20" height="15" fill="#102040" />

      {/* Monitor Casing (Beige/Gray #CBD5E1) */}
      <rect x="3" y="3" width="18" height="13" fill="#CBD5E1" />

      {/* Monitor Highlight */}
      <rect x="3" y="3" width="18" height="1" fill="#FAF8F5" />
      <rect x="3" y="3" width="1" height="13" fill="#FAF8F5" />

      {/* Dark CRT Screen Outline */}
      <rect x="4" y="4" width="16" height="10" fill="#102040" />

      {/* CRT Screen Inner (Deep Navy/Black) */}
      <rect x="5" y="5" width="14" height="8" fill="#0A1020" />

      {/* Terminal Prompt `> _` (Green Phosphor) */}
      {/* `>` symbol */}
      <rect x="7" y="7" width="1" height="1" fill="#22B14C" />
      <rect x="8" y="8" width="1" height="1" fill="#22B14C" />
      <rect x="7" y="9" width="1" height="1" fill="#22B14C" />
      {/* Blinking Cursor `_` */}
      <rect x="10" y="9" width="2" height="1" fill="#22B14C" />
      {/* Code line */}
      <rect x="7" y="11" width="6" height="1" fill="#166534" />

      {/* Monitor Stand (Neck) */}
      <rect x="10" y="17" width="4" height="2" fill="#102040" />
      <rect x="11" y="17" width="2" height="2" fill="#94A3B8" />

      {/* Base / Keyboard Outline */}
      <rect x="4" y="19" width="16" height="3" fill="#102040" />
      {/* Base / Keyboard Body */}
      <rect x="5" y="20" width="14" height="1" fill="#E2E8F0" />
      {/* Keyboard Key Pips */}
      <rect x="6" y="20" width="1" height="1" fill="#64748B" />
      <rect x="8" y="20" width="1" height="1" fill="#64748B" />
      <rect x="10" y="20" width="1" height="1" fill="#64748B" />
      <rect x="12" y="20" width="1" height="1" fill="#64748B" />
      <rect x="14" y="20" width="1" height="1" fill="#64748B" />
      <rect x="16" y="20" width="1" height="1" fill="#64748B" />
    </svg>
  );
};
