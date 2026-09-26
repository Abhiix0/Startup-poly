import React from 'react';

export interface StartupolyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'responsive';
  className?: string;
  glow?: boolean;
}

/**
 * StartupolyLogo: The official retro pixel-art logo featuring the classic
 * red power-up mushroom peaking from behind the chunky 3D STARTUPOLY wordmark.
 */
export const StartupolyLogo: React.FC<StartupolyLogoProps> = ({
  size = 'responsive',
  className = '',
  glow = false,
}) => {
  const sizeClasses = {
    sm: 'w-[180px] sm:w-[220px]',
    md: 'w-[240px] sm:w-[300px] md:w-[360px]',
    lg: 'w-[320px] sm:w-[400px] md:w-[460px]',
    hero: 'w-[290px] sm:w-[420px] md:w-[520px] lg:w-[580px]',
    responsive: 'w-[260px] sm:w-[340px] md:w-[400px]',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
    >
      {/* Optional ambient warm aura behind the logo */}
      {glow && (
        <div
          className="absolute inset-0 bg-[#FFCC00] opacity-20 blur-xl rounded-full scale-110 pointer-events-none"
          aria-hidden="true"
        />
      )}

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
      <span className="sr-only">STARTUPOLY</span>
    </div>
  );
};
