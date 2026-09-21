import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../data/auth';
import { PixelButton, PixelCard, StatusPill } from '../../ui';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Admin Top Navigation */}
      <header className="bg-[#102040] text-white border-b-4 border-[#102040] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#102040]">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-sm text-[#FFCC00]">STARTUPOLY</span>
          <span className="hidden sm:inline font-mono text-xs text-[#E2E8F0] border-l-2 border-white/20 pl-3">
            ADMIN CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline font-mono text-xs text-[#94A3B8]">
            {user?.email}
          </span>
          <Link to="/admin/history">
            <PixelButton variant="ghost" size="sm">
              HISTORY
            </PixelButton>
          </Link>
          <PixelButton variant="danger" size="sm" onClick={() => logout()}>
            LOGOUT
          </PixelButton>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <PixelCard title="MATCH OPERATIONS" headerBg="navy" padding="lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b-2 border-[#102040]">
            <div>
              <h1 className="font-pixel text-lg uppercase text-[#102040] mb-1">
                ACTIVE GAME ROOM
              </h1>
              <p className="font-mono text-xs text-[#64748B]">
                Only one non-finalized room can run at a time (Official Rulebook)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status="LOBBY" pulse />
            </div>
          </div>

          <div className="py-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-[#FFCC00] border-3 border-[#102040] shadow-[3px_3px_0px_#102040] flex items-center justify-center font-pixel text-2xl text-[#102040]">
              🎮
            </div>
            <h2 className="font-pixel text-sm text-[#102040]">READY TO HOST A TOURNAMENT MATCH</h2>
            <p className="font-mono text-xs text-[#64748B] max-w-md">
              Create a new room with 5–6 teams, project the scoreboard onto the main screen, and record
              cash, acquisitions, and upgrades as teams move physically around the board.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <PixelButton variant="primary" size="lg">
                CREATE NEW ROOM (PHASE 5)
              </PixelButton>
              <Link to="/admin/history">
                <PixelButton variant="secondary" size="lg">
                  PAST MATCHES
                </PixelButton>
              </Link>
            </div>
          </div>
        </PixelCard>
      </main>

      {/* Brick Ground Base */}
      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
