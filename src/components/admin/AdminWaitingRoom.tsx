import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Play, Copy, Check, ArrowLeft, Gamepad2 } from 'lucide-react';

interface AdminWaitingRoomProps {
  onOpenExitConfirm?: () => void;
}

export const AdminWaitingRoom: React.FC<AdminWaitingRoomProps> = ({ onOpenExitConfirm }) => {
  const { state, startMatch, updateSettings } = useGame();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(state.matchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const readyCount = state.teams.filter(t => t.membersJoined >= 1).length;

  return (
    <div className="max-w-4xl w-full mx-auto py-4 space-y-6 select-none">
      {/* Header Banner */}
      <div className="p-6 nes-box bg-[#181820] border-4 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_#000]">
        <div className="flex items-start gap-3">
          {onOpenExitConfirm && (
            <button
              onClick={onOpenExitConfirm}
              className="p-2.5 nes-box bg-[#22222E] hover:bg-[#E52521] text-[#8E8E93] hover:text-white border-2 border-black transition"
              title="Exit Castle"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-pixel uppercase tracking-wider text-[#FBD000] block mb-1">
              🏰 GAME MASTER CASTLE · WORLD SETUP
            </span>
            <h1 className="text-xl sm:text-2xl font-pixel text-white">
              STAGE 1-1 LOBBY
            </h1>
            <p className="text-xs font-arcade text-gray-300 mt-1">
              Official 50-minute match. Have players choose characters and connect with Room Code & PIN.
            </p>
          </div>
        </div>

        {/* Room Code Pill */}
        <div className="flex items-center gap-3 p-3 nes-box bg-[#101014] border-2 border-[#FBD000]">
          <div>
            <span className="text-[9px] uppercase font-pixel text-gray-400 block">WARP CODE</span>
            <span className="font-pixel text-xl font-bold text-[#FBD000]">{state.matchCode}</span>
          </div>
          <button
            onClick={copyCode}
            className="p-2.5 mario-btn-gold text-black transition"
            title="Copy Room Code"
          >
            {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Teams Readiness Strip */}
      <div className="p-6 nes-box bg-[#181820] border-4 border-black space-y-4 shadow-[4px_4px_0px_#000]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-pixel text-white flex items-center gap-2">
            <span>🍄</span> PLAYERS READY ({readyCount} / {state.settings.teamCount})
          </span>

          <div className="flex items-center gap-2">
            {[5, 6].map(count => (
              <button
                key={count}
                onClick={() => updateSettings({ teamCount: count })}
                className={`px-3 py-1.5 nes-box border-2 border-black font-pixel text-[9px] transition ${
                  state.settings.teamCount === count
                    ? 'bg-[#FBD000] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#22222E] text-gray-400 hover:text-white'
                }`}
              >
                {count} PLAYERS
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {state.teams.slice(0, state.settings.teamCount).map(team => (
            <div 
              key={team.id}
              className="p-3 nes-box bg-[#101014] border-2 border-black flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-4 h-4 nes-box border border-black flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <div className="truncate">
                  <strong className="text-white block font-arcade font-bold text-sm truncate">{team.name}</strong>
                  <span className="text-[10px] font-pixel text-gray-400">PIN: {team.pin}</span>
                </div>
              </div>

              <span className="text-[9px] font-pixel text-[#43B047] bg-[#43B047]/20 border border-[#43B047]/40 px-2 py-0.5 rounded">
                READY
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={startMatch}
        className="w-full py-4 mario-btn-green text-black font-pixel text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
      >
        <Play className="w-4 h-4 fill-current" />
        PRESS START ▶ (START 50-MIN MATCH)
      </button>
    </div>
  );
};
