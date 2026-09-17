import React from 'react';
import { useGame } from '../../context/GameContext';
import { BoardSpace, Business, Team } from '../../types/game';
import { BOARD_SPACES } from '../../constants/board';
import { TEAM_METAS, formatCurrency } from '../../constants/theme';
import { Sparkles, AlertCircle, Award, Zap, HelpCircle, Briefcase, Flag } from 'lucide-react';

interface StartupolyBoardProps {
  mode?: 'animation' | 'player' | 'admin';
  teams?: Team[];
  businesses?: Business[];
  activeTeamIndex?: number;
  activeTeamNumber?: number;
  animatedPawnPosition?: number; // current space index the animated pawn is on
  targetSpaceIndex?: number;
  pulseStart?: boolean;
  selectedSpaceIndex?: number | null;
  onSelectSpace?: (spaceIndex: number) => void;
  onSpaceClick?: (spaceIndex: number) => void;
  className?: string;
}

export const StartupolyBoard: React.FC<StartupolyBoardProps> = ({
  mode = 'player',
  teams: propTeams,
  businesses: propBusinesses,
  activeTeamIndex,
  activeTeamNumber,
  animatedPawnPosition,
  targetSpaceIndex,
  pulseStart = false,
  selectedSpaceIndex,
  onSelectSpace,
  onSpaceClick,
  className = '',
}) => {
  const gameContext = useGame();
  const teams = propTeams || gameContext?.state?.teams || [];
  const businesses = propBusinesses || gameContext?.state?.businesses || [];

  const getSpaceTypeBadge = (space: BoardSpace) => {
    switch (space.type) {
      case 'start':
        return { label: 'START', bg: 'bg-[#33FF67]/20 text-[#33FF67] border-[#33FF67]/40', icon: Flag };
      case 'bonus':
        return { label: 'BONUS', bg: 'bg-[#7484FE]/20 text-[#7484FE] border-[#7484FE]/40', icon: Sparkles };
      case 'crisis':
        return { label: 'CRISIS', bg: 'bg-[#FF5C7A]/20 text-[#FF5C7A] border-[#FF5C7A]/40', icon: AlertCircle };
      case 'wildcard':
        return { label: 'WILD', bg: 'bg-[#FFBD59]/20 text-[#FFBD59] border-[#FFBD59]/40', icon: HelpCircle };
      case 'action_b':
        return { label: 'PITCH', bg: 'bg-[#B987FF]/20 text-[#B987FF] border-[#B987FF]/40', icon: Award };
      case 'action_c':
        return { label: 'ACTION', bg: 'bg-[#FF5C7A]/15 text-[#FF5C7A] border-[#FF5C7A]/30', icon: Zap };
      case 'action_d':
        return { label: 'POACH', bg: 'bg-[#58D6E8]/20 text-[#58D6E8] border-[#58D6E8]/40', icon: Zap };
      case 'business':
      default:
        return { label: 'BIZ', bg: 'bg-white/10 text-white/80 border-white/15', icon: Briefcase };
    }
  };

  const handleClick = (spaceIdx: number) => {
    if (onSelectSpace) onSelectSpace(spaceIdx);
    if (onSpaceClick) onSpaceClick(spaceIdx);
  };

  return (
    <div className={`w-full select-none ${className}`}>
      {/* 24 Space Track Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {BOARD_SPACES.map((space) => {
          const spaceNumber = space.index + 1;
          const typeBadge = getSpaceTypeBadge(space);
          const Icon = typeBadge.icon;

          // Find business if applicable
          const biz = space.businessId !== undefined ? businesses.find(b => b.id === space.businessId) : undefined;
          const ownerTeam = biz && biz.owner !== null ? teams[biz.owner] : null;

          // Determine which teams occupy this space
          const occupyingTeams = teams.filter(t => !t.isBankrupt && t.position === space.index);

          // Animation states
          const isPawnHere = animatedPawnPosition !== undefined && animatedPawnPosition === space.index;
          const isTargetSpace = targetSpaceIndex !== undefined && targetSpaceIndex === space.index;
          const isSelected = selectedSpaceIndex === space.index;
          const isStartPulse = space.index === 0 && pulseStart;

          // Active halo for active team
          const isPlayerTeamHere = activeTeamNumber !== undefined && occupyingTeams.some(t => t.number === activeTeamNumber);

          return (
            <div
              key={space.index}
              onClick={() => handleClick(space.index)}
              className={`relative p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[105px] cursor-pointer ${
                isPawnHere
                  ? 'bg-[#7484FE]/20 border-[#7484FE] shadow-lg shadow-[#7484FE]/30 scale-[1.02] ring-2 ring-[#7484FE]'
                  : isTargetSpace
                  ? 'bg-[#33FF67]/15 border-[#33FF67] shadow-md ring-1 ring-[#33FF67]'
                  : isStartPulse
                  ? 'bg-[#33FF67]/30 border-[#33FF67] shadow-xl animate-pulse ring-2 ring-[#33FF67]'
                  : isPlayerTeamHere
                  ? 'bg-[#202024] border-[#7484FE]/60 ring-1 ring-[#7484FE]/40'
                  : isSelected
                  ? 'bg-[#202024] border-white/40'
                  : 'bg-[#141416] border-white/5 hover:border-white/15'
              }`}
            >
              {/* Space Top Bar: Number & Type Badge */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono font-bold text-white/50 leading-none">
                  #{spaceNumber.toString().padStart(2, '0')}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 leading-none ${typeBadge.bg}`}>
                  <Icon className="w-2.5 h-2.5" />
                  <span>{typeBadge.label}</span>
                </span>
              </div>

              {/* Space Name */}
              <div className="my-1">
                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                  {space.name}
                </h4>
                {biz && (
                  <span className="text-[10px] font-medium text-white/50 block mt-0.5 truncate">
                    {ownerTeam ? `Owner: ${ownerTeam.name}` : formatCurrency(biz.cost)}
                  </span>
                )}
              </div>

              {/* Space Bottom: Team Pawns Cluster */}
              <div className="flex items-center gap-1.5 flex-wrap min-h-[18px] pt-1.5 border-t border-white/5">
                {occupyingTeams.map((t) => {
                  const meta = TEAM_METAS[t.number] || TEAM_METAS[1];
                  const isTurn = activeTeamIndex !== undefined && t.number - 1 === activeTeamIndex;
                  return (
                    <div
                      key={t.id}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-black shadow-sm transition-transform ${
                        isTurn ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: meta.color }}
                      title={`${t.name} (Space #${spaceNumber})`}
                    >
                      {t.number}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
