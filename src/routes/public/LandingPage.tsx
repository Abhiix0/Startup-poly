import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton, PixelCard } from '../../ui';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between overflow-x-hidden selection:bg-[#FFCC00] selection:text-[#102040]">
      {/* NES Sky & Clouds Header */}
      <header className="relative pt-8 pb-4 px-4 text-center">
        {/* Pixel Cloud Decorations */}
        <div className="hidden sm:block absolute top-6 left-12 opacity-80 select-none pointer-events-none">
          <div className="w-20 h-6 bg-white border-3 border-[#102040] shadow-[2px_2px_0px_#102040] relative">
            <div className="w-10 h-6 bg-white border-t-3 border-x-3 border-[#102040] absolute -top-5 left-4" />
          </div>
        </div>
        <div className="hidden sm:block absolute top-10 right-16 opacity-80 select-none pointer-events-none">
          <div className="w-24 h-6 bg-white border-3 border-[#102040] shadow-[2px_2px_0px_#102040] relative">
            <div className="w-12 h-7 bg-white border-t-3 border-x-3 border-[#102040] absolute -top-6 left-5" />
          </div>
        </div>

        {/* Title Badge */}
        <div className="inline-block bg-[#FFCC00] border-4 border-[#102040] px-4 py-1 shadow-[3px_3px_0px_#102040] mb-3">
          <span className="font-pixel text-[10px] sm:text-xs text-[#102040] font-bold tracking-widest uppercase">
            ★ OFFICIAL TOURNAMENT SCOREBOARD ★
          </span>
        </div>

        {/* Main Logo Title */}
        <h1 className="font-pixel text-4xl sm:text-6xl md:text-7xl text-white tracking-wider uppercase drop-shadow-[4px_4px_0px_#102040] mb-3">
          STARTUPOLY
        </h1>

        <p className="font-mono text-xs sm:text-sm text-white font-bold tracking-wide drop-shadow-[1px_1px_0px_#102040] max-w-xl mx-auto">
          The server-authoritative live scoreboard for the physical startup board game.
        </p>
      </header>

      {/* Main Action Portals Grid */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Portal Card */}
          <PixelCard
            title="PLAYING IN A MATCH?"
            headerBg="green"
            variant="cream"
            padding="lg"
            className="flex flex-col justify-between"
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 bg-[#22B14C] text-white border-4 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center font-pixel text-2xl">
                📱
              </div>
              <h2 className="font-pixel text-sm sm:text-base text-[#102040]">
                TEAM PLAYER PORTAL
              </h2>
              <p className="font-mono text-xs text-[#64748B] leading-relaxed">
                Connect your team’s phone to monitor live cash, company value, and portfolio in real time.
              </p>
            </div>

            <Link to="/join" className="w-full block">
              <PixelButton variant="primary" size="lg" fullWidth>
                JOIN MATCH NOW
              </PixelButton>
            </Link>
          </PixelCard>

          {/* Admin Portal Card */}
          <PixelCard
            title="EVENT ORGANIZER?"
            headerBg="navy"
            variant="cream"
            padding="lg"
            className="flex flex-col justify-between"
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 bg-[#102040] text-[#FFCC00] border-4 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center font-pixel text-2xl">
                💻
              </div>
              <h2 className="font-pixel text-sm sm:text-base text-[#102040]">
                EVENT ADMIN CONSOLE
              </h2>
              <p className="font-mono text-xs text-[#64748B] leading-relaxed">
                Host matches, configure teams, control the 50-minute clock, and record board transactions.
              </p>
            </div>

            <Link to="/admin" className="w-full block">
              <PixelButton variant="secondary" size="lg" fullWidth>
                OPEN ADMIN CONSOLE
              </PixelButton>
            </Link>
          </PixelCard>
        </div>

        {/* Rulebook Highlights Pill Bar */}
        <div className="bg-white border-3 border-[#102040] p-4 shadow-[4px_4px_0px_#102040] text-center">
          <div className="font-pixel text-[10px] text-[#102040] uppercase tracking-wider mb-2">
            OFFICIAL TOURNAMENT RULES AT A GLANCE
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-[#64748B]">
            <span>⏱ 50-Minute Match</span>
            <span>👥 5–6 Teams</span>
            <span>💰 Start ₹1,000 Cash</span>
            <span>🏢 Max 3 Businesses</span>
            <span>⚖ Server-Authoritative</span>
          </div>
        </div>
      </main>

      {/* NES Ground Footer */}
      <footer className="w-full">
        {/* Grass / Ground Border */}
        <div className="h-3 bg-[#22B14C] border-t-4 border-[#102040]" />
        {/* Chunky Brick Base */}
        <div className="nes-brick-pattern py-4 px-4 border-t-3 border-[#102040] text-center">
          <p className="font-pixel text-[10px] text-white/90 drop-shadow-[1px_1px_0px_#102040]">
            STARTUPOLY © 2026 • PHYSICAL STARTUP BOARD GAME SCOREBOARD
          </p>
        </div>
      </footer>
    </div>
  );
};
