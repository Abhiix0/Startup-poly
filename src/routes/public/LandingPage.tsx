import React from 'react';
import { Link } from 'react-router-dom';
import {
  PixelButton,
  PixelCard,
  PixelCloud,
  PixelPipe,
  PixelMascot,
  PixelLogo,
  PixelBrickTile,
} from '../../ui';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between overflow-x-hidden selection:bg-[#FFCC00] selection:text-[#102040]">
      {/* NES Sky & Clouds Header */}
      <header className="relative pt-8 pb-4 px-4 text-center">
        {/* Decorative Floating Clouds */}
        <div className="hidden sm:block absolute top-6 left-8 lg:left-16 opacity-90 select-none pointer-events-none">
          <PixelCloud size={72} />
        </div>
        <div className="hidden md:block absolute top-12 right-12 lg:right-24 opacity-90 select-none pointer-events-none">
          <PixelCloud size={88} />
        </div>

        {/* Wordmark Logo */}
        <div className="mt-2 mb-4">
          <PixelLogo size="lg" showSubtitle={true} />
        </div>

        <div className="inline-block bg-[#102040] text-[#FFFBEB] px-4 py-2 border-2 border-[#FFCC00] shadow-[3px_3px_0px_#102040] max-w-lg mx-auto mt-2">
          <p className="font-mono text-xs sm:text-sm font-bold tracking-wide">
            The server-authoritative live scoreboard for the physical startup board game.
          </p>
        </div>
      </header>

      {/* Main Portals Grid */}
      <main className="max-w-4xl w-full mx-auto px-4 py-4 flex-1 flex flex-col justify-center gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Team Portal Card */}
          <PixelCard
            title="PLAYING IN A MATCH?"
            headerBg="gold"
            variant="cream"
            padding="lg"
            className="flex flex-col justify-between"
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 bg-[#FFCC00] text-[#102040] border-4 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center font-pixel text-2xl">
                📱
              </div>
              <h2 className="font-pixel text-sm sm:text-base text-[#102040]">
                TEAM PHONE SCOREBOARD
              </h2>
              <p className="font-mono text-xs text-[#1E293B] leading-relaxed">
                Connect your team’s phone to monitor live cash, company value, and businesses in real time.
              </p>
            </div>

            <Link to="/join" className="w-full block">
              <PixelButton variant="secondary" size="lg" fullWidth>
                JOIN MATCH (PHONE)
              </PixelButton>
            </Link>
          </PixelCard>

          {/* Admin Portal Card */}
          <PixelCard
            title="EVENT ORGANIZER?"
            headerBg="green"
            variant="cream"
            padding="lg"
            className="flex flex-col justify-between"
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 bg-[#22B14C] text-white border-4 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center font-pixel text-2xl">
                💻
              </div>
              <h2 className="font-pixel text-sm sm:text-base text-[#102040]">
                EVENT ADMIN CONSOLE
              </h2>
              <p className="font-mono text-xs text-[#1E293B] leading-relaxed">
                Host matches, configure teams, control the 50-minute clock, and record board transactions.
              </p>
            </div>

            <Link to="/admin" className="w-full block">
              <PixelButton variant="primary" size="lg" fullWidth>
                OPEN ADMIN CONSOLE
              </PixelButton>
            </Link>
          </PixelCard>
        </div>

        {/* Rulebook Highlights Pill Bar */}
        <div className="bg-white border-4 border-[#102040] p-4 shadow-[4px_4px_0px_#102040] text-center">
          <div className="font-pixel text-[10px] text-[#102040] uppercase tracking-wider mb-2 font-bold">
            ★ OFFICIAL TOURNAMENT SPECIFICATIONS ★
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-[#102040] font-semibold">
            <span>⏱ 50-Minute Match</span>
            <span>👥 5–6 Teams</span>
            <span>💰 Start ₹1,000 Cash</span>
            <span>🏢 Max 3 Businesses</span>
            <span>⚖ Server-Authoritative</span>
          </div>
        </div>
      </main>

      {/* NES Platformer Ground Footer */}
      <footer className="w-full relative select-none">
        {/* Decorative Ground Platform with Mascot and Pipe */}
        <div className="max-w-4xl mx-auto px-4 relative flex items-end justify-between -mb-1 pointer-events-none">
          {/* Green Pipe on Left */}
          <div className="mb-0 ml-4 hidden sm:block">
            <PixelPipe />
          </div>

          {/* Poly Mascot on Right */}
          <div className="mr-8 mb-0 flex items-end gap-2">
            <div className="hidden sm:block font-pixel text-[10px] bg-white text-[#102040] px-2 py-1 border-2 border-[#102040] shadow-[2px_2px_0px_#102040] mb-8">
              Let's Build!
            </div>
            <PixelMascot size={72} />
          </div>
        </div>

        {/* Brick Ground Tile */}
        <PixelBrickTile hasGrass={true} className="h-10" />

        {/* Bottom Bar with Metadata */}
        <div className="bg-[#102040] py-3 px-4 text-center border-t-2 border-[#FFCC00]">
          <p className="font-pixel text-[9px] sm:text-[10px] text-[#FFCC00] tracking-wider">
            STARTUPOLY © 2026 • 8-BIT LIVE SCOREBOARD & EVENT MANAGEMENT SYSTEM
          </p>
        </div>
      </footer>
    </div>
  );
};
