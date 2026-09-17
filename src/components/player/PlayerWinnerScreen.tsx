import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency, formatNumber, TEAM_METAS } from '../../constants/theme';
import { Trophy, ArrowLeft, Sparkles, Award } from 'lucide-react';

interface PlayerWinnerScreenProps {
  team: Team;
  onOpenExitConfirm?: () => void;
}

export const PlayerWinnerScreen: React.FC<PlayerWinnerScreenProps> = ({ team, onOpenExitConfirm }) => {
  const { rankedTeams } = useGame();
  const myRank = rankedTeams.findIndex(t => t.number === team.number) + 1;
  const winner = rankedTeams[0];
  const isWinner = winner?.number === team.number;
  const teamMeta = TEAM_METAS[team.number] || TEAM_METAS[1];

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-4 px-1 select-none max-w-[420px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {onOpenExitConfirm && (
          <button
            onClick={onOpenExitConfirm}
            className="p-2 rounded-xl bg-[#19191C] text-white/70 hover:text-white border border-white/10 transition cursor-pointer"
            title="Exit Game"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFBD59]/10 border border-[#FFBD59]/30 text-xs font-semibold text-[#FFBD59]">
          <Trophy className="w-3.5 h-3.5" /> MATCH CONCLUDED
        </span>
        <div className="w-8" />
      </div>

      {/* Main Team Performance Card */}
      <div className="my-auto py-3">
        <div className={`p-6 rounded-3xl eqx-card-elevated text-center relative overflow-hidden ${
          isWinner ? 'border-[#FFBD59] shadow-[0_0_30px_rgba(255,189,89,0.2)]' : 'border-white/10'
        }`}>
          {isWinner && (
            <div className="absolute top-0 inset-x-0 bg-[#FFBD59] py-1 text-black text-xs font-bold uppercase tracking-wider">
              👑 TOURNAMENT CHAMPION 👑
            </div>
          )}

          <div 
            className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-2xl font-bold my-4 border"
            style={{ 
              backgroundColor: teamMeta.badgeBg, 
              color: teamMeta.color,
              borderColor: `${teamMeta.color}40`
            }}
          >
            T0{team.number}
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {team.name ? team.name.toUpperCase() : `TEAM 0${team.number}`}
          </h2>

          <p className="text-sm font-semibold text-[#FFBD59] mt-1">
            RANK #{myRank} OF {rankedTeams.length} TEAMS
          </p>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-white/5 text-left">
            <div className="p-3 rounded-xl bg-[#141416] border border-white/5">
              <span className="text-[10px] uppercase text-white/40 block mb-0.5">FINAL VALUATION</span>
              <span className="text-base font-bold text-[#7484FE]">{formatNumber(team.cv)} CV</span>
            </div>
            <div className="p-3 rounded-xl bg-[#141416] border border-white/5">
              <span className="text-[10px] uppercase text-white/40 block mb-0.5">FINAL CASH</span>
              <span className="text-base font-bold text-[#33FF67]">{formatCurrency(team.cash)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Standings */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block px-1">
          OFFICIAL TOURNAMENT PODIUM
        </span>
        <div className="space-y-1.5">
          {rankedTeams.slice(0, 3).map((t, idx) => {
            const meta = TEAM_METAS[t.number] || TEAM_METAS[1];
            return (
              <div 
                key={t.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                  t.number === team.number 
                    ? 'bg-[#202024] border-[#7484FE] text-white' 
                    : 'bg-[#19191C] border-white/5 text-white/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-[#FFBD59]">#{idx + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="font-semibold text-white">{t.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#7484FE]">{formatNumber(t.cv)} CV</span>
                  <span className="text-[11px] text-white/40 ml-2">{formatCurrency(t.cash)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
