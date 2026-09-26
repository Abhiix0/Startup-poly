import React from 'react';

export type MarioPose = 'idle' | 'run-1' | 'run-2' | 'run-3' | 'dash' | 'jump';

export interface PixelMarioProps {
  size?: number;
  pose?: MarioPose;
  className?: string;
  isStrip?: boolean;
  stripAnimation?: 'walk' | 'idle' | 'hop' | 'static';
  flipX?: boolean;
  ariaHidden?: boolean;
}

/**
 * PixelMario: Authentic, high-fidelity classic pixel-art Mario based directly on the provided reference:
 * - Rounded red cap with white circular emblem & red 'M' monogram
 * - Big bulbous nose, blue eyes with sparkle catchlights
 * - Iconic curved black mustache & cheerful smile
 * - Red long-sleeve shirt under royal blue overalls with yellow buttons
 * - White cartoon gloves & chunky brown rounded boots
 * 
 * Supports both standalone single-pose mode (for intro) and 7-frame strip mode (for living landing world):
 * Frame 0: idleA, Frame 1: idleB, Frame 2: walk1, Frame 3: walk2, Frame 4: walk3, Frame 5: hop/jump, Frame 6: dash/lean
 */
export const PixelMario: React.FC<PixelMarioProps> = ({
  size = 64,
  pose = 'run-1',
  className = '',
  isStrip = false,
  stripAnimation = 'static',
  flipX = false,
  ariaHidden = true,
}) => {
  // If rendering 7-frame strip for living world character:
  if (isStrip) {
    let animClass = '';
    let inlineTransform = '';

    switch (stripAnimation) {
      case 'idle':
        animClass = 'anim-poly-idle';
        break;
      case 'walk':
        animClass = 'anim-poly-walk';
        break;
      case 'hop':
        inlineTransform = 'translateX(-71.428%)'; // Frame 5: 5/7 = 71.428%
        break;
      case 'static':
      default:
        inlineTransform = 'translateX(0%)';
        break;
    }

    return (
      <div
        className={`inline-block overflow-hidden relative select-none flex-shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          transform: flipX ? 'scaleX(-1)' : undefined,
        }}
        aria-hidden={ariaHidden}
      >
        <svg
          width={size * 7}
          height={size}
          viewBox="0 0 168 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges"
          className={`absolute top-0 left-0 h-full max-w-none poly-sprite-strip ${animClass}`}
          style={{
            width: `${size * 7}px`,
            imageRendering: 'pixelated',
            transform: inlineTransform || undefined,
          }}
        >
          {/* =============================================================== */}
          {/* FRAME 0: idleA (x: 0..23)                                       */}
          {/* =============================================================== */}
          <g id="mario-idle-a">
            {/* Red Cap */}
            <rect x="7" y="1" width="10" height="4" fill="#E52521" />
            <rect x="8" y="0" width="8" height="2" fill="#E52521" />
            <rect x="14" y="4" width="6" height="2" fill="#B91C1C" />
            {/* White Emblem with Red 'M' */}
            <rect x="10" y="1" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="2" width="2" height="1" fill="#E52521" />
            {/* Hair */}
            <rect x="6" y="5" width="4" height="4" fill="#451A03" />
            <rect x="5" y="7" width="2" height="2" fill="#181512" />
            {/* Face Skin */}
            <rect x="9" y="4" width="8" height="6" fill="#FFC49A" />
            <rect x="8" y="7" width="2" height="2" fill="#EAA072" />
            {/* Blue Eye */}
            <rect x="13" y="5" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="5" width="1" height="1" fill="#FFFFFF" />
            {/* Nose */}
            <rect x="16" y="5" width="4" height="3" fill="#FFC49A" />
            {/* Mustache */}
            <rect x="12" y="7" width="7" height="2" fill="#181512" />
            <rect x="14" y="9" width="5" height="1" fill="#181512" />
            {/* Overalls Torso */}
            <rect x="7" y="10" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="10" width="3" height="4" fill="#E52521" />
            <rect x="16" y="10" width="3" height="4" fill="#E52521" />
            {/* Yellow Buttons */}
            <rect x="9" y="11" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="11" width="2" height="2" fill="#FFCC00" />
            {/* White Gloves */}
            <rect x="4" y="13" width="3" height="3" fill="#FFFFFF" />
            <rect x="17" y="13" width="3" height="3" fill="#FFFFFF" />
            {/* Legs */}
            <rect x="7" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="13" y="17" width="4" height="4" fill="#0B4FD7" />
            {/* Boots */}
            <rect x="6" y="21" width="5" height="3" fill="#78350F" />
            <rect x="13" y="21" width="5" height="3" fill="#78350F" />
          </g>

          {/* =============================================================== */}
          {/* FRAME 1: idleB (x: 24..47) - subtle breathing & blink           */}
          {/* =============================================================== */}
          <g id="mario-idle-b" transform="translate(24, 0)">
            <rect x="7" y="1" width="10" height="4" fill="#E52521" />
            <rect x="8" y="0" width="8" height="2" fill="#E52521" />
            <rect x="14" y="4" width="6" height="2" fill="#B91C1C" />
            <rect x="10" y="1" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="2" width="2" height="1" fill="#E52521" />
            <rect x="6" y="5" width="4" height="4" fill="#451A03" />
            <rect x="9" y="4" width="8" height="6" fill="#FFC49A" />
            {/* Blink */}
            <rect x="13" y="6" width="2" height="1" fill="#181512" />
            <rect x="16" y="5" width="4" height="3" fill="#FFC49A" />
            <rect x="12" y="7" width="7" height="2" fill="#181512" />
            <rect x="7" y="10" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="10" width="3" height="4" fill="#E52521" />
            <rect x="16" y="10" width="3" height="4" fill="#E52521" />
            <rect x="9" y="11" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="11" width="2" height="2" fill="#FFCC00" />
            <rect x="4" y="13" width="3" height="3" fill="#FFFFFF" />
            <rect x="17" y="13" width="3" height="3" fill="#FFFFFF" />
            <rect x="7" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="13" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="6" y="21" width="5" height="3" fill="#78350F" />
            <rect x="13" y="21" width="5" height="3" fill="#78350F" />
          </g>

          {/* =============================================================== */}
          {/* FRAME 2: walk1 (x: 48..71) - right leg forward                  */}
          {/* =============================================================== */}
          <g id="mario-walk-1" transform="translate(48, 0)">
            <rect x="7" y="1" width="10" height="4" fill="#E52521" />
            <rect x="8" y="0" width="8" height="2" fill="#E52521" />
            <rect x="14" y="4" width="6" height="2" fill="#B91C1C" />
            <rect x="10" y="1" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="2" width="2" height="1" fill="#E52521" />
            <rect x="6" y="5" width="4" height="4" fill="#451A03" />
            <rect x="9" y="4" width="8" height="6" fill="#FFC49A" />
            <rect x="13" y="5" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="5" width="1" height="1" fill="#FFFFFF" />
            <rect x="16" y="5" width="4" height="3" fill="#FFC49A" />
            <rect x="12" y="7" width="7" height="2" fill="#181512" />
            <rect x="7" y="10" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="10" width="3" height="4" fill="#E52521" />
            <rect x="16" y="10" width="3" height="4" fill="#E52521" />
            <rect x="10" y="11" width="2" height="2" fill="#FFCC00" />
            <rect x="16" y="12" width="4" height="3" fill="#FFFFFF" />
            <rect x="3" y="13" width="3" height="3" fill="#FFFFFF" />
            {/* Stride legs */}
            <rect x="4" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="2" y="20" width="5" height="3" fill="#78350F" />
            <rect x="12" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="14" y="20" width="5" height="3" fill="#78350F" />
          </g>

          {/* =============================================================== */}
          {/* FRAME 3: walk2 (x: 72..95) - passing step                       */}
          {/* =============================================================== */}
          <g id="mario-walk-2" transform="translate(72, 0)">
            <rect x="7" y="0" width="10" height="4" fill="#E52521" />
            <rect x="8" y="0" width="8" height="1" fill="#E52521" />
            <rect x="14" y="3" width="6" height="2" fill="#B91C1C" />
            <rect x="10" y="0" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="1" width="2" height="1" fill="#E52521" />
            <rect x="6" y="4" width="4" height="4" fill="#451A03" />
            <rect x="9" y="3" width="8" height="6" fill="#FFC49A" />
            <rect x="13" y="4" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="4" width="1" height="1" fill="#FFFFFF" />
            <rect x="16" y="4" width="4" height="3" fill="#FFC49A" />
            <rect x="12" y="6" width="7" height="2" fill="#181512" />
            <rect x="7" y="9" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="9" width="3" height="4" fill="#E52521" />
            <rect x="16" y="9" width="3" height="4" fill="#E52521" />
            <rect x="9" y="10" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="10" width="2" height="2" fill="#FFCC00" />
            <rect x="4" y="12" width="3" height="3" fill="#FFFFFF" />
            <rect x="16" y="12" width="3" height="3" fill="#FFFFFF" />
            <rect x="8" y="16" width="8" height="4" fill="#0B4FD7" />
            <rect x="7" y="20" width="5" height="3" fill="#78350F" />
            <rect x="12" y="20" width="5" height="3" fill="#78350F" />
          </g>

          {/* =============================================================== */}
          {/* FRAME 4: walk3 (x: 96..119) - left leg forward                  */}
          {/* =============================================================== */}
          <g id="mario-walk-3" transform="translate(96, 0)">
            <rect x="7" y="1" width="10" height="4" fill="#E52521" />
            <rect x="8" y="0" width="8" height="2" fill="#E52521" />
            <rect x="14" y="4" width="6" height="2" fill="#B91C1C" />
            <rect x="10" y="1" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="2" width="2" height="1" fill="#E52521" />
            <rect x="6" y="5" width="4" height="4" fill="#451A03" />
            <rect x="9" y="4" width="8" height="6" fill="#FFC49A" />
            <rect x="13" y="5" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="5" width="1" height="1" fill="#FFFFFF" />
            <rect x="16" y="5" width="4" height="3" fill="#FFC49A" />
            <rect x="12" y="7" width="7" height="2" fill="#181512" />
            <rect x="7" y="10" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="10" width="3" height="4" fill="#E52521" />
            <rect x="16" y="10" width="3" height="4" fill="#E52521" />
            <rect x="11" y="11" width="2" height="2" fill="#FFCC00" />
            <rect x="3" y="12" width="4" height="3" fill="#FFFFFF" />
            <rect x="16" y="13" width="3" height="3" fill="#FFFFFF" />
            <rect x="12" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="13" y="20" width="5" height="3" fill="#78350F" />
            <rect x="4" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="2" y="20" width="5" height="3" fill="#78350F" />
          </g>

          {/* =============================================================== */}
          {/* FRAME 5: hop (x: 120..143) - SUPER MARIO JUMP (FIST IN AIR!)    */}
          {/* Matches the user's reference image!                             */}
          {/* =============================================================== */}
          <g id="mario-hop" transform="translate(120, 0)">
            {/* Raised Red Cap */}
            <rect x="7" y="0" width="10" height="4" fill="#E52521" />
            <rect x="8" y="0" width="8" height="1" fill="#E52521" />
            <rect x="14" y="3" width="6" height="2" fill="#B91C1C" />
            <rect x="10" y="0" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="1" width="2" height="1" fill="#E52521" />
            {/* Hair & Face */}
            <rect x="6" y="4" width="4" height="4" fill="#451A03" />
            <rect x="9" y="3" width="8" height="6" fill="#FFC49A" />
            <rect x="13" y="4" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="4" width="1" height="1" fill="#FFFFFF" />
            <rect x="16" y="4" width="4" height="3" fill="#FFC49A" />
            <rect x="12" y="6" width="7" height="2" fill="#181512" />
            {/* Open smile */}
            <rect x="13" y="8" width="3" height="1" fill="#B91C1C" />
            {/* Raised Right Arm with Fist in Air */}
            <rect x="17" y="4" width="3" height="4" fill="#E52521" />
            <rect x="17" y="0" width="4" height="4" fill="#FFFFFF" />
            {/* Left Arm at side */}
            <rect x="4" y="9" width="3" height="3" fill="#E52521" />
            <rect x="3" y="11" width="3" height="3" fill="#FFFFFF" />
            {/* Overalls Torso */}
            <rect x="7" y="9" width="10" height="7" fill="#0B4FD7" />
            <rect x="10" y="10" width="2" height="2" fill="#FFCC00" />
            {/* Tucked jumping legs */}
            <rect x="6" y="16" width="4" height="3" fill="#0B4FD7" />
            <rect x="5" y="18" width="5" height="3" fill="#78350F" />
            <rect x="13" y="15" width="4" height="4" fill="#0B4FD7" />
            <rect x="14" y="18" width="5" height="3" fill="#78350F" />
          </g>

          {/* =============================================================== */}
          {/* FRAME 6: lean/dash (x: 144..167)                                */}
          {/* =============================================================== */}
          <g id="mario-lean" transform="translate(144, 0)">
            <rect x="8" y="1" width="10" height="4" fill="#E52521" />
            <rect x="15" y="4" width="6" height="2" fill="#B91C1C" />
            <rect x="11" y="1" width="4" height="3" fill="#FFFFFF" />
            <rect x="12" y="2" width="2" height="1" fill="#E52521" />
            <rect x="7" y="5" width="4" height="4" fill="#451A03" />
            <rect x="10" y="4" width="8" height="6" fill="#FFC49A" />
            <rect x="14" y="5" width="2" height="2" fill="#0284C7" />
            <rect x="17" y="5" width="4" height="3" fill="#FFC49A" />
            <rect x="13" y="7" width="7" height="2" fill="#181512" />
            <rect x="8" y="10" width="10" height="7" fill="#0B4FD7" />
            <rect x="11" y="11" width="2" height="2" fill="#FFCC00" />
            <rect x="17" y="10" width="4" height="3" fill="#FFFFFF" />
            <rect x="5" y="11" width="3" height="3" fill="#FFFFFF" />
            <rect x="6" y="17" width="5" height="4" fill="#0B4FD7" />
            <rect x="5" y="20" width="6" height="3" fill="#78350F" />
            <rect x="13" y="17" width="5" height="4" fill="#0B4FD7" />
            <rect x="14" y="20" width="6" height="3" fill="#78350F" />
          </g>
        </svg>
      </div>
    );
  }

  // Standalone Single-Pose Mode (For high-resolution intro action):
  return (
    <div
      className={`inline-block relative select-none flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        transform: flipX ? 'scaleX(-1)' : undefined,
      }}
      aria-hidden={ariaHidden}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="w-full h-full drop-shadow-[2px_3px_0px_rgba(16,32,64,0.4)]"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* =================================================================== */}
        {/* IDLE POSE: Classic planted feet, confident retro mascot stance       */}
        {/* =================================================================== */}
        {pose === 'idle' ? (
          <g id="mario-idle" transform="translate(2, 3)">
            {/* Red Cap */}
            <rect x="7" y="1" width="10" height="4" fill="#E52521" />
            <rect x="8" y="0" width="8" height="2" fill="#E52521" />
            <rect x="14" y="4" width="6" height="2" fill="#B91C1C" />
            {/* White Emblem with Red 'M' */}
            <rect x="10" y="1" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="2" width="2" height="1" fill="#E52521" />
            {/* Hair */}
            <rect x="6" y="5" width="4" height="4" fill="#451A03" />
            <rect x="5" y="7" width="2" height="2" fill="#181512" />
            {/* Face Skin */}
            <rect x="9" y="4" width="8" height="6" fill="#FFC49A" />
            <rect x="8" y="7" width="2" height="2" fill="#EAA072" />
            {/* Blue Eye */}
            <rect x="13" y="5" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="5" width="1" height="1" fill="#FFFFFF" />
            {/* Nose */}
            <rect x="16" y="5" width="4" height="3" fill="#FFC49A" />
            {/* Mustache */}
            <rect x="12" y="7" width="7" height="2" fill="#181512" />
            <rect x="14" y="9" width="5" height="1" fill="#181512" />
            {/* Overalls Torso */}
            <rect x="7" y="10" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="10" width="3" height="4" fill="#E52521" />
            <rect x="16" y="10" width="3" height="4" fill="#E52521" />
            {/* Yellow Buttons */}
            <rect x="9" y="11" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="11" width="2" height="2" fill="#FFCC00" />
            {/* White Gloves */}
            <rect x="4" y="13" width="3" height="3" fill="#FFFFFF" />
            <rect x="17" y="13" width="3" height="3" fill="#FFFFFF" />
            {/* Legs */}
            <rect x="7" y="17" width="4" height="4" fill="#0B4FD7" />
            <rect x="13" y="17" width="4" height="4" fill="#0B4FD7" />
            {/* Boots */}
            <rect x="6" y="21" width="5" height="3" fill="#78350F" />
            <rect x="13" y="21" width="5" height="3" fill="#78350F" />
          </g>
        ) : pose === 'dash' ? (
          <g id="mario-dash">
            {/* Speed dust puffs behind feet */}
            <rect x="0" y="24" width="3" height="2" fill="#FFFFFF" opacity="0.8" />
            <rect x="1" y="22" width="2" height="2" fill="#FFFFFF" opacity="0.6" />

            {/* Back Boot */}
            <rect x="2" y="19" width="6" height="4" fill="#78350F" />
            <rect x="1" y="21" width="6" height="2" fill="#451A03" />
            <rect x="3" y="19" width="3" height="1" fill="#92400E" />

            {/* Back Leg (Overalls) */}
            <rect x="6" y="17" width="5" height="4" fill="#0B4FD7" />

            {/* Main Torso */}
            <rect x="9" y="14" width="10" height="7" fill="#0B4FD7" />
            <rect x="11" y="17" width="7" height="4" fill="#083896" />

            {/* Button */}
            <rect x="14" y="15" width="2" height="2" fill="#FFCC00" />
            <rect x="14" y="15" width="1" height="1" fill="#FFFFFF" />

            {/* Red Shirt */}
            <rect x="7" y="13" width="5" height="4" fill="#E52521" />

            {/* Back Arm */}
            <rect x="4" y="14" width="4" height="3" fill="#E52521" />
            <rect x="2" y="13" width="4" height="4" fill="#FFFFFF" />

            {/* Front Leg */}
            <rect x="14" y="19" width="5" height="4" fill="#0B4FD7" />
            <rect x="17" y="23" width="7" height="4" fill="#78350F" />
            <rect x="16" y="25" width="8" height="2" fill="#451A03" />

            {/* Front Arm */}
            <rect x="17" y="13" width="4" height="3" fill="#E52521" />
            <rect x="21" y="12" width="5" height="5" fill="#FFFFFF" />

            {/* Head */}
            <rect x="9" y="8" width="4" height="5" fill="#451A03" />
            <rect x="8" y="10" width="3" height="3" fill="#181512" />

            <rect x="12" y="7" width="9" height="7" fill="#FFC49A" />
            <rect x="11" y="10" width="2" height="3" fill="#EAA072" />

            <rect x="17" y="8" width="2" height="2" fill="#0284C7" />
            <rect x="17" y="8" width="1" height="1" fill="#FFFFFF" />

            <rect x="20" y="8" width="5" height="4" fill="#FFC49A" />
            <rect x="20" y="10" width="5" height="2" fill="#EAA072" />

            <rect x="15" y="10" width="8" height="3" fill="#181512" />
            <rect x="17" y="12" width="6" height="2" fill="#181512" />

            <rect x="10" y="2" width="12" height="5" fill="#E52521" />
            <rect x="11" y="1" width="10" height="2" fill="#E52521" />
            <rect x="18" y="6" width="7" height="2" fill="#B91C1C" />

            <rect x="14" y="2" width="4" height="3" fill="#FFFFFF" />
            <rect x="15" y="3" width="2" height="1" fill="#E52521" />
          </g>
        ) : pose === 'jump' ? (
          /* =================================================================== */
          /* JUMP POSE: Fist in air, leaping down to the world                   */
          /* =================================================================== */
          <g id="mario-jump">
            <rect x="8" y="4" width="12" height="5" fill="#E52521" />
            <rect x="9" y="3" width="10" height="2" fill="#E52521" />
            <rect x="16" y="8" width="7" height="2" fill="#B91C1C" />

            <rect x="12" y="4" width="4" height="3" fill="#FFFFFF" />
            <rect x="13" y="5" width="2" height="1" fill="#E52521" />

            <rect x="7" y="8" width="4" height="5" fill="#451A03" />
            <rect x="10" y="7" width="9" height="7" fill="#FFC49A" />

            <rect x="15" y="8" width="2" height="2" fill="#0284C7" />
            <rect x="15" y="8" width="1" height="1" fill="#FFFFFF" />

            <rect x="18" y="8" width="5" height="4" fill="#FFC49A" />
            <rect x="13" y="10" width="8" height="3" fill="#181512" />
            <rect x="15" y="12" width="6" height="2" fill="#181512" />

            {/* Fist punching straight up */}
            <rect x="19" y="5" width="4" height="4" fill="#E52521" />
            <rect x="19" y="0" width="5" height="5" fill="#FFFFFF" />

            <rect x="5" y="12" width="4" height="4" fill="#E52521" />
            <rect x="4" y="15" width="4" height="4" fill="#FFFFFF" />

            {/* Torso */}
            <rect x="9" y="13" width="10" height="7" fill="#0B4FD7" />
            <rect x="12" y="14" width="2" height="2" fill="#FFCC00" />

            {/* Tucked legs */}
            <rect x="7" y="20" width="5" height="4" fill="#0B4FD7" />
            <rect x="6" y="23" width="6" height="4" fill="#78350F" />
            <rect x="15" y="19" width="5" height="4" fill="#0B4FD7" />
            <rect x="16" y="22" width="6" height="4" fill="#78350F" />
          </g>
        ) : pose === 'run-2' ? (
          /* =================================================================== */
          /* RUN POSE 2: Mid-stride passing position                             */
          /* =================================================================== */
          <g id="mario-run-2">
            <rect x="7" y="1" width="12" height="5" fill="#E52521" />
            <rect x="8" y="0" width="10" height="2" fill="#E52521" />
            <rect x="15" y="5" width="7" height="2" fill="#B91C1C" />

            <rect x="11" y="1" width="4" height="3" fill="#FFFFFF" />
            <rect x="12" y="2" width="2" height="1" fill="#E52521" />

            <rect x="6" y="6" width="4" height="5" fill="#451A03" />
            <rect x="9" y="5" width="9" height="7" fill="#FFC49A" />

            <rect x="14" y="6" width="2" height="2" fill="#0284C7" />
            <rect x="14" y="6" width="1" height="1" fill="#FFFFFF" />

            <rect x="17" y="6" width="5" height="4" fill="#FFC49A" />
            <rect x="12" y="8" width="8" height="3" fill="#181512" />
            <rect x="14" y="10" width="6" height="2" fill="#181512" />

            <rect x="7" y="12" width="11" height="7" fill="#0B4FD7" />
            <rect x="5" y="12" width="4" height="4" fill="#E52521" />
            <rect x="15" y="12" width="4" height="4" fill="#E52521" />

            <rect x="9" y="13" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="13" width="2" height="2" fill="#FFCC00" />

            <rect x="4" y="15" width="4" height="4" fill="#FFFFFF" />
            <rect x="16" y="14" width="4" height="4" fill="#FFFFFF" />

            <rect x="8" y="19" width="4" height="4" fill="#0B4FD7" />
            <rect x="13" y="19" width="4" height="4" fill="#0B4FD7" />

            <rect x="7" y="23" width="6" height="4" fill="#78350F" />
            <rect x="13" y="23" width="6" height="4" fill="#78350F" />
          </g>
        ) : pose === 'run-3' ? (
          /* =================================================================== */
          /* RUN POSE 3: Left foot forward, right foot trailing back             */
          /* =================================================================== */
          <g id="mario-run-3">
            <rect x="6" y="2" width="12" height="5" fill="#E52521" />
            <rect x="7" y="1" width="10" height="2" fill="#E52521" />
            <rect x="14" y="6" width="7" height="2" fill="#B91C1C" />

            <rect x="10" y="2" width="4" height="3" fill="#FFFFFF" />
            <rect x="11" y="3" width="2" height="1" fill="#E52521" />

            <rect x="5" y="7" width="4" height="5" fill="#451A03" />
            <rect x="8" y="6" width="9" height="7" fill="#FFC49A" />

            <rect x="13" y="7" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="7" width="1" height="1" fill="#FFFFFF" />

            <rect x="16" y="7" width="5" height="4" fill="#FFC49A" />
            <rect x="11" y="9" width="8" height="3" fill="#181512" />
            <rect x="13" y="11" width="6" height="2" fill="#181512" />

            <rect x="7" y="13" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="13" width="4" height="4" fill="#E52521" />
            <rect x="14" y="13" width="4" height="4" fill="#E52521" />

            <rect x="10" y="14" width="2" height="2" fill="#FFCC00" />

            <rect x="16" y="14" width="5" height="4" fill="#FFFFFF" />
            <rect x="1" y="13" width="4" height="4" fill="#FFFFFF" />

            <rect x="3" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="1" y="20" width="6" height="4" fill="#78350F" />

            <rect x="12" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="13" y="22" width="7" height="4" fill="#78350F" />
          </g>
        ) : (
          /* =================================================================== */
          /* RUN POSE 1 (Default): Right foot forward, left foot trailing back   */
          /* =================================================================== */
          <g id="mario-run-1">
            <rect x="7" y="2" width="12" height="5" fill="#E52521" />
            <rect x="8" y="1" width="10" height="2" fill="#E52521" />
            <rect x="15" y="6" width="7" height="2" fill="#B91C1C" />

            <rect x="11" y="2" width="4" height="3" fill="#FFFFFF" />
            <rect x="12" y="3" width="2" height="1" fill="#E52521" />

            <rect x="6" y="7" width="4" height="5" fill="#451A03" />
            <rect x="9" y="6" width="9" height="7" fill="#FFC49A" />

            <rect x="14" y="7" width="2" height="2" fill="#0284C7" />
            <rect x="14" y="7" width="1" height="1" fill="#FFFFFF" />

            <rect x="17" y="7" width="5" height="4" fill="#FFC49A" />
            <rect x="12" y="9" width="8" height="3" fill="#181512" />
            <rect x="14" y="11" width="6" height="2" fill="#181512" />

            <rect x="8" y="13" width="9" height="7" fill="#0B4FD7" />
            <rect x="6" y="13" width="4" height="4" fill="#E52521" />
            <rect x="15" y="12" width="4" height="4" fill="#E52521" />

            <rect x="11" y="14" width="2" height="2" fill="#FFCC00" />

            <rect x="17" y="13" width="5" height="4" fill="#FFFFFF" />
            <rect x="3" y="15" width="4" height="4" fill="#FFFFFF" />

            <rect x="4" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="2" y="21" width="6" height="4" fill="#78350F" />

            <rect x="12" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="14" y="22" width="7" height="4" fill="#78350F" />
          </g>
        )}
      </svg>
    </div>
  );
};
