import React from 'react';

/**
 * 16-Bit Spinning Gold Coin with 4-frame rotation illusion
 */
export const RetroCoin: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 20,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`inline-block anim-retro-coin-spin shrink-0 select-none ${className}`}
      style={{ width: size, height: size * 1.25, ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 20"
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
        fill="none"
      >
        {/* Outer Coin Border */}
        <rect x="4" y="0" width="8" height="2" fill="#102040" />
        <rect x="2" y="2" width="2" height="2" fill="#102040" />
        <rect x="12" y="2" width="2" height="2" fill="#102040" />
        <rect x="0" y="4" width="2" height="12" fill="#102040" />
        <rect x="14" y="4" width="2" height="12" fill="#102040" />
        <rect x="2" y="16" width="2" height="2" fill="#102040" />
        <rect x="12" y="16" width="2" height="2" fill="#102040" />
        <rect x="4" y="18" width="8" height="2" fill="#102040" />

        {/* Gold Body */}
        <rect x="4" y="2" width="8" height="16" fill="#FFD700" />
        <rect x="2" y="4" width="12" height="12" fill="#FFCC00" />

        {/* Inner Shading & Ridge */}
        <rect x="2" y="4" width="2" height="12" fill="#FFE57F" />
        <rect x="12" y="4" width="2" height="12" fill="#E69500" />
        <rect x="4" y="2" width="8" height="2" fill="#FFF9C4" />
        <rect x="4" y="16" width="8" height="2" fill="#C67D00" />

        {/* Center Vertical Ingot Line */}
        <rect x="7" y="6" width="2" height="8" fill="#B87300" />
        <rect x="6" y="7" width="1" height="6" fill="#FFF9C4" />
      </svg>
    </div>
  );
};

/**
 * 16-Bit Classic Pacing Koopa / Turtle Platformer Critter
 */
export const RetroKoopa: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 28"
        className="w-full h-full anim-koopa-walk"
        style={{ imageRendering: 'pixelated' }}
        fill="none"
      >
        {/* Head & Beak */}
        <rect x="14" y="2" width="8" height="8" fill="#FACC15" />
        <rect x="16" y="0" width="4" height="2" fill="#102040" />
        <rect x="22" y="4" width="2" height="6" fill="#102040" />
        <rect x="14" y="10" width="8" height="2" fill="#102040" />
        {/* Eye */}
        <rect x="16" y="4" width="3" height="4" fill="#FFFFFF" />
        <rect x="17" y="5" width="2" height="3" fill="#102040" />
        {/* Green Shell */}
        <rect x="6" y="8" width="12" height="14" fill="#22C55E" />
        <rect x="4" y="10" width="2" height="10" fill="#15803D" />
        <rect x="18" y="10" width="2" height="10" fill="#15803D" />
        <rect x="8" y="6" width="8" height="2" fill="#102040" />
        <rect x="4" y="10" width="2" height="2" fill="#102040" />
        <rect x="2" y="12" width="2" height="6" fill="#102040" />
        <rect x="6" y="22" width="12" height="2" fill="#102040" />
        {/* Shell Highlights / Hex Grid */}
        <rect x="8" y="10" width="3" height="4" fill="#86EFAC" />
        <rect x="13" y="10" width="3" height="4" fill="#86EFAC" />
        <rect x="8" y="16" width="3" height="4" fill="#166534" />
        <rect x="13" y="16" width="3" height="4" fill="#166534" />
        {/* White Belly Brim */}
        <rect x="4" y="20" width="14" height="2" fill="#FEF08A" />
        <rect x="4" y="22" width="14" height="1" fill="#CA8A04" />
        {/* Feet */}
        <rect x="6" y="24" width="5" height="3" fill="#FACC15" />
        <rect x="5" y="26" width="7" height="2" fill="#CA8A04" />
        <rect x="14" y="24" width="5" height="3" fill="#FACC15" />
        <rect x="13" y="26" width="7" height="2" fill="#CA8A04" />
      </svg>
    </div>
  );
};

/**
 * 16-Bit Patrolling Brown Goomba / Mushroom Critter
 */
export const RetroGoomba: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = '',
}) => {
  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full anim-goomba-waddle"
        style={{ imageRendering: 'pixelated' }}
        fill="none"
      >
        {/* Cap Outline */}
        <rect x="6" y="0" width="12" height="2" fill="#102040" />
        <rect x="4" y="2" width="2" height="2" fill="#102040" />
        <rect x="18" y="2" width="2" height="2" fill="#102040" />
        <rect x="2" y="4" width="2" height="8" fill="#102040" />
        <rect x="20" y="4" width="2" height="8" fill="#102040" />
        <rect x="0" y="8" width="2" height="4" fill="#102040" />
        <rect x="22" y="8" width="2" height="4" fill="#102040" />

        {/* Cap Body (Brown) */}
        <rect x="4" y="2" width="16" height="10" fill="#9A3412" />
        <rect x="2" y="6" width="20" height="6" fill="#B45309" />
        <rect x="6" y="2" width="12" height="2" fill="#D97706" />

        {/* Stem / Face */}
        <rect x="6" y="12" width="12" height="6" fill="#FED7AA" />
        <rect x="4" y="12" width="2" height="6" fill="#102040" />
        <rect x="18" y="12" width="2" height="6" fill="#102040" />

        {/* Angry Eyes */}
        <rect x="7" y="12" width="3" height="4" fill="#FFFFFF" />
        <rect x="8" y="13" width="2" height="3" fill="#102040" />
        <rect x="6" y="11" width="4" height="1" fill="#102040" />

        <rect x="14" y="12" width="3" height="4" fill="#FFFFFF" />
        <rect x="14" y="13" width="2" height="3" fill="#102040" />
        <rect x="14" y="11" width="4" height="1" fill="#102040" />

        {/* Two Big Dark Feet */}
        <rect x="2" y="18" width="8" height="5" fill="#102040" />
        <rect x="3" y="19" width="6" height="3" fill="#451A03" />
        <rect x="14" y="18" width="8" height="5" fill="#102040" />
        <rect x="15" y="19" width="6" height="3" fill="#451A03" />
      </svg>
    </div>
  );
};

/**
 * 16-Bit Caped / Jumper Retro Founder Hero leaping in mid-air
 */
export const RetroFounderJumper: React.FC<{ size?: number; className?: string; variant?: 'blue' | 'red' }> = ({
  size = 36,
  className = '',
  variant = 'blue',
}) => {
  const shirtColor = variant === 'blue' ? '#3B82F6' : '#EF4444';
  const overallColor = variant === 'blue' ? '#1E3A8A' : '#1D4ED8';
  const capColor = variant === 'blue' ? '#2563EB' : '#DC2626';

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size * 1.2 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 28 34"
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
        fill="none"
      >
        {/* Cap visor extending right */}
        <rect x="12" y="2" width="12" height="4" fill={capColor} />
        <rect x="14" y="0" width="8" height="2" fill={capColor} />
        <rect x="22" y="4" width="4" height="2" fill={capColor} />
        <rect x="10" y="2" width="2" height="6" fill="#102040" />

        {/* Face & Ear */}
        <rect x="12" y="6" width="10" height="6" fill="#FED7AA" />
        <rect x="18" y="7" width="2" height="3" fill="#102040" />
        {/* Mustache */}
        <rect x="18" y="10" width="8" height="2" fill="#451A03" />
        {/* Brown Hair */}
        <rect x="8" y="6" width="4" height="6" fill="#78350F" />

        {/* Raised Fist (punching up!) */}
        <rect x="18" y="0" width="6" height="6" fill="#FED7AA" />
        <rect x="18" y="0" width="6" height="1" fill="#102040" />
        <rect x="23" y="1" width="1" height="5" fill="#102040" />

        {/* Shirt & Yellow Tie / Suspenders */}
        <rect x="8" y="12" width="14" height="8" fill={shirtColor} />
        <rect x="13" y="12" width="3" height="6" fill="#FACC15" />

        {/* Overalls */}
        <rect x="6" y="18" width="16" height="8" fill={overallColor} />
        <rect x="8" y="16" width="3" height="4" fill={overallColor} />
        <rect x="16" y="16" width="3" height="4" fill={overallColor} />
        <rect x="8" y="18" width="2" height="2" fill="#FACC15" />
        <rect x="17" y="18" width="2" height="2" fill="#FACC15" />

        {/* Cape flying back (Yellow or Green) */}
        <path d="M 4,14 L 0,26 L 8,24 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />

        {/* Kicking Legs (Jumping pose) */}
        <rect x="4" y="24" width="6" height="5" fill={overallColor} />
        <rect x="2" y="28" width="8" height="4" fill="#78350F" />

        <rect x="16" y="22" width="6" height="5" fill={overallColor} />
        <rect x="18" y="26" width="8" height="4" fill="#78350F" />
      </svg>
    </div>
  );
};

/**
 * 16-Bit Bumping Question Block with Dispensed Spinning Coin & Sparkles
 */
export const RetroDispensingBlock: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ width: size }}
      aria-hidden="true"
    >
      {/* Dispensed Spinning Gold Coin flying out of block */}
      <div className="anim-coin-dispensed absolute -top-8 pointer-events-none">
        <RetroCoin size={size * 0.7} />
      </div>

      {/* Floating ? Block */}
      <div
        className="anim-block-hit-bounce relative border-2 border-[#102040] shadow-[2px_2px_0px_#102040]"
        style={{ width: size, height: size, backgroundColor: '#E39B00' }}
      >
        {/* Top/Left Highlights */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFD700]" />
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#FFD700]" />
        {/* Bottom/Right Shadows */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#9A6200]" />
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#9A6200]" />

        {/* 4 Corner Rivets */}
        <div className="absolute top-1 left-1 w-1 h-1 bg-[#102040]" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-[#102040]" />
        <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#102040]" />
        <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#102040]" />

        {/* Question Mark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-pixel font-black text-white"
            style={{
              fontSize: size * 0.55,
              textShadow: '1px 1px 0 #102040, -1px -1px 0 #102040',
            }}
          >
            ?
          </span>
        </div>
      </div>
    </div>
  );
};
