import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency, TEAM_METAS } from '../../constants/theme';
import { Users, ArrowLeft, CheckCircle2, Shield, Radio, Sparkles } from 'lucide-react';

interface PlayerWaitingRoomProps {
  team: Team;
  onOpenExitConfirm?: () => void;
}

export const PlayerWaitingRoom: React.FC<PlayerWaitingRoomProps> = ({ team, onOpenExitConfirm }) => {
  const { state } = useGame();
  const readyTeamsCount = state.teams.filter(t => t.membersJoined >= 1).length;
  const teamMeta = TEAM_METAS[team.number] || TEAM_METAS[1];

  const squadMembers = [
    { name: 'Squad Captain (You)', ready: true, isHost: true },
    { name: 'Lead Strategist', ready: true, isHost: false },
    { name: 'Track Token Lead', ready: team.membersJoined >= 3, isHost: false },
    { name: 'Risk Analyst', ready: team.membersJoined >= 4, isHost: false },
    { name: 'Reserve Member', ready: team.membersJoined >= 5, isHost: false },
  ];

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[90vh] flex flex-col justify-between py-2 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2">
        {onOpenExitConfirm ? (
          <button
            onClick={onOpenExitConfirm}
            className="p-2 rounded-xl bg-[#19191C] border border-white/10 text-white hover:bg-[#202024] transition cursor-pointer"
            title="Leave Match"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19191C] border border-white/10 text-xs font-semibold text-white/90">
          <span className="w-2 h-2 rounded-full bg-[#33FF67] animate-ping" />
          <span>MATCH LOBBY</span>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-[#202024] border border-white/10 text-[11px] font-mono text-white/60">
          {state.matchCode}
        </div>
      </div>

      {/* Main Team Card */}
      <div className="eqx-card-elevated p-6 space-y-5 my-2">
        {/* Team Avatar & Name */}
        <div className="text-center space-y-2">
          <div 
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg border"
            style={{ 
              backgroundColor: teamMeta.badgeBg, 
              color: teamMeta.color,
              borderColor: `${teamMeta.color}40`
            }}
          >
            T0{team.number}
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {team.name ? team.name.toUpperCase() : `TEAM 0${team.number}`}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#33FF67]/10 border border-[#33FF67]/30 text-xs text-[#33FF67] font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#33FF67]" />
              <span>{Math.max(2, team.membersJoined)}/5 members connected</span>
            </div>
          </div>
        </div>

        {/* Section: Squad Roster */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40 uppercase tracking-wider font-semibold text-[10px]">
              SQUAD ROSTER
            </span>
            <span className="text-white/60 font-mono">
              ROOM: {state.matchCode}
            </span>
          </div>

          <div className="space-y-1.5">
            {squadMembers.map((member, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                  member.ready
                    ? 'bg-[#141416] border-white/10 text-white'
                    : 'bg-[#141416]/40 border-dashed border-white/5 text-white/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: member.ready ? teamMeta.color : 'rgba(255,255,255,0.2)' }}
                  />
                  <span className={member.ready ? 'font-medium text-white/90' : 'italic'}>
                    {member.name}
                  </span>
                </div>

                {member.ready ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#33FF67]/15 text-[10px] text-[#33FF67] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> READY
                  </span>
                ) : (
                  <span className="text-[10px] text-white/30 font-mono">
                    SLOT 0{idx + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Starting Capital Breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-left">
          <div className="p-3 rounded-xl bg-[#141416] border border-white/5">
            <span className="text-[10px] uppercase text-white/40 block font-medium">STARTING CASH</span>
            <span className="text-base font-bold text-white tracking-tight">{formatCurrency(team.cash)}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141416] border border-white/5">
            <span className="text-[10px] uppercase text-white/40 block font-medium">INITIAL VALUATION</span>
            <span className="text-base font-bold text-[#7484FE] tracking-tight">0 CV</span>
          </div>
        </div>
      </div>

      {/* Waiting Status Card */}
      <div className="eqx-card p-4 text-center space-y-1 my-1">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white/90">
          <Radio className="w-4 h-4 text-[#7484FE] animate-pulse" />
          <span>Waiting for Game Master to launch...</span>
        </div>
        <p className="text-[11px] text-white/50">
          {readyTeamsCount} of {state.settings.teamCount} teams checked in to Room {state.matchCode}
        </p>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
          THE EQUINOX E-SUMMIT 2K26 · STARTUPOLY
        </span>
      </div>
    </div>
  );
};
