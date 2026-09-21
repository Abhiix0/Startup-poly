import React from 'react';

export type PolyAnimation = 'idle' | 'walk' | 'hop' | 'lean' | 'static';

export interface PixelPolyProps {
  size?: number;
  animation?: PolyAnimation;
  className?: string;
  stripClassName?: string;
  ariaHidden?: boolean;
}

/**
 * PixelPoly: The original startup founder mascot for STARTUPOLY.
 * 7-frame sprite strip (24x24 per frame, 168x24 total):
 * 0: idleA, 1: idleB, 2: walk1, 3: walk2, 4: walk3, 5: hop, 6: lean
 */
export const PixelPoly: React.FC<PixelPolyProps> = ({
  size = 48,
  animation = 'static',
  className = '',
  stripClassName = '',
  ariaHidden = true,
}) => {
  // Translate wrapper offset based on requested animation
  // 1 frame = 100% of the single-frame viewport width
  let animClass = '';
  let inlineTransform = '';

  switch (animation) {
    case 'idle':
      animClass = 'anim-poly-idle';
      break;
    case 'walk':
      animClass = 'anim-poly-walk';
      break;
    case 'hop':
      inlineTransform = 'translateX(-71.428%)'; // Frame 5: 5/7 = 71.428%
      break;
    case 'lean':
      inlineTransform = 'translateX(-85.714%)'; // Frame 6: 6/7 = 85.714%
      break;
    case 'static':
    default:
      inlineTransform = 'translateX(0%)'; // Frame 0
      break;
  }

  return (
    <div
      className={`inline-block overflow-hidden relative select-none flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
      }}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : 'Poly the Founder'}
    >
      <svg
        width={size * 7}
        height={size}
        viewBox="0 0 168 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className={`absolute top-0 left-0 h-full max-w-none poly-sprite-strip ${animClass} ${stripClassName}`}
        style={{
          width: `${size * 7}px`,
          imageRendering: 'pixelated',
          transform: inlineTransform || undefined,
        }}
      >
        {/* ========================================================================= */}
        {/* FRAME 0: idleA (x: 0..23)                                                */}
        {/* ========================================================================= */}
        <g id="frame-idleA">
          {/* Cap/Hat (Green #22B14C, Navy #102040 outline, #4ADE80 highlight) */}
          <rect x="7" y="1" width="9" height="1" fill="#102040" />
          <rect x="6" y="2" width="12" height="1" fill="#102040" />
          <rect x="6" y="3" width="13" height="2" fill="#22B14C" />
          <rect x="7" y="2" width="10" height="1" fill="#4ADE80" />
          <rect x="15" y="4" width="5" height="1" fill="#166534" />
          <rect x="5" y="3" width="1" height="2" fill="#102040" />
          <rect x="19" y="4" width="1" height="1" fill="#102040" />

          {/* Hair (Dark Navy #102040) */}
          <rect x="6" y="5" width="2" height="3" fill="#102040" />
          <rect x="16" y="5" width="2" height="2" fill="#102040" />

          {/* Face (Skin Tone #FFD1A4) */}
          <rect x="8" y="5" width="8" height="6" fill="#FFD1A4" />
          <rect x="7" y="7" width="1" height="3" fill="#FFD1A4" />
          <rect x="16" y="7" width="1" height="3" fill="#FFD1A4" />

          {/* Eyes (Dark Navy #102040 + White highlights) */}
          <rect x="10" y="7" width="2" height="2" fill="#102040" />
          <rect x="14" y="7" width="2" height="2" fill="#102040" />
          <rect x="10" y="7" width="1" height="1" fill="#FFFFFF" />
          <rect x="14" y="7" width="1" height="1" fill="#FFFFFF" />

          {/* Cheeks & Smile */}
          <rect x="8" y="9" width="1" height="1" fill="#F87171" />
          <rect x="15" y="9" width="1" height="1" fill="#F87171" />
          <rect x="11" y="10" width="3" height="1" fill="#102040" />

          {/* Gold Hoodie Body (#FFCC00) */}
          <rect x="6" y="11" width="12" height="6" fill="#FFCC00" />
          <rect x="5" y="12" width="1" height="5" fill="#102040" />
          <rect x="18" y="12" width="1" height="5" fill="#102040" />
          <rect x="8" y="11" width="8" height="1" fill="#FFFBEB" />
          <rect x="11" y="12" width="2" height="4" fill="#D97706" />

          {/* Lanyard / Startup Badge */}
          <rect x="9" y="12" width="1" height="4" fill="#3B82F6" />
          <rect x="14" y="12" width="1" height="4" fill="#3B82F6" />
          <rect x="10" y="15" width="4" height="2" fill="#FFFFFF" />
          <rect x="11" y="15" width="2" height="1" fill="#102040" />

          {/* Left / Right Arms */}
          <rect x="5" y="13" width="2" height="3" fill="#FFCC00" />
          <rect x="5" y="16" width="2" height="2" fill="#FFD1A4" />
          <rect x="17" y="13" width="2" height="3" fill="#FFCC00" />
          <rect x="17" y="16" width="2" height="2" fill="#FFD1A4" />

          {/* Jeans (#1E3A8A) */}
          <rect x="7" y="17" width="4" height="4" fill="#1E3A8A" />
          <rect x="13" y="17" width="4" height="4" fill="#1E3A8A" />
          <rect x="11" y="17" width="2" height="3" fill="#102040" />

          {/* Sneakers (Brick #B84418 with White soles) */}
          <rect x="6" y="21" width="5" height="2" fill="#B84418" />
          <rect x="5" y="23" width="6" height="1" fill="#FFFFFF" />
          <rect x="13" y="21" width="5" height="2" fill="#B84418" />
          <rect x="13" y="23" width="6" height="1" fill="#FFFFFF" />
        </g>

        {/* ========================================================================= */}
        {/* FRAME 1: idleB (x: 24..47) - subtle breathing & badge sway                */}
        {/* ========================================================================= */}
        <g id="frame-idleB" transform="translate(24, 0)">
          {/* Cap/Hat */}
          <rect x="7" y="1" width="9" height="1" fill="#102040" />
          <rect x="6" y="2" width="12" height="1" fill="#102040" />
          <rect x="6" y="3" width="13" height="2" fill="#22B14C" />
          <rect x="7" y="2" width="10" height="1" fill="#4ADE80" />
          <rect x="15" y="4" width="5" height="1" fill="#166534" />
          <rect x="5" y="3" width="1" height="2" fill="#102040" />
          <rect x="19" y="4" width="1" height="1" fill="#102040" />

          {/* Hair */}
          <rect x="6" y="5" width="2" height="3" fill="#102040" />
          <rect x="16" y="5" width="2" height="2" fill="#102040" />

          {/* Face */}
          <rect x="8" y="5" width="8" height="6" fill="#FFD1A4" />
          <rect x="7" y="7" width="1" height="3" fill="#FFD1A4" />
          <rect x="16" y="7" width="1" height="3" fill="#FFD1A4" />

          {/* Blinking Eyes */}
          <rect x="10" y="8" width="2" height="1" fill="#102040" />
          <rect x="14" y="8" width="2" height="1" fill="#102040" />

          {/* Cheeks & Smile */}
          <rect x="8" y="9" width="1" height="1" fill="#F87171" />
          <rect x="15" y="9" width="1" height="1" fill="#F87171" />
          <rect x="11" y="10" width="3" height="1" fill="#102040" />

          {/* Gold Hoodie Body */}
          <rect x="6" y="11" width="12" height="6" fill="#FFCC00" />
          <rect x="5" y="12" width="1" height="5" fill="#102040" />
          <rect x="18" y="12" width="1" height="5" fill="#102040" />
          <rect x="8" y="11" width="8" height="1" fill="#FFFBEB" />
          <rect x="11" y="12" width="2" height="4" fill="#D97706" />

          {/* Lanyard Badge slightly shifted */}
          <rect x="9" y="12" width="1" height="4" fill="#3B82F6" />
          <rect x="14" y="12" width="1" height="4" fill="#3B82F6" />
          <rect x="11" y="15" width="4" height="2" fill="#FFFFFF" />
          <rect x="12" y="15" width="2" height="1" fill="#102040" />

          {/* Arms */}
          <rect x="5" y="13" width="2" height="3" fill="#FFCC00" />
          <rect x="5" y="16" width="2" height="2" fill="#FFD1A4" />
          <rect x="17" y="13" width="2" height="3" fill="#FFCC00" />
          <rect x="17" y="16" width="2" height="2" fill="#FFD1A4" />

          {/* Jeans */}
          <rect x="7" y="17" width="4" height="4" fill="#1E3A8A" />
          <rect x="13" y="17" width="4" height="4" fill="#1E3A8A" />
          <rect x="11" y="17" width="2" height="3" fill="#102040" />

          {/* Sneakers */}
          <rect x="6" y="21" width="5" height="2" fill="#B84418" />
          <rect x="5" y="23" width="6" height="1" fill="#FFFFFF" />
          <rect x="13" y="21" width="5" height="2" fill="#B84418" />
          <rect x="13" y="23" width="6" height="1" fill="#FFFFFF" />
        </g>

        {/* ========================================================================= */}
        {/* FRAME 2: walk1 (x: 48..71) - Left leg forward, right leg back             */}
        {/* ========================================================================= */}
        <g id="frame-walk1" transform="translate(48, 0)">
          {/* Cap/Hat */}
          <rect x="8" y="1" width="9" height="1" fill="#102040" />
          <rect x="7" y="2" width="12" height="1" fill="#102040" />
          <rect x="7" y="3" width="13" height="2" fill="#22B14C" />
          <rect x="8" y="2" width="10" height="1" fill="#4ADE80" />
          <rect x="16" y="4" width="5" height="1" fill="#166534" />
          <rect x="6" y="3" width="1" height="2" fill="#102040" />

          {/* Hair & Face */}
          <rect x="7" y="5" width="2" height="3" fill="#102040" />
          <rect x="9" y="5" width="8" height="6" fill="#FFD1A4" />
          <rect x="11" y="7" width="2" height="2" fill="#102040" />
          <rect x="15" y="7" width="2" height="2" fill="#102040" />
          <rect x="12" y="10" width="3" height="1" fill="#102040" />

          {/* Hoodie Body */}
          <rect x="7" y="11" width="11" height="6" fill="#FFCC00" />
          <rect x="12" y="12" width="2" height="4" fill="#D97706" />

          {/* Arms swinging (Left forward, Right back) */}
          <rect x="4" y="12" width="3" height="3" fill="#FFCC00" />
          <rect x="3" y="15" width="2" height="2" fill="#FFD1A4" />
          <rect x="17" y="13" width="3" height="3" fill="#FFCC00" />
          <rect x="18" y="16" width="2" height="2" fill="#FFD1A4" />

          {/* Jeans (Stride) */}
          <rect x="5" y="17" width="4" height="4" fill="#1E3A8A" />
          <rect x="14" y="17" width="4" height="4" fill="#1E3A8A" />

          {/* Sneakers */}
          <rect x="4" y="21" width="6" height="2" fill="#B84418" />
          <rect x="3" y="23" width="7" height="1" fill="#FFFFFF" />
          <rect x="14" y="20" width="5" height="2" fill="#B84418" />
          <rect x="14" y="22" width="5" height="1" fill="#FFFFFF" />
        </g>

        {/* ========================================================================= */}
        {/* FRAME 3: walk2 (x: 72..95) - Passing contact / mid step                  */}
        {/* ========================================================================= */}
        <g id="frame-walk2" transform="translate(72, 0)">
          {/* Cap/Hat */}
          <rect x="7" y="0" width="9" height="1" fill="#102040" />
          <rect x="6" y="1" width="12" height="1" fill="#102040" />
          <rect x="6" y="2" width="13" height="2" fill="#22B14C" />
          <rect x="7" y="1" width="10" height="1" fill="#4ADE80" />
          <rect x="15" y="3" width="5" height="1" fill="#166534" />

          {/* Face */}
          <rect x="8" y="4" width="8" height="6" fill="#FFD1A4" />
          <rect x="10" y="6" width="2" height="2" fill="#102040" />
          <rect x="14" y="6" width="2" height="2" fill="#102040" />
          <rect x="11" y="9" width="3" height="1" fill="#102040" />

          {/* Hoodie Body (1px higher) */}
          <rect x="6" y="10" width="12" height="6" fill="#FFCC00" />
          <rect x="11" y="11" width="2" height="4" fill="#D97706" />

          {/* Arms at sides */}
          <rect x="5" y="11" width="2" height="4" fill="#FFCC00" />
          <rect x="5" y="15" width="2" height="2" fill="#FFD1A4" />
          <rect x="17" y="11" width="2" height="4" fill="#FFCC00" />
          <rect x="17" y="15" width="2" height="2" fill="#FFD1A4" />

          {/* Jeans */}
          <rect x="8" y="16" width="8" height="4" fill="#1E3A8A" />

          {/* Sneakers */}
          <rect x="7" y="20" width="5" height="2" fill="#B84418" />
          <rect x="6" y="22" width="6" height="1" fill="#FFFFFF" />
          <rect x="12" y="21" width="5" height="2" fill="#B84418" />
          <rect x="12" y="23" width="5" height="1" fill="#FFFFFF" />
        </g>

        {/* ========================================================================= */}
        {/* FRAME 4: walk3 (x: 96..119) - Right leg forward, left leg back           */}
        {/* ========================================================================= */}
        <g id="frame-walk3" transform="translate(96, 0)">
          {/* Cap/Hat */}
          <rect x="7" y="1" width="9" height="1" fill="#102040" />
          <rect x="6" y="2" width="12" height="1" fill="#102040" />
          <rect x="6" y="3" width="13" height="2" fill="#22B14C" />
          <rect x="7" y="2" width="10" height="1" fill="#4ADE80" />
          <rect x="15" y="4" width="5" height="1" fill="#166534" />

          {/* Face */}
          <rect x="8" y="5" width="8" height="6" fill="#FFD1A4" />
          <rect x="10" y="7" width="2" height="2" fill="#102040" />
          <rect x="14" y="7" width="2" height="2" fill="#102040" />
          <rect x="11" y="10" width="3" height="1" fill="#102040" />

          {/* Hoodie Body */}
          <rect x="6" y="11" width="12" height="6" fill="#FFCC00" />
          <rect x="11" y="12" width="2" height="4" fill="#D97706" />

          {/* Arms swinging opposite (Right forward, Left back) */}
          <rect x="5" y="13" width="3" height="3" fill="#FFCC00" />
          <rect x="5" y="16" width="2" height="2" fill="#FFD1A4" />
          <rect x="16" y="12" width="3" height="3" fill="#FFCC00" />
          <rect x="17" y="15" width="2" height="2" fill="#FFD1A4" />

          {/* Jeans (Stride opposite) */}
          <rect x="6" y="17" width="4" height="4" fill="#1E3A8A" />
          <rect x="13" y="17" width="5" height="4" fill="#1E3A8A" />

          {/* Sneakers */}
          <rect x="5" y="20" width="5" height="2" fill="#B84418" />
          <rect x="5" y="22" width="5" height="1" fill="#FFFFFF" />
          <rect x="13" y="21" width="6" height="2" fill="#B84418" />
          <rect x="13" y="23" width="7" height="1" fill="#FFFFFF" />
        </g>

        {/* ========================================================================= */}
        {/* FRAME 5: hop (x: 120..143) - Jump / celebration in air                   */}
        {/* ========================================================================= */}
        <g id="frame-hop" transform="translate(120, 0)">
          {/* Cap/Hat (Elevated) */}
          <rect x="7" y="0" width="9" height="1" fill="#102040" />
          <rect x="6" y="1" width="12" height="1" fill="#102040" />
          <rect x="6" y="2" width="13" height="2" fill="#22B14C" />
          <rect x="7" y="1" width="10" height="1" fill="#4ADE80" />
          <rect x="15" y="3" width="5" height="1" fill="#166534" />

          {/* Face with open smile */}
          <rect x="8" y="4" width="8" height="6" fill="#FFD1A4" />
          <rect x="10" y="6" width="2" height="2" fill="#102040" />
          <rect x="14" y="6" width="2" height="2" fill="#102040" />
          <rect x="11" y="8" width="3" height="2" fill="#102040" />
          <rect x="12" y="9" width="1" height="1" fill="#F87171" />

          {/* Raised Arms */}
          <rect x="3" y="9" width="3" height="3" fill="#FFCC00" />
          <rect x="2" y="7" width="2" height="3" fill="#FFD1A4" />
          <rect x="18" y="9" width="3" height="3" fill="#FFCC00" />
          <rect x="20" y="7" width="2" height="3" fill="#FFD1A4" />

          {/* Hoodie Body */}
          <rect x="6" y="10" width="12" height="6" fill="#FFCC00" />
          <rect x="11" y="11" width="2" height="4" fill="#D97706" />

          {/* Tucked Jeans */}
          <rect x="7" y="16" width="4" height="3" fill="#1E3A8A" />
          <rect x="13" y="16" width="4" height="3" fill="#1E3A8A" />

          {/* Tucked Sneakers */}
          <rect x="6" y="19" width="5" height="2" fill="#B84418" />
          <rect x="5" y="21" width="6" height="1" fill="#FFFFFF" />
          <rect x="13" y="19" width="5" height="2" fill="#B84418" />
          <rect x="13" y="21" width="6" height="1" fill="#FFFFFF" />
        </g>

        {/* ========================================================================= */}
        {/* FRAME 6: lean (x: 144..167) - Leaning forward / thumbs up                */}
        {/* ========================================================================= */}
        <g id="frame-lean" transform="translate(144, 0)">
          {/* Cap tilted forward */}
          <rect x="8" y="2" width="9" height="1" fill="#102040" />
          <rect x="7" y="3" width="12" height="1" fill="#102040" />
          <rect x="7" y="4" width="13" height="2" fill="#22B14C" />
          <rect x="8" y="3" width="10" height="1" fill="#4ADE80" />
          <rect x="16" y="5" width="6" height="1" fill="#166534" />

          {/* Face leaning forward */}
          <rect x="9" y="6" width="8" height="6" fill="#FFD1A4" />
          <rect x="12" y="8" width="2" height="2" fill="#102040" />
          <rect x="15" y="8" width="2" height="2" fill="#102040" />
          <rect x="13" y="10" width="3" height="1" fill="#102040" />

          {/* Body angled */}
          <rect x="7" y="12" width="12" height="6" fill="#FFCC00" />
          <rect x="12" y="13" width="2" height="4" fill="#D97706" />

          {/* Thumbs up hand forward */}
          <rect x="17" y="12" width="3" height="3" fill="#FFCC00" />
          <rect x="19" y="11" width="3" height="2" fill="#FFD1A4" />
          <rect x="20" y="10" width="1" height="2" fill="#FFD1A4" />

          {/* Left Arm relaxed */}
          <rect x="5" y="13" width="2" height="3" fill="#FFCC00" />
          <rect x="5" y="16" width="2" height="2" fill="#FFD1A4" />

          {/* Jeans */}
          <rect x="7" y="18" width="4" height="3" fill="#1E3A8A" />
          <rect x="12" y="18" width="5" height="3" fill="#1E3A8A" />

          {/* Sneakers */}
          <rect x="6" y="21" width="5" height="2" fill="#B84418" />
          <rect x="5" y="23" width="6" height="1" fill="#FFFFFF" />
          <rect x="13" y="21" width="6" height="2" fill="#B84418" />
          <rect x="13" y="23" width="7" height="1" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
};
