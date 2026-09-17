import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency, MARIO_CHARACTERS } from '../../constants/theme';
import { Users, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PlayerWaitingRoomProps {
  team: Team;
  onOpenExitConfirm?: () => void;
}

export const PlayerWaitingRoom: React.FC<PlayerWaitingRoomProps> = ({ team, onOpenExitConfirm }) => {
  const { state } = useGame();
  const readyTeamsCount = state.teams.filter(t => t.membersJoined >= 1).length;
  const char = MARIO_CHARACTERS[team.number] || MARIO_CHARACTERS[1];

  // Mock sample player squad list for the team room (Screen 2)
  const squadMembers = [
    { name: 'You (Host)', icon: '🍄', ready: true, isHost: true },
    { name: 'Dhiraj', icon: '⭐', ready: true, isHost: false },
    { name: 'Aarav', icon: '🌟', ready: team.membersJoined >= 3, isHost: false },
    { name: 'Waiting for player...', icon: '⏳', ready: false, isHost: false },
    { name: 'Waiting for player...', icon: '⏳', ready: false, isHost: false },
  ];

  return (
    <div className="w-full max-w-[390px] mx-auto min-h-[92vh] flex flex-col justify-between py-2 select-none">
      {/* Top Header with Back Arrow and Warp Pipe */}
      <div className="flex items-center justify-between pb-1">
        {onOpenExitConfirm ? (
          <button
            onClick={onOpenExitConfirm}
            className="p-2 rounded-xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 transition cursor-pointer"
            title="Leave Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-black text-[9px] font-pixel text-black shadow-[2px_2px_0px_#000]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
          <span>WAITING ROOM</span>
        </div>

        {/* Green Warp Pipe Icon */}
        <div className="w-8 h-8 rounded-lg bg-[#22C55E] border-2 border-black flex items-center justify-center font-pixel text-xs text-white shadow-[2px_2px_0px_#000]">
          🏭
        </div>
      </div>

      {/* Main Parchment Team Card (Screen 2) */}
      <div className="mario-card p-5 space-y-4 my-2">
        {/* Team Avatar & Name */}
        <div className="text-center space-y-1">
          <div className="w-16 h-16 mx-auto bg-white border-2 border-black rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000] animate-bounce">
            {char.icon}
          </div>

          <h2 className="font-pixel text-sm text-black pt-1">
            {team.name ? team.name.toUpperCase() : `TEAM 0${team.number}`}
          </h2>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-500 text-[10px] font-arcade text-emerald-800 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{Math.max(2, team.membersJoined)}/5 players joined</span>
          </div>
        </div>

        {/* Section: Team Members List */}
        <div className="space-y-2 pt-1 border-t-2 border-black/10">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] text-slate-700 uppercase">
              TEAM MEMBERS
            </span>
            <span className="font-arcade text-[10px] text-slate-500 font-bold">
              ROOM: {state.matchCode}
            </span>
          </div>

          <div className="space-y-1.5">
            {squadMembers.map((member, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-between text-xs transition ${
                  member.ready
                    ? 'bg-white shadow-[2px_2px_0px_#000]'
                    : 'bg-slate-100/70 border-dashed text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{member.icon}</span>
                  <span className={`font-arcade font-bold ${member.ready ? 'text-black' : 'text-slate-500 italic'}`}>
                    {member.name}
                  </span>
                </div>

                {member.ready ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-[9px] font-pixel text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> READY
                  </span>
                ) : (
                  <span className="font-pixel text-[8px] text-slate-400">
                    SLOT {idx + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Starting Balance Pill */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t-2 border-black/10 text-left">
          <div className="p-2.5 rounded-xl bg-amber-50 border-2 border-black">
            <span className="font-pixel text-[7px] text-amber-800 block mb-0.5">STARTING CASH</span>
            <span className="font-pixel text-xs text-amber-900 font-black">{formatCurrency(team.cash)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 border-2 border-black">
            <span className="font-pixel text-[7px] text-blue-800 block mb-0.5">STAR VALUE</span>
            <span className="font-pixel text-xs text-blue-900 font-black">0 CV</span>
          </div>
        </div>
      </div>

      {/* Wooden Signboard (Screen 2) */}
      <div className="mario-wooden-sign p-3.5 text-center space-y-1 my-1">
        <p className="font-arcade text-xs text-amber-950 font-bold leading-snug">
          Waiting for all teams to join...
        </p>
        <span className="font-pixel text-[8px] text-amber-900/80 block">
          {readyTeamsCount} of {state.settings.teamCount} teams checked in!
        </span>
      </div>

      {/* Overworld Scenery Ground Footer */}
      <div className="w-full mario-ground-footer flex items-center justify-center mt-2">
        <span className="font-pixel text-[7px] text-white tracking-wider drop-shadow-[1px_1px_0px_#000]">
          THE EQUINOX 2K26 · WORLD 1-1
        </span>
      </div>
    </div>
  );
};


