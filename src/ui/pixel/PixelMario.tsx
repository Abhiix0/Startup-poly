import React from 'react';

export type MarioPose = 'idle' | 'run-1' | 'run-2' | 'run-3' | 'dash';

export interface PixelMarioProps {
  size?: number;
  pose?: MarioPose;
  className?: string;
  flipX?: boolean;
}

/**
 * PixelMario: Authentic retro pixel-art Mario based directly on the classic reference:
 * - Red cap with white circular emblem & red 'M'
 * - Dark curved mustache, blue eyes, skin tone
 * - Red shirt & bright blue overalls with yellow buttons
 * - White gloves & rounded brown boots
 */
export const PixelMario: React.FC<PixelMarioProps> = ({
  size = 48,
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
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* =================================================================== */}
        {/* COMMON COLOR PALETTE CONSTANTS                                      */}
        {/* Red: #E52521 / #B91C1C, Blue: #0044CC / #002D80, Yellow: #FFD700     */}
        {/* Skin: #FFC085 / #FFAE65, Brown: #733E17 / #502706, White: #FFFFFF   */}
        {/* =================================================================== */}

        {pose === 'dash' ? (
          /* ================================================================ */
          /* DASH POSE: Forward-leaning aerodynamic sprint, clenched fists     */
          /* ================================================================ */
          <g id="mario-dash">
            {/* Speed dust behind back foot */}
            <rect x="0" y="22" width="2" height="1" fill="#FFFFFF" opacity="0.8" />
            <rect x="1" y="21" width="3" height="1" fill="#FFFFFF" opacity="0.9" />

            {/* Back Foot (Trailing Left Foot) */}
            <rect x="3" y="19" width="5" height="3" fill="#733E17" />
            <rect x="2" y="20" width="2" height="2" fill="#502706" />

            {/* Back Overalls Leg */}
            <rect x="6" y="17" width="5" height="3" fill="#0044CC" />

            {/* Torso: Leaning Overalls (Rotated forward silhouette) */}
            <rect x="10" y="14" width="8" height="7" fill="#0044CC" />
            {/* Yellow overall button */}
            <rect x="14" y="15" width="2" height="2" fill="#FFD700" />
            <rect x="15" y="15" width="1" height="1" fill="#FFF9C4" />

            {/* Red Shirt behind overalls & back arm */}
            <rect x="8" y="14" width="4" height="4" fill="#E52521" />
            {/* Back fist trailing */}
            <rect x="4" y="15" width="4" height="3" fill="#FFFFFF" />
            <rect x="3" y="16" width="2" height="2" fill="#E2E8F0" />

            {/* Front Overalls Leg & Front Foot (Driving Forward) */}
            <rect x="14" y="19" width="4" height="4" fill="#0044CC" />
            <rect x="17" y="22" width="6" height="3" fill="#733E17" />
            <rect x="16" y="23" width="2" height="2" fill="#502706" />

            {/* Front Arm (Pumping forward) */}
            <rect x="16" y="13" width="4" height="3" fill="#E52521" />
            <rect x="20" y="13" width="4" height="4" fill="#FFFFFF" />

            {/* Head (Leaning forward at x: 12..24) */}
            {/* Hair / Sideburns */}
            <rect x="10" y="9" width="3" height="4" fill="#502706" />
            <rect x="11" y="12" width="3" height="2" fill="#502706" />

            {/* Face / Skin */}
            <rect x="13" y="7" width="9" height="7" fill="#FFC085" />
            <rect x="12" y="9" width="2" height="3" fill="#FFAE65" />

            {/* Blue Eye */}
            <rect x="18" y="8" width="2" height="2" fill="#0044CC" />
            <rect x="18" y="8" width="1" height="1" fill="#FFFFFF" />

            {/* Nose (Large rounded bulbous) */}
            <rect x="21" y="8" width="4" height="3" fill="#FFC085" />
            <rect x="21" y="9" width="4" height="2" fill="#FFAE65" />

            {/* Dark Mustache */}
            <rect x="17" y="10" width="7" height="2" fill="#181512" />
            <rect x="16" y="11" width="8" height="2" fill="#181512" />
            <rect x="18" y="13" width="3" height="1" fill="#181512" />

            {/* Smiling Mouth */}
            <rect x="17" y="12" width="2" height="1" fill="#7A0000" />

            {/* Red Cap */}
            <rect x="11" y="3" width="11" height="4" fill="#E52521" />
            <rect x="12" y="2" width="9" height="2" fill="#E52521" />
            {/* Cap Visor / Bill jutting forward */}
            <rect x="19" y="6" width="6" height="2" fill="#B91C1C" />

            {/* White Emblem with Red 'M' */}
            <rect x="14" y="3" width="5" height="4" fill="#FFFFFF" />
            <rect x="15" y="4" width="3" height="2" fill="#E52521" />
            <rect x="16" y="4" width="1" height="1" fill="#FFFFFF" />
          </g>
        ) : pose === 'run-2' ? (
          /* ================================================================ */
          /* RUN POSE 2: Mid-stride passing contact, body slightly higher    */
          /* ================================================================ */
          <g id="mario-run-2">
            {/* Red Cap */}
            <rect x="7" y="1" width="11" height="4" fill="#E52521" />
            <rect x="8" y="0" width="9" height="2" fill="#E52521" />
            {/* Cap Visor */}
            <rect x="15" y="4" width="6" height="2" fill="#B91C1C" />

            {/* White Emblem with Red 'M' */}
            <rect x="10" y="1" width="5" height="4" fill="#FFFFFF" />
            <rect x="11" y="2" width="3" height="2" fill="#E52521" />
            <rect x="12" y="2" width="1" height="1" fill="#FFFFFF" />

            {/* Hair */}
            <rect x="6" y="5" width="4" height="4" fill="#502706" />
            <rect x="7" y="9" width="3" height="2" fill="#502706" />

            {/* Face */}
            <rect x="10" y="4" width="8" height="7" fill="#FFC085" />
            <rect x="8" y="7" width="2" height="3" fill="#FFAE65" />

            {/* Eye */}
            <rect x="14" y="5" width="2" height="2" fill="#0044CC" />
            <rect x="14" y="5" width="1" height="1" fill="#FFFFFF" />

            {/* Nose */}
            <rect x="17" y="5" width="4" height="3" fill="#FFC085" />
            <rect x="17" y="6" width="4" height="2" fill="#FFAE65" />

            {/* Mustache */}
            <rect x="13" y="7" width="7" height="2" fill="#181512" />
            <rect x="12" y="8" width="8" height="2" fill="#181512" />

            {/* Torso & Overalls */}
            <rect x="7" y="11" width="10" height="7" fill="#0044CC" />
            {/* Red Shirt sleeves */}
            <rect x="5" y="11" width="3" height="4" fill="#E52521" />
            <rect x="15" y="11" width="3" height="3" fill="#E52521" />

            {/* Overall Buttons */}
            <rect x="10" y="12" width="2" height="2" fill="#FFD700" />
            <rect x="13" y="12" width="2" height="2" fill="#FFD700" />

            {/* Hands (Swinging close to body) */}
            <rect x="4" y="14" width="3" height="3" fill="#FFFFFF" />
            <rect x="17" y="13" width="3" height="3" fill="#FFFFFF" />

            {/* Legs (Passing under body) */}
            <rect x="8" y="18" width="4" height="4" fill="#0044CC" />
            <rect x="13" y="18" width="4" height="3" fill="#0044CC" />

            {/* Shoes */}
            <rect x="7" y="22" width="6" height="3" fill="#733E17" />
            <rect x="6" y="23" width="2" height="2" fill="#502706" />
            <rect x="13" y="21" width="5" height="3" fill="#733E17" />
          </g>
        ) : pose === 'run-3' ? (
          /* ================================================================ */
          /* RUN POSE 3: Left leg forward, right leg trailing back            */
          /* ================================================================ */
          <g id="mario-run-3">
            {/* Red Cap */}
            <rect x="6" y="2" width="11" height="4" fill="#E52521" />
            <rect x="7" y="1" width="9" height="2" fill="#E52521" />
            <rect x="14" y="5" width="6" height="2" fill="#B91C1C" />

            {/* White Emblem with Red 'M' */}
            <rect x="9" y="2" width="5" height="4" fill="#FFFFFF" />
            <rect x="10" y="3" width="3" height="2" fill="#E52521" />
            <rect x="11" y="3" width="1" height="1" fill="#FFFFFF" />

            {/* Hair */}
            <rect x="5" y="6" width="4" height="4" fill="#502706" />
            <rect x="6" y="10" width="3" height="2" fill="#502706" />

            {/* Face */}
            <rect x="9" y="5" width="8" height="7" fill="#FFC085" />
            <rect x="7" y="8" width="2" height="3" fill="#FFAE65" />

            {/* Eye */}
            <rect x="13" y="6" width="2" height="2" fill="#0044CC" />
            <rect x="13" y="6" width="1" height="1" fill="#FFFFFF" />

            {/* Nose */}
            <rect x="16" y="6" width="4" height="3" fill="#FFC085" />
            <rect x="16" y="7" width="4" height="2" fill="#FFAE65" />

            {/* Mustache */}
            <rect x="12" y="8" width="7" height="2" fill="#181512" />
            <rect x="11" y="9" width="8" height="2" fill="#181512" />

            {/* Torso / Overalls */}
            <rect x="7" y="12" width="9" height="7" fill="#0044CC" />
            <rect x="5" y="12" width="3" height="4" fill="#E52521" />
            <rect x="14" y="12" width="3" height="4" fill="#E52521" />

            {/* Buttons */}
            <rect x="10" y="13" width="2" height="2" fill="#FFD700" />

            {/* Arm forward, Arm back */}
            <rect x="16" y="14" width="4" height="3" fill="#FFFFFF" />
            <rect x="2" y="13" width="4" height="3" fill="#FFFFFF" />

            {/* Trailing Back Leg & Boot */}
            <rect x="3" y="17" width="5" height="3" fill="#0044CC" />
            <rect x="1" y="18" width="5" height="3" fill="#733E17" />

            {/* Forward Driving Leg & Boot */}
            <rect x="12" y="17" width="4" height="4" fill="#0044CC" />
            <rect x="13" y="21" width="6" height="3" fill="#733E17" />
          </g>
        ) : (
          /* ================================================================ */
          /* RUN POSE 1 (Default): Right leg forward, left leg trailing back  */
          /* ================================================================ */
          <g id="mario-run-1">
            {/* Red Cap */}
            <rect x="7" y="2" width="11" height="4" fill="#E52521" />
            <rect x="8" y="1" width="9" height="2" fill="#E52521" />
            {/* Cap Visor */}
            <rect x="15" y="5" width="6" height="2" fill="#B91C1C" />

            {/* White Emblem with Red 'M' */}
            <rect x="10" y="2" width="5" height="4" fill="#FFFFFF" />
            <rect x="11" y="3" width="3" height="2" fill="#E52521" />
            <rect x="12" y="3" width="1" height="1" fill="#FFFFFF" />

            {/* Hair */}
            <rect x="6" y="6" width="4" height="4" fill="#502706" />
            <rect x="7" y="10" width="3" height="2" fill="#502706" />

            {/* Face */}
            <rect x="10" y="5" width="8" height="7" fill="#FFC085" />
            <rect x="8" y="8" width="2" height="3" fill="#FFAE65" />

            {/* Eye */}
            <rect x="14" y="6" width="2" height="2" fill="#0044CC" />
            <rect x="14" y="6" width="1" height="1" fill="#FFFFFF" />

            {/* Nose */}
            <rect x="17" y="6" width="4" height="3" fill="#FFC085" />
            <rect x="17" y="7" width="4" height="2" fill="#FFAE65" />

            {/* Mustache */}
            <rect x="13" y="8" width="7" height="2" fill="#181512" />
            <rect x="12" y="9" width="8" height="2" fill="#181512" />

            {/* Torso / Overalls */}
            <rect x="8" y="12" width="8" height="7" fill="#0044CC" />
            {/* Red Shirt sleeves */}
            <rect x="6" y="12" width="3" height="4" fill="#E52521" />
            <rect x="14" y="11" width="3" height="4" fill="#E52521" />

            {/* Buttons */}
            <rect x="11" y="13" width="2" height="2" fill="#FFD700" />

            {/* White Gloves (Pumping forward & back) */}
            <rect x="16" y="12" width="4" height="3" fill="#FFFFFF" />
            <rect x="3" y="14" width="4" height="3" fill="#FFFFFF" />

            {/* Legs in running stride */}
            {/* Back leg trailing */}
            <rect x="4" y="18" width="5" height="3" fill="#0044CC" />
            <rect x="2" y="20" width="5" height="3" fill="#733E17" />

            {/* Front leg stepping forward */}
            <rect x="12" y="17" width="4" height="4" fill="#0044CC" />
            <rect x="14" y="21" width="6" height="3" fill="#733E17" />
          </g>
        )}
      </svg>
    </div>
  );
};
