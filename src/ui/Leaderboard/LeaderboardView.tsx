import React, { useState, useEffect } from 'react';
import { Podium } from './Podium';
import { LeaderboardTable } from './LeaderboardTable';
import { LeaderboardEntry } from './exportHelpers';

export interface LeaderboardViewProps {
  standings: LeaderboardEntry[];
  highlightTeamName?: string;
  roomCode?: string;
  finalizedAt?: string | null;
  allowPresentationMode?: boolean;
}

export function enrichStandingsWithPitch(standings: LeaderboardEntry[]): LeaderboardEntry[] {
  return standings.map((entry, idx) => {
    const next = standings[idx + 1];

    const tiedWithNext =
      next &&
      next.is_bankrupt === entry.is_bankrupt &&
      next.cv === entry.cv &&
      next.cash === entry.cash &&
      next.business_count === entry.business_count;

    const wonOnPitch = Boolean(tiedWithNext);

    return {
      ...entry,
      won_on_pitch: entry.won_on_pitch ?? wonOnPitch,
    };
  });
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  standings,
  highlightTeamName,
  roomCode,
  finalizedAt,
  allowPresentationMode = true,
}) => {
  const [isPresentation, setIsPresentation] = useState<boolean>(false);

  // Esc key closes presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPresentation) {
        setIsPresentation(false);
      }
    };
    if (isPresentation) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPresentation]);

  const enrichedStandings = enrichStandingsWithPitch(standings);
  const winner = enrichedStandings.find((s) => s.rank === 1 && !s.is_bankrupt);

  const content = (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Winner Banner */}
      {winner && (
        <div className="bg-[#FFCC00] border-4 border-[#102040] shadow-[4px_4px_0px_#102040] p-4 sm:p-6 text-center select-none">
          <span className="font-pixel text-xs sm:text-sm text-[#92400E] uppercase tracking-widest block mb-1">
            ★ STARTUPOLY CHAMPION ★
          </span>
          <h1 className="font-pixel text-xl sm:text-3xl md:text-4xl text-[#102040] uppercase drop-shadow-[2px_2px_0px_#FFFFFF]">
            {winner.name}
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#102040] font-bold mt-2">
            Final Valuation: ₹{winner.cv.toLocaleString('en-IN')} Company Value • ₹{winner.cash.toLocaleString('en-IN')} Cash
          </p>
        </div>
      )}

      {/* Top 3 Podium */}
      <Podium
        topTeams={enrichedStandings.slice(0, 3)}
        highlightTeamName={highlightTeamName}
        presentationMode={isPresentation}
      />

      {/* Full Leaderboard Table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-pixel text-xs sm:text-sm uppercase tracking-wider text-[#102040]">
            OFFICIAL FINAL STANDINGS
          </span>
          {allowPresentationMode && !isPresentation && (
            <button
              type="button"
              onClick={() => setIsPresentation(true)}
              className="
                font-pixel text-[10px] sm:text-xs uppercase px-3 py-1.5 bg-[#102040] text-[#FFCC00]
                border-2 border-[#102040] shadow-[2px_2px_0px_#102040] hover:bg-[#1E293B] cursor-pointer
              "
            >
              📽 PRESENTATION MODE
            </button>
          )}
        </div>

        <LeaderboardTable
          standings={enrichedStandings}
          highlightTeamName={highlightTeamName}
          presentationMode={isPresentation}
        />
      </div>
    </div>
  );

  if (isPresentation) {
    return (
      <div className="fixed inset-0 z-50 bg-[#102040] overflow-y-auto p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-150">
        {/* Presentation Top Bar */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between border-b-2 border-white/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-lg sm:text-xl text-[#FFCC00]">
              STARTUPOLY SCOREBOARD
            </span>
            {roomCode && (
              <span className="font-mono text-xs text-white/80 bg-white/10 px-2 py-1 border border-white/20">
                ROOM: {roomCode.toUpperCase()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsPresentation(false)}
            className="font-pixel text-xs uppercase px-4 py-2 bg-[#D32F2F] text-white border-2 border-white hover:bg-[#B71C1C] cursor-pointer shadow-[2px_2px_0px_#000000]"
          >
            EXIT (Esc)
          </button>
        </div>

        {/* Presentation Content */}
        <div className="flex-1 w-full max-w-5xl mx-auto my-auto flex items-center justify-center">
          {content}
        </div>

        {/* Presentation Footer */}
        <div className="w-full max-w-6xl mx-auto pt-4 text-center border-t border-white/10">
          <span className="font-mono text-xs text-white/60">
            {finalizedAt ? `Finalized: ${new Date(finalizedAt).toLocaleString()}` : 'Live Official Match Results'}
          </span>
        </div>
      </div>
    );
  }

  return content;
};
