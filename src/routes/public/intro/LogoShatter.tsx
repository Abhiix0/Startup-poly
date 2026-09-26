import React, { useMemo } from 'react';
import { StartupolyLogo } from '../../../ui/pixel/StartupolyLogo';

export interface LogoShatterProps {
  shattered: boolean;
  className?: string;
}

interface Fragment {
  id: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  dx: string;
  dy: string;
  rot: string;
  delay: string;
  initialX: number;
  initialY: number;
}

const FRAGMENT_COLORS = [
  { fill: '#FFCC00', border: '#B84418' }, // Gold letter face
  { fill: '#EA580C', border: '#102040' }, // Orange 3D letter bevel
  { fill: '#E52521', border: '#102040' }, // Mushroom Red
  { fill: '#FFFFFF', border: '#E52521' }, // Mushroom White Spot
  { fill: '#FFC49A', border: '#102040' }, // Mushroom Face
  { fill: '#FFD700', border: '#102040' }, // Bright yellow spark
  { fill: '#102040', border: '#FFCC00' }, // Dark navy outline
  { fill: '#FFFBEB', border: '#B84418' }, // Cream highlight
];

export const LogoShatter: React.FC<LogoShatterProps> = ({
  shattered,
  className = '',
}) => {
  // Deterministic fragment layout across the enlarged logo area
  const fragments: Fragment[] = useMemo(() => {
    const list: Fragment[] = [];
    const count = 42;

    for (let i = 0; i < count; i++) {
      const colorScheme = FRAGMENT_COLORS[i % FRAGMENT_COLORS.length];
      const angle = (i / count) * 2 * Math.PI + (Math.sin(i) * 0.4);
      // Explode outward radially from center
      const distance = 110 + (i % 6) * 42;
      const dx = `${Math.cos(angle) * distance}px`;
      // Gravity pulls fragments downward
      const dy = `${Math.sin(angle) * distance + 50}px`;
      const rot = `${(i % 2 === 0 ? 1 : -1) * (200 + (i * 30))}deg`;

      // Distribute initial positions across the mushroom and wordmark area
      const initialX = ((i % 9) - 4) * 36 + (Math.sin(i * 3) * 12);
      const initialY = (Math.floor(i / 9) - 1.5) * 22 + (Math.cos(i * 2) * 8);

      list.push({
        id: i,
        width: 12 + (i % 4) * 4,
        height: 10 + (i % 3) * 4,
        color: colorScheme.fill,
        borderColor: colorScheme.border,
        dx,
        dy,
        rot,
        delay: `${(i % 4) * 0.015}s`,
        initialX,
        initialY,
      });
    }
    return list;
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* =================================================================== */}
      {/* INTACT STATE: Heroic Large STARTUPOLY Logo with Mushroom & Badge    */}
      {/* =================================================================== */}
      {!shattered ? (
        <div
          data-testid="intro-intact-logo"
          className="flex flex-col items-center select-none text-center px-4"
        >
          {/* Main Title Wordmark with Mushroom */}
          <StartupolyLogo size="hero" glow={true} />

          {/* Subtitle Badge: ✦ DREAM • BUILD • GROW ✦ */}
          <div className="mt-2.5 sm:mt-3.5 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#102040] border-2 sm:border-[3px] border-[#FFCC00] rounded-sm shadow-[3px_3px_0px_#B84418]">
            <span className="font-pixel text-[9px] sm:text-xs md:text-sm text-[#FFFBEB] tracking-widest font-bold">
              ✦ DREAM • BUILD • GROW ✦
            </span>
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* SHATTERED STATE: Explosion of pixel bricks & impact burst star    */
        /* ================================================================= */
        <div
          data-testid="intro-shattered-logo"
          className="relative w-full h-32 flex items-center justify-center pointer-events-none"
        >
          {/* Central Impact Burst Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <svg
              width="120"
              height="120"
              viewBox="0 0 32 32"
              fill="none"
              className="anim-impact-burst-flash"
              shapeRendering="crispEdges"
            >
              <rect x="14" y="0" width="4" height="32" fill="#FFCC00" />
              <rect x="0" y="14" width="32" height="4" fill="#FFCC00" />
              <rect x="5" y="5" width="7" height="7" fill="#FFFBEB" />
              <rect x="20" y="5" width="7" height="7" fill="#FFFBEB" />
              <rect x="5" y="20" width="7" height="7" fill="#FFFBEB" />
              <rect x="20" y="20" width="7" height="7" fill="#FFFBEB" />
              <rect x="11" y="11" width="10" height="10" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Scattering Pixel Bricks */}
          {fragments.map((frag) => (
            <div
              key={frag.id}
              className="absolute anim-logo-fragment"
              style={{
                width: frag.width,
                height: frag.height,
                backgroundColor: frag.color,
                border: `2px solid ${frag.borderColor}`,
                transform: `translate(${frag.initialX}px, ${frag.initialY}px)`,
                ['--frag-dx' as any]: frag.dx,
                ['--frag-dy' as any]: frag.dy,
                ['--frag-rot' as any]: frag.rot,
                animationDelay: frag.delay,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
