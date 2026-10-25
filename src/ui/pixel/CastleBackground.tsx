import React from 'react';
import { PixelCloudFluffy } from './PixelCloudFluffy';
import { PixelBrickTile } from './PixelBrickTile';

export interface CastleBackgroundProps {
  isGateOpen?: boolean;
  children: React.ReactNode;
}

export const CastleBackground: React.FC<CastleBackgroundProps> = ({
  isGateOpen = false,
  children,
}) => {
  return (
    <div className="min-h-screen nes-sky-gradient flex flex-col justify-between relative overflow-hidden select-none anim-scene-transition">
      {/* ======================================================================= */}
      {/* Sky & Moving Drifting Clouds (Matching Landing Page Sky)                */}
      {/* ======================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* High-Altitude Upper Cloud Lane (Smooth 110s Drift) */}
        <div className="absolute inset-x-0 top-2 sm:top-3.5 h-16 overflow-hidden pointer-events-none">
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-far opacity-70"
            style={{ animationDelay: '-16s' }}
          >
            {/* Panel 1 */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[8%]">
                <PixelCloudFluffy size={50} />
              </div>
              <div className="absolute top-0.5 left-[68%]">
                <PixelCloudFluffy size={46} />
              </div>
            </div>
            {/* Panel 2 (Seamless infinite loop) */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[8%]">
                <PixelCloudFluffy size={50} />
              </div>
              <div className="absolute top-0.5 left-[68%]">
                <PixelCloudFluffy size={46} />
              </div>
            </div>
          </div>
        </div>

        {/* Mid-Sky Flank Cloud Lane (Smooth 80s Drift) */}
        <div className="absolute inset-x-0 top-12 sm:top-16 h-16 overflow-hidden pointer-events-none">
          <div
            className="flex w-[200%] shrink-0 anim-cloud-drift-mid opacity-60"
            style={{ animationDelay: '-38s' }}
          >
            {/* Panel 1 */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[24%]">
                <PixelCloudFluffy size={42} />
              </div>
              <div className="absolute top-1.5 left-[80%]">
                <PixelCloudFluffy size={48} />
              </div>
            </div>
            {/* Panel 2 (Seamless infinite loop) */}
            <div className="w-1/2 relative h-14 shrink-0">
              <div className="absolute top-1 left-[24%]">
                <PixelCloudFluffy size={42} />
              </div>
              <div className="absolute top-1.5 left-[80%]">
                <PixelCloudFluffy size={48} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* Castle Fortress Wall & Towers Layer (Behind Signboard)                 */}
      {/* ======================================================================= */}
      <div className="absolute inset-x-0 bottom-8 h-80 sm:h-96 pointer-events-none z-0 flex justify-between items-end">
        {/* Left Castle Tower */}
        <div className="hidden sm:flex w-36 h-full flex-col items-center">
          {/* Flag */}
          <div className="w-8 h-5 bg-[#D32F2F] border-2 border-[#102040] anim-flag self-start ml-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#FFCC00]" />
          </div>
          {/* Flagpole */}
          <div className="w-1.5 h-6 bg-[#102040] self-start ml-4" />
          {/* Tower Top Battlements / Crenellations */}
          <div className="w-full flex justify-between">
            <div className="w-6 h-6 bg-[#334155] border-t-4 border-x-4 border-[#102040]" />
            <div className="w-6 h-6 bg-[#334155] border-t-4 border-x-4 border-[#102040]" />
            <div className="w-6 h-6 bg-[#334155] border-t-4 border-x-4 border-[#102040]" />
          </div>
          {/* Tower Body */}
          <div className="w-full flex-1 bg-[#334155] border-x-4 border-[#102040] relative castle-stone-pattern">
            {/* Castle Window / Slit */}
            <div className="w-4 h-8 bg-[#102040] mx-auto mt-6 rounded-t-sm" />
            {/* Wall Torch */}
            <div className="absolute top-20 right-3 flex flex-col items-center anim-torch">
              <div className="w-3 h-3 bg-[#FFCC00] border border-[#102040] rounded-full" />
              <div className="w-1.5 h-3 bg-[#8B4513]" />
            </div>
          </div>
        </div>

        {/* Center Castle Gate & Main Wall */}
        <div className="flex-1 h-64 sm:h-72 bg-[#475569] border-t-4 border-x-4 border-[#102040] relative castle-stone-pattern flex flex-col justify-between">
          {/* Center Wall Crenellations */}
          <div className="w-full flex justify-around -mt-4">
            <div className="w-8 h-4 bg-[#475569] border-t-4 border-x-4 border-[#102040]" />
            <div className="w-8 h-4 bg-[#475569] border-t-4 border-x-4 border-[#102040]" />
            <div className="w-8 h-4 bg-[#475569] border-t-4 border-x-4 border-[#102040]" />
            <div className="w-8 h-4 bg-[#475569] border-t-4 border-x-4 border-[#102040]" />
          </div>

          {/* Torches framing the gate area */}
          <div className="hidden sm:flex w-full justify-between px-12 sm:px-24 mt-4">
            <div className="flex flex-col items-center anim-torch">
              <div className="w-3.5 h-3.5 bg-[#FFCC00] border border-[#102040] rounded-full" />
              <div className="w-1.5 h-4 bg-[#8B4513] border border-[#102040]" />
            </div>
            <div className="flex flex-col items-center anim-torch">
              <div className="w-3.5 h-3.5 bg-[#FFCC00] border border-[#102040] rounded-full" />
              <div className="w-1.5 h-4 bg-[#8B4513] border border-[#102040]" />
            </div>
          </div>

          {/* Castle Arched Gate / Portcullis */}
          <div className="w-36 sm:w-52 h-40 sm:h-48 bg-[#102040] mx-auto rounded-t-full border-t-4 border-x-4 border-[#102040] relative overflow-hidden">
            {/* Iron Portcullis Grid that opens on success */}
            <div
              className={`w-full h-full bg-[#1E293B] border-t-2 border-[#475569] flex flex-col justify-around py-2 ${
                isGateOpen ? 'anim-gate-open' : ''
              }`}
            >
              <div className="w-full h-1 bg-[#64748B]" />
              <div className="w-full h-1 bg-[#64748B]" />
              <div className="w-full h-1 bg-[#64748B]" />
              <div className="w-full h-1 bg-[#64748B]" />
            </div>
          </div>
        </div>

        {/* Right Castle Tower */}
        <div className="hidden sm:flex w-36 h-full flex-col items-center">
          {/* Flag */}
          <div className="w-8 h-5 bg-[#22B14C] border-2 border-[#102040] anim-flag self-end mr-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#FFCC00]" />
          </div>
          {/* Flagpole */}
          <div className="w-1.5 h-6 bg-[#102040] self-end mr-4" />
          {/* Tower Top Battlements */}
          <div className="w-full flex justify-between">
            <div className="w-6 h-6 bg-[#334155] border-t-4 border-x-4 border-[#102040]" />
            <div className="w-6 h-6 bg-[#334155] border-t-4 border-x-4 border-[#102040]" />
            <div className="w-6 h-6 bg-[#334155] border-t-4 border-x-4 border-[#102040]" />
          </div>
          {/* Tower Body */}
          <div className="w-full flex-1 bg-[#334155] border-x-4 border-[#102040] relative castle-stone-pattern">
            {/* Castle Window / Slit */}
            <div className="w-4 h-8 bg-[#102040] mx-auto mt-6 rounded-t-sm" />
            {/* Wall Torch */}
            <div className="absolute top-20 left-3 flex flex-col items-center anim-torch">
              <div className="w-3 h-3 bg-[#FFCC00] border border-[#102040] rounded-full" />
              <div className="w-1.5 h-3 bg-[#8B4513]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Foreground Content (Signboard Mounted on the scene) */}
      <div className="relative z-30 flex-1 flex flex-col justify-between">
        {children}
      </div>

      {/* ======================================================================= */}
      {/* Brick Ground Base Strip                                                 */}
      {/* ======================================================================= */}
      <div className="relative z-20 w-full">
        <PixelBrickTile hasGrass={false} className="h-8 sm:h-10 w-full" />
      </div>
    </div>
  );
};
