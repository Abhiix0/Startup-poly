import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Team, Business } from '../../types/game';
import { formatCurrency, formatNumber, TEAM_METAS } from '../../constants/theme';
import { BOARD_SPACES } from '../../constants/board';
import { calculateRentAndOwnerCv, getUpgradeCost } from '../../engine/gameEngine';
import { ChevronRight, MapPin, X, ArrowUpRight, Award, Briefcase, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface PlayerHomeProps {
  team: Team;
  onNavigateTab: (tab: 'home' | 'portfolio' | 'board' | 'activity' | 'rules') => void;
  onOpenExitConfirm?: () => void;
}

export const PlayerHome: React.FC<PlayerHomeProps> = ({ team, onNavigateTab }) => {
  const { state } = useGame();
  const [showSpaceModal, setShowSpaceModal] = useState(false);

  const isMyTurn = state.activeTeamIndex === team.number - 1;
  const activeTeam = state.teams[state.activeTeamIndex] || state.teams[0];
  const activeMeta = TEAM_METAS[activeTeam?.number || 1] || TEAM_METAS[1];
  const pendingLanding = state.pendingLanding;
  const isMyLanding = pendingLanding && pendingLanding.teamIndex === team.number - 1;

  const myBusinesses = state.businesses.filter(b => b.owner === team.number - 1);
  const currentSpace = BOARD_SPACES[team.position];

  return (
    <div className="flex flex-col space-y-3.5 pb-24 select-none">
      {/* 1. Main Turn Card (Live Tournament State) */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${
        isMyTurn
          ? 'bg-gradient-to-br from-[#7484FE]/20 via-[#19191C] to-[#33FF67]/15 border-[#7484FE] shadow-[0_0_24px_rgba(116,132,254,0.25)]'
          : 'bg-[#19191C] border-white/8'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'animate-ping' : ''}`}
              style={{ backgroundColor: isMyTurn ? '#33FF67' : activeMeta.color }}
            />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {isMyTurn ? 'YOUR TURN' : `${activeTeam.name.toUpperCase()}'S TURN`}
            </span>
          </div>

          <button
            onClick={() => setShowSpaceModal(true)}
            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#202024] border border-white/10 text-white/80 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3 h-3 text-[#7484FE]" />
            <span>Space {(team.position + 1).toString().padStart(2, '0')}</span>
          </button>
        </div>

        {/* Turn Description Body */}
        {isMyTurn ? (
          <div>
            {isMyLanding ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Rolled {pendingLanding.roll}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#33FF67]/20 text-[#33FF67] font-bold">
                    Landed on {BOARD_SPACES[pendingLanding.spaceIndex].name}
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Game Master is resolving the physical board action.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-[#F7F2F6]">
                  Roll the physical die
                </h3>
                <p className="text-xs text-white/60">
                  Roll the big physical die on the live track to move your token.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#F7F2F6]">
              {activeTeam.name} is on the physical board
            </h3>
            <p className="text-xs text-white/60">
              Watch the physical track. Prepare your financial strategy.
            </p>
          </div>
        )}
      </div>

      {/* 2. Hero Metrics: Cash & Company Value (32-40px numbers) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cash Card */}
        <div className="p-4 rounded-2xl eqx-card flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white/50">
            Cash
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#F7F2F6] tracking-tight mt-2">
            {formatCurrency(team.cash)}
          </div>
          <span className="text-[10px] text-white/40 mt-1 block">
            Available runway
          </span>
        </div>

        {/* Company Value Card */}
        <div className="p-4 rounded-2xl eqx-card flex flex-col justify-between border-l-2 border-l-[#7484FE]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7484FE]">
            Company Value
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#7484FE] tracking-tight mt-2">
            {formatNumber(team.cv)} <span className="text-sm font-bold text-white/50">CV</span>
          </div>
          <span className="text-[10px] text-white/40 mt-1 block">
            Tournament valuation
          </span>
        </div>
      </div>

      {/* 3. Portfolio Summary Section */}
      <div className="p-4 rounded-2xl eqx-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#7484FE]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Portfolio
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('portfolio')}
            className="text-xs font-bold text-[#7484FE] hover:text-[#8A98FF] flex items-center gap-1 cursor-pointer"
          >
            <span>{myBusinesses.length} / 3</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {myBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {myBusinesses.map(biz => {
              const { rent } = calculateRentAndOwnerCv(biz);
              const tierName = biz.level === 0 ? 'Base' : biz.level === 1 ? 'U1' : 'U2';
              return (
                <div
                  key={biz.id}
                  className="p-3 rounded-xl bg-[#202024] border border-white/8 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {biz.name} <span className="text-xs font-normal text-white/50">· {tierName}</span>
                    </h4>
                    <span className="text-xs text-[#33FF67] font-semibold">
                      Toll: {formatCurrency(rent)}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-1 rounded bg-white/5 text-white/80 border border-white/10">
                    +{biz.baseCv} CV
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-white/50 py-1">
            No enterprises acquired yet. Land on business spaces to buy up to 3 companies.
          </p>
        )}
      </div>

      {/* 4. Latest Event Feed */}
      <div className="p-4 rounded-2xl eqx-card space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
            LATEST ACTION
          </span>
          {team.lastEvent && (
            <span className="text-[10px] text-white/40">
              {team.lastEvent.timestamp}
            </span>
          )}
        </div>

        {team.lastEvent ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-white leading-snug">
              {team.lastEvent.text}
            </p>
            <div className="text-right flex-shrink-0">
              {team.lastEvent.amountCash !== undefined && (
                <span className={`text-sm font-black block ${
                  team.lastEvent.amountCash >= 0 ? 'text-[#33FF67]' : 'text-[#FF5C7A]'
                }`}>
                  {team.lastEvent.amountCash >= 0 ? '+' : ''}{formatCurrency(team.lastEvent.amountCash)}
                </span>
              )}
              {team.lastEvent.amountCv !== undefined && (
                <span className={`text-xs font-bold block ${
                  team.lastEvent.amountCv >= 0 ? 'text-[#7484FE]' : 'text-[#FF5C7A]'
                }`}>
                  {team.lastEvent.amountCv >= 0 ? '+' : ''}+{team.lastEvent.amountCv} CV
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/50">
            Match started. Waiting for first physical board move.
          </p>
        )}
      </div>

      {/* 5. Board Space Rules Shortcut */}
      <div 
        onClick={() => setShowSpaceModal(true)}
        className="p-3.5 rounded-xl eqx-card-elevated border border-white/8 flex items-center justify-between cursor-pointer hover:border-white/20 transition"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#7484FE]" />
          <span className="text-xs font-bold text-white">
            Space {(team.position + 1).toString().padStart(2, '0')} · {currentSpace.name}
          </span>
        </div>
        <span className="text-xs font-bold text-[#7484FE] flex items-center gap-0.5">
          Rules <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Space Modal Drawer */}
      {showSpaceModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center p-0">
          <div className="w-full max-w-[430px] eqx-card-elevated p-6 space-y-4 rounded-t-3xl border border-white/12 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-[#7484FE]/20 text-[#7484FE] font-mono font-bold text-xs border border-[#7484FE]/40">
                  {(team.position + 1).toString().padStart(2, '0')}
                </span>
                <h3 className="text-base font-bold text-white">
                  {currentSpace.name}
                </h3>
              </div>
              <button 
                onClick={() => setShowSpaceModal(false)}
                className="p-1.5 rounded-lg bg-[#202024] text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-medium">
              {currentSpace.description}
            </p>

            <button
              onClick={() => setShowSpaceModal(false)}
              className="w-full py-3.5 btn-eqx-primary text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



