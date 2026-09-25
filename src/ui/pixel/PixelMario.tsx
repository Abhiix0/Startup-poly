import React from 'react';

export type MarioPose = 'idle' | 'run-1' | 'run-2' | 'run-3' | 'dash';

export interface PixelMarioProps {
  size?: number;
  pose?: MarioPose;
  className?: string;
  flipX?: boolean;
}

/**
 * PixelMario: Authentic, high-fidelity classic pixel-art Mario based directly on the provided reference:
 * - Rounded red cap with white circular emblem & red 'M' monogram
 * - Big bulbous nose, blue eyes with white sparkle catchlights
 * - Iconic curved black mustache & cheerful smile
 * - Red long-sleeve shirt under royal blue overalls with yellow buttons
 * - White cartoon gloves & chunky brown rounded boots
 */
export const PixelMario: React.FC<PixelMarioProps> = ({
  size = 64,
  pose = 'run-1',
  className = '',
  flipX = false,
}) => {
  return (
    <div
      className={`inline-block relative select-none flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        transform: flipX ? 'scaleX(-1)' : undefined,
      }}
      aria-hidden="true"
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
        {/* DASH POSE: Aerodynamic, high-speed supersonic ramming sprint        */}
        {/* =================================================================== */}
        {pose === 'dash' ? (
          <g id="mario-dash">
            {/* Speed dust puffs behind feet */}
            <rect x="0" y="24" width="3" height="2" fill="#FFFFFF" opacity="0.8" />
            <rect x="1" y="22" width="2" height="2" fill="#FFFFFF" opacity="0.6" />

            {/* Back Boot (Kicking high backwards) */}
            <rect x="2" y="19" width="6" height="4" fill="#78350F" />
            <rect x="1" y="21" width="6" height="2" fill="#451A03" />
            <rect x="3" y="19" width="3" height="1" fill="#92400E" />

            {/* Back Leg (Overalls) */}
            <rect x="6" y="17" width="5" height="4" fill="#0B4FD7" />

            {/* Main Torso (Blue Overalls angled forward) */}
            <rect x="9" y="14" width="10" height="7" fill="#0B4FD7" />
            <rect x="11" y="17" width="7" height="4" fill="#083896" />

            {/* Golden Overall Button */}
            <rect x="14" y="15" width="2" height="2" fill="#FFCC00" />
            <rect x="14" y="15" width="1" height="1" fill="#FFFFFF" />

            {/* Red Shirt showing at back & collar */}
            <rect x="7" y="13" width="5" height="4" fill="#E52521" />
            <rect x="8" y="14" width="2" height="2" fill="#B91C1C" />

            {/* Trailing Back Arm & White Glove */}
            <rect x="4" y="14" width="4" height="3" fill="#E52521" />
            <rect x="2" y="13" width="4" height="4" fill="#FFFFFF" />
            <rect x="3" y="15" width="2" height="2" fill="#CBD5E1" />

            {/* Front Leg (Driving forward) */}
            <rect x="14" y="19" width="5" height="4" fill="#0B4FD7" />
            {/* Front Boot (Planted forward) */}
            <rect x="17" y="23" width="7" height="4" fill="#78350F" />
            <rect x="16" y="25" width="8" height="2" fill="#451A03" />
            <rect x="18" y="23" width="4" height="1" fill="#92400E" />

            {/* Leading Front Arm (Pumping forward like a rocket) */}
            <rect x="17" y="13" width="4" height="3" fill="#E52521" />
            <rect x="21" y="12" width="5" height="5" fill="#FFFFFF" />
            <rect x="23" y="14" width="2" height="2" fill="#CBD5E1" />

            {/* Head Silhouette (Leaning forward) */}
            {/* Hair / Sideburns */}
            <rect x="9" y="8" width="4" height="5" fill="#451A03" />
            <rect x="8" y="10" width="3" height="3" fill="#181512" />

            {/* Face Skin */}
            <rect x="12" y="7" width="9" height="7" fill="#FFC49A" />
            <rect x="11" y="10" width="2" height="3" fill="#EAA072" />

            {/* Eye (Determined, blue with white glint) */}
            <rect x="17" y="8" width="2" height="2" fill="#0284C7" />
            <rect x="17" y="8" width="1" height="1" fill="#FFFFFF" />
            <rect x="16" y="7" width="3" height="1" fill="#181512" /> {/* Eyebrow */}

            {/* Big Bulbous Nose */}
            <rect x="20" y="8" width="5" height="4" fill="#FFC49A" />
            <rect x="20" y="10" width="5" height="2" fill="#EAA072" />

            {/* Mustache (Curved black classic shape) */}
            <rect x="15" y="10" width="8" height="3" fill="#181512" />
            <rect x="17" y="12" width="6" height="2" fill="#181512" />
            <rect x="23" y="11" width="2" height="1" fill="#181512" />

            {/* Smiling Mouth underneath */}
            <rect x="17" y="12" width="3" height="1" fill="#B91C1C" />

            {/* Red Cap */}
            <rect x="10" y="2" width="12" height="5" fill="#E52521" />
            <rect x="11" y="1" width="10" height="2" fill="#E52521" />
            <rect x="8" y="4" width="4" height="3" fill="#B91C1C" />
            {/* Cap Visor / Brim jutting over face */}
            <rect x="18" y="6" width="7" height="2" fill="#B91C1C" />

            {/* White Circular Emblem & Red 'M' */}
            <rect x="13" y="2" width="6" height="4" fill="#FFFFFF" />
            <rect x="14" y="3" width="4" height="2" fill="#E52521" />
            <rect x="15" y="3" width="2" height="1" fill="#FFFFFF" />
          </g>
        ) : pose === 'run-2' ? (
          /* =================================================================== */
          /* RUN POSE 2: Mid-stride passing position                             */
          /* =================================================================== */
          <g id="mario-run-2">
            {/* Cap */}
            <rect x="7" y="1" width="12" height="5" fill="#E52521" />
            <rect x="8" y="0" width="10" height="2" fill="#E52521" />
            <rect x="6" y="3" width="3" height="3" fill="#B91C1C" />
            {/* Visor */}
            <rect x="15" y="5" width="7" height="2" fill="#B91C1C" />

            {/* White Emblem with Red 'M' */}
            <rect x="10" y="1" width="6" height="4" fill="#FFFFFF" />
            <rect x="11" y="2" width="4" height="2" fill="#E52521" />
            <rect x="12" y="2" width="2" height="1" fill="#FFFFFF" />

            {/* Hair */}
            <rect x="6" y="6" width="4" height="5" fill="#451A03" />
            <rect x="5" y="8" width="3" height="3" fill="#181512" />

            {/* Face */}
            <rect x="9" y="5" width="9" height="7" fill="#FFC49A" />
            <rect x="8" y="8" width="2" height="3" fill="#EAA072" />

            {/* Eye */}
            <rect x="14" y="6" width="2" height="2" fill="#0284C7" />
            <rect x="14" y="6" width="1" height="1" fill="#FFFFFF" />
            <rect x="13" y="5" width="3" height="1" fill="#181512" />

            {/* Nose */}
            <rect x="17" y="6" width="5" height="4" fill="#FFC49A" />
            <rect x="17" y="8" width="5" height="2" fill="#EAA072" />

            {/* Mustache */}
            <rect x="12" y="8" width="8" height="3" fill="#181512" />
            <rect x="14" y="10" width="6" height="2" fill="#181512" />

            {/* Overalls & Torso */}
            <rect x="7" y="12" width="11" height="7" fill="#0B4FD7" />
            <rect x="5" y="12" width="4" height="4" fill="#E52521" />
            <rect x="15" y="12" width="4" height="4" fill="#E52521" />

            {/* Buttons */}
            <rect x="9" y="13" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="13" width="2" height="2" fill="#FFCC00" />

            {/* Hands (Tucked close to sides) */}
            <rect x="4" y="15" width="4" height="4" fill="#FFFFFF" />
            <rect x="16" y="14" width="4" height="4" fill="#FFFFFF" />

            {/* Overalls Legs (Passing under body) */}
            <rect x="8" y="19" width="4" height="4" fill="#0B4FD7" />
            <rect x="13" y="19" width="4" height="4" fill="#0B4FD7" />

            {/* Boots */}
            <rect x="7" y="23" width="6" height="4" fill="#78350F" />
            <rect x="6" y="25" width="7" height="2" fill="#451A03" />
            <rect x="13" y="23" width="6" height="4" fill="#78350F" />
            <rect x="12" y="25" width="7" height="2" fill="#451A03" />
          </g>
        ) : pose === 'run-3' ? (
          /* =================================================================== */
          /* RUN POSE 3: Left foot forward, right foot trailing back             */
          /* =================================================================== */
          <g id="mario-run-3">
            {/* Cap */}
            <rect x="6" y="2" width="12" height="5" fill="#E52521" />
            <rect x="7" y="1" width="10" height="2" fill="#E52521" />
            <rect x="5" y="4" width="3" height="3" fill="#B91C1C" />
            {/* Visor */}
            <rect x="14" y="6" width="7" height="2" fill="#B91C1C" />

            {/* White Emblem with Red 'M' */}
            <rect x="9" y="2" width="6" height="4" fill="#FFFFFF" />
            <rect x="10" y="3" width="4" height="2" fill="#E52521" />
            <rect x="11" y="3" width="2" height="1" fill="#FFFFFF" />

            {/* Hair */}
            <rect x="5" y="7" width="4" height="5" fill="#451A03" />
            <rect x="4" y="9" width="3" height="3" fill="#181512" />

            {/* Face */}
            <rect x="8" y="6" width="9" height="7" fill="#FFC49A" />
            <rect x="7" y="9" width="2" height="3" fill="#EAA072" />

            {/* Eye */}
            <rect x="13" y="7" width="2" height="2" fill="#0284C7" />
            <rect x="13" y="7" width="1" height="1" fill="#FFFFFF" />
            <rect x="12" y="6" width="3" height="1" fill="#181512" />

            {/* Nose */}
            <rect x="16" y="7" width="5" height="4" fill="#FFC49A" />
            <rect x="16" y="9" width="5" height="2" fill="#EAA072" />

            {/* Mustache */}
            <rect x="11" y="9" width="8" height="3" fill="#181512" />
            <rect x="13" y="11" width="6" height="2" fill="#181512" />

            {/* Torso & Overalls */}
            <rect x="7" y="13" width="10" height="7" fill="#0B4FD7" />
            <rect x="5" y="13" width="4" height="4" fill="#E52521" />
            <rect x="14" y="13" width="4" height="4" fill="#E52521" />

            {/* Overall Button */}
            <rect x="10" y="14" width="2" height="2" fill="#FFCC00" />

            {/* Front Arm & White Glove */}
            <rect x="16" y="14" width="5" height="4" fill="#FFFFFF" />
            {/* Back Arm & White Glove */}
            <rect x="1" y="13" width="4" height="4" fill="#FFFFFF" />

            {/* Trailing Back Leg & Boot */}
            <rect x="3" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="1" y="20" width="6" height="4" fill="#78350F" />
            <rect x="0" y="22" width="6" height="2" fill="#451A03" />

            {/* Forward Driving Leg & Boot */}
            <rect x="12" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="13" y="22" width="7" height="4" fill="#78350F" />
            <rect x="12" y="24" width="8" height="2" fill="#451A03" />
          </g>
        ) : (
          /* =================================================================== */
          /* RUN POSE 1 (Default): Right foot forward, left foot trailing back   */
          /* =================================================================== */
          <g id="mario-run-1">
            {/* Red Cap */}
            <rect x="7" y="2" width="12" height="5" fill="#E52521" />
            <rect x="8" y="1" width="10" height="2" fill="#E52521" />
            <rect x="6" y="4" width="3" height="3" fill="#B91C1C" />
            {/* Visor */}
            <rect x="15" y="6" width="7" height="2" fill="#B91C1C" />

            {/* White Emblem with Red 'M' */}
            <rect x="10" y="2" width="6" height="4" fill="#FFFFFF" />
            <rect x="11" y="3" width="4" height="2" fill="#E52521" />
            <rect x="12" y="3" width="2" height="1" fill="#FFFFFF" />

            {/* Hair */}
            <rect x="6" y="7" width="4" height="5" fill="#451A03" />
            <rect x="5" y="9" width="3" height="3" fill="#181512" />

            {/* Face */}
            <rect x="9" y="6" width="9" height="7" fill="#FFC49A" />
            <rect x="8" y="9" width="2" height="3" fill="#EAA072" />

            {/* Eye */}
            <rect x="14" y="7" width="2" height="2" fill="#0284C7" />
            <rect x="14" y="7" width="1" height="1" fill="#FFFFFF" />
            <rect x="13" y="6" width="3" height="1" fill="#181512" />

            {/* Nose */}
            <rect x="17" y="7" width="5" height="4" fill="#FFC49A" />
            <rect x="17" y="9" width="5" height="2" fill="#EAA072" />

            {/* Mustache */}
            <rect x="12" y="9" width="8" height="3" fill="#181512" />
            <rect x="14" y="11" width="6" height="2" fill="#181512" />

            {/* Torso & Overalls */}
            <rect x="8" y="13" width="9" height="7" fill="#0B4FD7" />
            <rect x="6" y="13" width="4" height="4" fill="#E52521" />
            <rect x="15" y="12" width="4" height="4" fill="#E52521" />

            {/* Overall Button */}
            <rect x="11" y="14" width="2" height="2" fill="#FFCC00" />

            {/* White Gloves (Pumping forward & back) */}
            <rect x="17" y="13" width="5" height="4" fill="#FFFFFF" />
            <rect x="3" y="15" width="4" height="4" fill="#FFFFFF" />

            {/* Trailing Back Leg & Boot */}
            <rect x="4" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="2" y="21" width="6" height="4" fill="#78350F" />
            <rect x="1" y="23" width="6" height="2" fill="#451A03" />

            {/* Forward Stepping Leg & Boot */}
            <rect x="12" y="18" width="5" height="4" fill="#0B4FD7" />
            <rect x="14" y="22" width="7" height="4" fill="#78350F" />
            <rect x="13" y="24" width="8" height="2" fill="#451A03" />
          </g>
        )}
      </svg>
    </div>
  );
};
