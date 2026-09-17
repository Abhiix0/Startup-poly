import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Play, Copy, Check, ArrowLeft, Radio, Users } from 'lucide-react';
import { TEAM_METAS } from '../../constants/theme';

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
      <div className="p-6 rounded-3xl eqx-card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {onOpenExitConfirm && (
            <button
              onClick={onOpenExitConfirm}
              className="p-2.5 rounded-xl bg-[#141416] hover:bg-[#202024] text-white/60 hover:text-white border border-white/10 transition"
              title="Exit Console"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#33FF67] animate-ping" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7484FE]">
                GAME MASTER CONTROL ROOM · MATCH SETUP
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Stage 1-1 Lobby
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Official 50-minute simulation. Teams connect on mobile devices with Room Code & PIN.
            </p>
          </div>
        </div>

        {/* Room Code Pill */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#141416] border border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/40 block">ROOM CODE</span>
            <span className="font-mono text-xl font-bold text-white tracking-wider">{state.matchCode}</span>
          </div>
          <button
            onClick={copyCode}
            className="p-2.5 rounded-xl bg-[#7484FE] hover:bg-[#8594FE] text-white transition cursor-pointer"
            title="Copy Room Code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Teams Readiness Strip */}
      <div className="p-6 rounded-3xl eqx-card-elevated space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Users className="w-4 h-4 text-[#7484FE]" />
            <span>TEAMS READY ({readyCount} / {state.settings.teamCount})</span>
          </div>

          <div className="flex items-center gap-2">
            {[5, 6].map(count => (
              <button
                key={count}
                onClick={() => updateSettings({ teamCount: count })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  state.settings.teamCount === count
                    ? 'bg-[#7484FE] text-white border-[#7484FE]'
                    : 'bg-[#141416] text-white/50 border-white/5 hover:text-white'
                }`}
              >
                {count} TEAMS
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {state.teams.slice(0, state.settings.teamCount).map(team => {
            const meta = TEAM_METAS[team.number] || TEAM_METAS[1];
            return (
              <div 
                key={team.id}
                className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <div className="truncate">
                    <strong className="text-white block font-bold text-sm truncate">{team.name}</strong>
                    <span className="text-[11px] font-mono text-white/40">PIN: {team.pin}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#33FF67] bg-[#33FF67]/15 border border-[#33FF67]/30 px-2 py-0.5 rounded-full">
                  READY
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={startMatch}
        className="w-full py-4 btn-eqx-green text-black font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <Play className="w-5 h-5 fill-current" />
        START MATCH (START 50-MIN COUNTDOWN)
      </button>
    </div>
  );
};
