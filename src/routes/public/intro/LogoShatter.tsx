import React, { useMemo } from 'react';

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
  { fill: '#FFCC00', border: '#B84418' }, // Gold with brick outline
  { fill: '#FFD700', border: '#102040' }, // Bright gold with navy outline
  { fill: '#B84418', border: '#102040' }, // Brick red
  { fill: '#102040', border: '#FFCC00' }, // Deep Navy
  { fill: '#FFFBEB', border: '#B84418' }, // Cream highlight
];

export const LogoShatter: React.FC<LogoShatterProps> = ({
  shattered,
  className = '',
}) => {
  // Deterministic fragment layout around the logo bounds
  const fragments: Fragment[] = useMemo(() => {
    const list: Fragment[] = [];
    const count = 28;

    for (let i = 0; i < count; i++) {
      const colorScheme = FRAGMENT_COLORS[i % FRAGMENT_COLORS.length];
      const angle = (i / count) * 2 * Math.PI + (Math.sin(i) * 0.4);
      // Explode outward radially from center
      const distance = 90 + (i % 5) * 35;
      const dx = `${Math.cos(angle) * distance}px`;
      // Gravity pulls fragments slightly downward
      const dy = `${Math.sin(angle) * distance + 40}px`;
      const rot = `${(i % 2 === 0 ? 1 : -1) * (180 + (i * 25))}deg`;

      // Distribute initial positions across a ~240x50 logo area
      const initialX = ((i % 7) - 3) * 32 + (Math.sin(i * 3) * 10);
      const initialY = (Math.floor(i / 7) - 1.5) * 14 + (Math.cos(i * 2) * 6);

      list.push({
        id: i,
        width: 10 + (i % 4) * 4,
        height: 8 + (i % 3) * 4,
        color: colorScheme.fill,
        borderColor: colorScheme.border,
        dx,
        dy,
        rot,
        delay: `${(i % 3) * 0.02}s`,
        initialX,
        initialY,
      });
    }
    return list;
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* =================================================================== */}
      {/* INTACT STATE: Solid, clean pixel STARTUPOLY wordmark               */}
      {/* =================================================================== */}
      {!shattered ? (
        <div
          data-testid="intro-intact-logo"
          className="font-pixel tracking-wider font-extrabold text-[#FFCC00] uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl select-none"
          style={{
            textShadow: `
              3px 3px 0 #B84418,
              6px 6px 0 #102040,
              -2px -2px 0 #102040,
              2px -2px 0 #102040,
              -2px 2px 0 #102040,
              2px 2px 0 #102040
            `,
            letterSpacing: '0.08em',
          }}
          aria-label="STARTUPOLY"
        >
          STARTUPOLY
        </div>
      ) : (
        /* ================================================================= */
        /* SHATTERED STATE: Explosion of pixel bricks & impact burst star    */
        /* ================================================================= */
        <div
          data-testid="intro-shattered-logo"
          className="relative w-full h-24 flex items-center justify-center pointer-events-none"
        >
          {/* Central Impact Burst Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <svg
              width="96"
              height="96"
              viewBox="0 0 32 32"
              fill="none"
              className="anim-impact-burst-flash"
              shapeRendering="crispEdges"
            >
              {/* Star-shaped 8-point pixel burst */}
              <rect x="14" y="0" width="4" height="32" fill="#FFCC00" />
              <rect x="0" y="14" width="32" height="4" fill="#FFCC00" />
              <rect x="6" y="6" width="6" height="6" fill="#FFFBEB" />
              <rect x="20" y="6" width="6" height="6" fill="#FFFBEB" />
              <rect x="6" y="20" width="6" height="6" fill="#FFFBEB" />
              <rect x="20" y="20" width="6" height="6" fill="#FFFBEB" />
              <rect x="12" y="12" width="8" height="8" fill="#FFFFFF" />
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
                // Pass target displacement coordinates to CSS keyframe
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
