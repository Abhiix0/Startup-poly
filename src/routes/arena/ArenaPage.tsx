import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminRoom } from '../../data/useAdminRoom';
import { PixelLoader, ConnectionPill } from '../../ui';
import { sounds } from '../../lib/sound';

export const ArenaPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { snapshot, status, connection, lastUpdated } = useAdminRoom(roomId);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  // Play buzzer sound on match expiry
  useEffect(() => {
    if (snapshot?.room.status === 'TIME_EXPIRED') {
      sounds.playBuzzer();
    } else if (snapshot?.room.status === 'FINALIZED') {
      sounds.playVictory();
    }
  }, [snapshot?.room.status]);

  if (status === 'loading' || !snapshot) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white font-pixel">
        <PixelLoader />
        <p className="mt-4 text-brand-gold text-sm animate-pulse">CONNECTING TO ARENA SCREEN...</p>
      </div>
    );
  }

  // Calculate live rankings based on Total Company Value (Cash + CV)
  const rankedTeams = [...snapshot.teams].sort((a, b) => {
    if (a.is_bankrupt !== b.is_bankrupt) {
      return a.is_bankrupt ? 1 : -1;
    }
    const totalA = a.cash + a.cv;
    const totalB = b.cash + b.cv;
    if (totalB !== totalA) return totalB - totalA;
    if (b.cash !== a.cash) return b.cash - a.cash;
    return b.businesses.length - a.businesses.length;
  });

  const leader = rankedTeams[0];
  const isExpired = snapshot.room.status === 'TIME_EXPIRED';
  const isFinalized = snapshot.room.status === 'FINALIZED';

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between selection:bg-brand-gold selection:text-brand-navy overflow-hidden">
      {/* ARENA HEADER */}
      <header className="bg-neutral-900 border-b-4 border-brand-gold px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="font-pixel text-xl sm:text-2xl text-brand-gold tracking-widest drop-shadow-[2px_2px_0px_#000]"
          >
            ★ STARTUPOLY ARENA ★
          </Link>
          <span className="bg-neutral-800 border-2 border-neutral-700 px-3 py-1 font-pixel text-xs text-neutral-300">
            ROOM: {snapshot.room.code}
          </span>
        </div>

        {/* Big Match Timer */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="font-pixel text-[10px] text-neutral-400 block tracking-widest">
              MATCH CLOCK
            </span>
            <span
              className={`font-pixel text-3xl sm:text-4xl tabular-nums font-black ${
                isExpired || isFinalized ? 'text-brand-red animate-pulse' : 'text-brand-green'
              }`}
            >
              {isFinalized ? 'FINALIZED' : isExpired ? '00:00' : 'LIVE'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            title="Toggle Arena Sound FX"
            className="bg-neutral-800 border-2 border-neutral-600 px-3 py-2 font-pixel text-xs hover:border-brand-gold transition-colors"
          >
            {soundEnabled ? '🔊 SOUND ON' : '🔇 MUTED'}
          </button>
        </div>
      </header>

      {/* FINALIZED CHAMPION CALLOUT */}
      {isFinalized && leader && !leader.is_bankrupt && (
        <div className="bg-gradient-to-r from-brand-gold via-amber-300 to-brand-gold text-brand-navy py-4 px-6 text-center border-b-4 border-neutral-900 shadow-pixel flex items-center justify-center gap-3 anim-trophy-bob">
          <span className="text-3xl">🏆</span>
          <span className="font-pixel text-xl sm:text-2xl font-black tracking-wide">
            TOURNAMENT CHAMPION: {leader.name.toUpperCase()} (₹{(leader.cash + leader.cv).toLocaleString('en-IN')})
          </span>
          <span className="text-3xl">🏆</span>
        </div>
      )}

      {/* MAIN 6-TEAM STADIUM GRID */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedTeams.map((team, idx) => {
            const rank = idx + 1;
            const totalValue = team.cash + team.cv;
            const isFirst = rank === 1 && !team.is_bankrupt;

            return (
              <div
                key={team.id}
                className={`
                  relative border-4 border-neutral-800 bg-neutral-900 shadow-[6px_6px_0px_#000] p-5 flex flex-col justify-between transition-all duration-300
                  ${isFirst ? 'ring-4 ring-brand-gold bg-gradient-to-b from-neutral-900 to-neutral-800 scale-105 z-10' : ''}
                  ${team.is_bankrupt ? 'opacity-50 grayscale' : ''}
                `}
              >
                {/* Team Header / Rank */}
                <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                        w-9 h-9 border-2 border-neutral-900 font-pixel text-sm flex items-center justify-center font-bold shadow-pixel-sm
                        ${rank === 1 ? 'bg-brand-gold text-brand-navy' : rank === 2 ? 'bg-neutral-300 text-brand-navy' : rank === 3 ? 'bg-amber-700 text-white' : 'bg-neutral-800 text-neutral-300'}
                      `}
                    >
                      #{rank}
                    </span>
                    <span
                      className="w-4 h-4 border border-white/40 shadow-sm"
                      style={{ backgroundColor: team.color }}
                    />
                    <h2 className="font-pixel text-base text-white truncate max-w-[160px]">
                      {team.name}
                    </h2>
                  </div>

                  {team.is_bankrupt ? (
                    <span className="font-pixel text-[10px] bg-brand-red text-white px-2 py-0.5 border border-white/20">
                      ELIMINATED
                    </span>
                  ) : isFirst ? (
                    <span className="font-pixel text-[10px] bg-brand-gold text-brand-navy px-2 py-0.5 font-bold border border-brand-navy animate-pulse">
                      👑 LEADER
                    </span>
                  ) : null}
                </div>

                {/* Primary Metric: Total Valuation */}
                <div className="my-2 text-center bg-black/40 border-2 border-neutral-800 p-3 rounded">
                  <span className="font-pixel text-[10px] text-brand-gold block tracking-widest uppercase">
                    TOTAL COMPANY VALUE
                  </span>
                  <span className="font-pixel text-3xl sm:text-4xl text-white font-black tabular-nums tracking-tight">
                    ₹{totalValue.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Cash & CV Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-center my-2">
                  <div className="bg-neutral-950 p-2 border border-neutral-800">
                    <span className="font-pixel text-[9px] text-neutral-400 block">CASH</span>
                    <span className="font-mono text-sm font-bold text-brand-green tabular-nums">
                      ₹{team.cash.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-neutral-950 p-2 border border-neutral-800">
                    <span className="font-pixel text-[9px] text-neutral-400 block">CV</span>
                    <span className="font-mono text-sm font-bold text-sky-400 tabular-nums">
                      ₹{team.cv.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Business Portfolio Badges */}
                <div className="mt-3 pt-3 border-t-2 border-neutral-800 flex items-center justify-between">
                  <span className="font-pixel text-[9px] text-neutral-400">
                    PORTFOLIO ({team.businesses.length}/2)
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {team.businesses.map((biz) => (
                      <span
                        key={biz.business_key}
                        className="bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] text-brand-gold font-bold flex items-center gap-1"
                      >
                        {biz.name.slice(0, 4).toUpperCase()}
                        {biz.level > 0 && (
                          <span className="text-yellow-400 text-[10px]">
                            {'★'.repeat(biz.level)}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ARENA TICKER TAPE FOOTER */}
      <footer className="bg-neutral-900 border-t-4 border-neutral-800 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-brand-gold text-brand-navy font-pixel text-[10px] px-2 py-0.5 font-bold animate-pulse">
            LIVE COURT FEED
          </span>
          <span className="font-mono text-xs text-neutral-400 truncate max-w-2xl">
            {leader ? `Current leader: ${leader.name} with ₹${(leader.cash + leader.cv).toLocaleString('en-IN')} total valuation` : 'Tournament in progress'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionPill status={connection} />
          <span className="font-mono text-[10px] text-neutral-500">
            Updated: {lastUpdated}
          </span>
        </div>
      </footer>
    </div>
  );
};
