import React from 'react';
import { PixelCloudFluffy } from './PixelCloudFluffy';
import { PixelHill } from './PixelHill';
import { PixelQuestionBlock } from './PixelQuestionBlock';
import { PixelCoin } from './PixelCoin';
import { PixelSparkle } from './PixelSparkle';
import { PixelGrassTuft } from './PixelGrassTuft';
import { PixelBrickTile } from './PixelBrickTile';

export interface PlainsBackgroundProps {
  children: React.ReactNode;
}

export const PlainsBackground: React.FC<PlainsBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between relative overflow-hidden select-none anim-scene-transition">
      {/* ======================================================================= */}
      {/* Sky & Clouds Layer                                                      */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-4 left-[6%] opacity-60">
          <PixelCloudFluffy size={58} />
        </div>
        <div className="absolute top-10 right-[8%] opacity-70">
          <PixelCloudFluffy size={78} />
        </div>
        <div className="absolute top-20 left-[45%] opacity-50">
          <PixelCloudFluffy size={48} />
        </div>
      </div>

      {/* ======================================================================= */}
      {/* Ground Scene & Environmental Decorations (Hills, Blocks, Coins)        */}
      {/* ======================================================================= */}
      <div className="absolute inset-x-0 bottom-8 h-40 sm:h-52 pointer-events-none z-0">
        {/* Left Hill */}
        <div className="absolute bottom-0 -left-6 sm:left-4 opacity-85">
          <PixelHill size={160} />
        </div>

        {/* Floating Question Block Left */}
        <div className="hidden sm:block absolute bottom-28 left-20 anim-block-cycle">
          <PixelQuestionBlock size={36} />
        </div>

        {/* Left Sparkles */}
        <div className="absolute bottom-16 left-32 anim-sparkle-cycle">
          <PixelSparkle size={20} />
        </div>

        {/* Left Grass */}
        <div className="hidden md:block absolute bottom-0 left-48 anim-grass-sway">
          <PixelGrassTuft size={28} variant={1} />
        </div>

        {/* Right Hill */}
        <div className="hidden sm:block absolute bottom-0 right-2 lg:right-8 opacity-85">
          <PixelHill size={180} />
        </div>

        {/* Floating Question Block Right with Coin */}
        <div className="hidden md:block absolute bottom-32 right-28 anim-block-cycle" style={{ animationDelay: '-3s' }}>
          <PixelQuestionBlock size={38} />
        </div>

        {/* Right Coin Floating */}
        <div className="hidden sm:flex absolute bottom-20 right-16 flex-col items-center anim-coin-idle">
          <PixelCoin size={24} />
        </div>

        {/* Right Grass */}
        <div className="hidden lg:block absolute bottom-0 right-56 anim-grass-sway" style={{ animationDelay: '-1.5s' }}>
          <PixelGrassTuft size={28} variant={2} />
        </div>
      </div>

      {/* Main Foreground Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {children}
      </div>

      {/* ======================================================================= */}
      {/* Brick Ground Base Strip                                                 */}
      {/* ======================================================================= */}
      <div className="relative z-20 w-full">
        <PixelBrickTile hasGrass={true} className="h-8 sm:h-10 w-full" />
      </div>
    </div>
  );
};
