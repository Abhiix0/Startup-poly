import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency, formatNumber, MARIO_CHARACTERS } from '../../constants/theme';
import { Trophy, ArrowLeft } from 'lucide-react';

interface PlayerWinnerScreenProps {
  team: Team;
  onOpenExitConfirm?: () => void;
}

export const PlayerWinnerScreen: React.FC<PlayerWinnerScreenProps> = ({ team, onOpenExitConfirm }) => {
  const { rankedTeams } = useGame();
  const myRank = rankedTeams.findIndex(t => t.number === team.number) + 1;
  const winner = rankedTeams[0];
  const isWinner = winner?.number === team.number;
  const char = MARIO_CHARACTERS[team.number] || MARIO_CHARACTERS[1];

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-4 px-1 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {onOpenExitConfirm && (
          <button
            onClick={onOpenExitConfirm}
            className="p-1.5 -ml-1 rounded-lg bg-[#262022] text-[#A89F91] hover:text-[#FDF6E2] border border-[#3D3234] shadow-[2px_2px_0px_#000] transition cursor-pointer"
            title="Exit Game"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FBD000]/20 border-2 border-[#FBD000] font-pixel text-[9px] text-[#FBD000]">
          <Trophy className="w-3.5 h-3.5" /> STAGE CLEAR!
        </span>
        <div className="w-6" />
      </div>

      {/* Main Team Performance Card */}
      <div className="my-auto py-3">
        <div className={`p-6 rounded-3xl bg-[#1B1718] border-3 text-center relative overflow-hidden ${
          isWinner ? 'border-[#FBD000] shadow-[8px_8px_0px_#C69200]' : 'border-[#FDF6E2] shadow-[6px_6px_0px_#000]'
        }`}>
          {isWinner && (
            <div className="absolute top-0 inset-x-0 bg-[#FBD000] py-1 text-black font-pixel text-[9px] uppercase tracking-wider shadow-sm">
              👑 WORLD CHAMPION 👑
            </div>
          )}

          <div className="text-5xl my-3 animate-bounce">
            {isWinner ? '👑' : char.icon}
          </div>

          <h2 className="font-pixel text-base text-[#FDF6E2] tracking-wide">
            {char.characterName.toUpperCase()}
          </h2>

          <p className="font-pixel text-[10px] text-[#FBD000] mt-1.5">
            RANK #{myRank} OF {rankedTeams.length} PLAYERS
          </p>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t-2 border-[#3D3234] text-left">
            <div className="p-3 rounded-xl bg-[#101014] border border-[#3D3234]">
              <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">FINAL STARS</span>
              <span className="font-pixel text-sm text-[#5C94FC]">{formatNumber(team.cv)} CV</span>
            </div>
            <div className="p-3 rounded-xl bg-[#101014] border border-[#3D3234]">
              <span className="font-pixel text-[8px] uppercase text-[#A89F91] block mb-1">FINAL COINS</span>
              <span className="font-pixel text-sm text-[#FBD000]">{formatCurrency(team.cash)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Standings */}
      <div className="space-y-2">
        <span className="font-pixel text-[9px] uppercase text-[#A89F91] block px-1">
          CASTLE STANDINGS
        </span>
        <div className="space-y-1.5">
          {rankedTeams.slice(0, 3).map((t, idx) => {
            const teamChar = MARIO_CHARACTERS[t.number] || MARIO_CHARACTERS[1];
            return (
              <div 
                key={t.id}
                className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs ${
                  t.number === team.number 
                    ? 'bg-[#262022] border-[#FBD000] text-[#FDF6E2]' 
                    : 'bg-[#1B1718] border-[#3D3234] text-[#A89F91]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[10px] text-[#FBD000]">#{idx + 1}</span>
                  <span className="text-base">{teamChar.icon}</span>
                  <span className="font-pixel text-[9px] text-[#FDF6E2]">{teamChar.characterName}</span>
                </div>
                <span className="font-pixel text-[10px] text-[#5C94FC]">{formatNumber(t.cv)} CV</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

