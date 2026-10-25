import React from 'react';

export interface StartupolyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'responsive';
  className?: string;
  glow?: boolean;
}

/**
 * StartupolyLogo: The official retro pixel-art logo featuring the classic
 * red power-up mushroom peaking from behind the chunky 3D STARTUPOLY wordmark.
 * Features subtle, non-distracting live ambient glow and periodic light sheen.
 */
export const StartupolyLogo: React.FC<StartupolyLogoProps> = ({
  size = 'responsive',
  className = '',
  glow = true,
}) => {
  const sizeClasses = {
    sm: 'w-[180px] sm:w-[220px]',
    md: 'w-[220px] sm:w-[260px] md:w-[290px]',
    lg: 'w-[260px] sm:w-[320px] md:w-[360px]',
    hero: 'w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px]',
    responsive: 'w-[215px] sm:w-[255px] md:w-[295px] lg:w-[325px]',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
    >
      {/* Seamless soft radiant ambient light aura breathing behind the logo */}
      {glow && (
        <div
          className="absolute -inset-4 sm:-inset-6 pointer-events-none anim-logo-glow"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255, 230, 100, 0.32) 0%, rgba(136, 192, 253, 0.28) 40%, rgba(136, 192, 253, 0) 72%)',
            filter: 'blur(12px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Container for logo image and sheen overlay without rectangular clip box */}
      <div className="relative w-full h-auto">
        {/* Official Pixel Art Mushroom + STARTUPOLY Wordmark */}
        <img
          src="/startupoly-logo.png"
          alt="STARTUPOLY"
          width={599}
          height={211}
          className="w-full h-auto object-contain relative z-10 drop-shadow-[2px_3px_0px_rgba(16,32,64,0.35)]"
          style={{
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />

        {/* Smooth diagonal light shine sweeping across the full logo every ~6.5s */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
        >
          <div className="w-[32%] h-full bg-gradient-to-r from-transparent via-white/45 to-transparent anim-logo-shimmer" />
        </div>
      </div>

      <span className="sr-only">STARTUPOLY</span>
    </div>
  );
};
