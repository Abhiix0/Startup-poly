import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { MatchState, RollAnimationEvent, BoardSpace } from '../../types/game';
import { BOARD_SPACES } from '../../constants/board';
import { TEAM_METAS } from '../../constants/theme';
import { StartupolyBoard } from './StartupolyBoard';
import { Sparkles, Flag, AlertTriangle, Briefcase, Zap, HelpCircle, X } from 'lucide-react';

interface LiveRollBoardModalProps {
  state?: MatchState;
  animationEvent?: RollAnimationEvent | null;
  onDismiss?: () => void;
}

export const LiveRollBoardModal: React.FC<LiveRollBoardModalProps> = ({
  state: propState,
  animationEvent: propAnimationEvent,
  onDismiss: propOnDismiss,
}) => {
  const gameContext = useGame();
  const state = propState || gameContext?.state;
  const animationEvent = propAnimationEvent !== undefined 
    ? propAnimationEvent 
    : (gameContext?.state?.latestRollAnimation || null);
  const onDismiss = propOnDismiss || gameContext?.dismissRollAnimation || (() => {});

  const [currentStepSpace, setCurrentStepSpace] = useState<number | null>(null);
  const [isLanded, setIsLanded] = useState(false);
  const [pulsingStart, setPulsingStart] = useState(false);

  useEffect(() => {
    if (!animationEvent) {
      setCurrentStepSpace(null);
      setIsLanded(false);
      setPulsingStart(false);
      return;
    }

    const { fromSpace, toSpace, roll, passedStart } = animationEvent;
    setIsLanded(false);
    setPulsingStart(false);

    // Sequence the step-by-step movement
    const steps: number[] = [];
    for (let i = 1; i <= roll; i++) {
      steps.push((fromSpace + i) % 24);
    }

    setCurrentStepSpace(fromSpace);

    let stepIndex = 0;
    const stepDuration = 260; // ms per space

    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const nextSpace = steps[stepIndex];
        setCurrentStepSpace(nextSpace);

        // If landing or stepping on START space, pulse it
        if (nextSpace === 0 || (passedStart && stepIndex === (24 - fromSpace))) {
          setPulsingStart(true);
        }

        stepIndex++;
      } else {
        clearInterval(interval);
        setIsLanded(true);

        // Hold landed card for 1.5s, then auto-dismiss
        const closeTimer = setTimeout(() => {
          onDismiss();
        }, 1500);

        return () => clearTimeout(closeTimer);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [animationEvent?.id]);

  if (!animationEvent || !state) return null;

  const team = state.teams[animationEvent.teamIndex] || state.teams[0];
  const meta = TEAM_METAS[team?.number || 1] || TEAM_METAS[1];
  const targetSpace: BoardSpace = BOARD_SPACES[animationEvent.toSpace];
  const biz = targetSpace.businessId !== undefined ? state.businesses.find(b => b.id === targetSpace.businessId) : undefined;
  const bizOwner = biz && biz.owner !== null ? state.teams[biz.owner] : null;

  // Custom clean vector die icon
  const renderDieFace = (val: number) => {
    return (
      <div className="w-10 h-10 rounded-2xl bg-white border border-white/20 text-black font-mono font-black text-lg flex items-center justify-center shadow-lg">
        {val}
      </div>
    );
  };

  const getPublicLandingSnippet = (space: BoardSpace) => {
    switch (space.type) {
      case 'start':
        return { title: 'LAP COMPLETED', subtitle: 'START Lap Reward Claimed (+₹200)', color: 'text-[#33FF67]' };
      case 'bonus':
        return { title: 'BONUS ADVANTAGE CARD', subtitle: 'Movement roll determines milestone reward', color: 'text-[#33FF67]' };
      case 'crisis':
        return { title: 'CRISIS RISK CARD', subtitle: 'Market hazard & penalty applied', color: 'text-[#FF5C7A]' };
      case 'wildcard':
        return { title: 'WILDCARD ARENA CHALLENGE', subtitle: 'Live physical summit challenge', color: 'text-[#B987FF]' };
      case 'action_b':
        return { title: 'PITCH TO INVESTORS', subtitle: '30-second live pitch to Game Master', color: 'text-[#FFBD59]' };
      case 'action_c':
        return { title: 'PRODUCT BUG PENALTY', subtitle: 'Architecture regression (−200 CV)', color: 'text-[#FF5C7A]' };
      case 'action_d':
        return { title: 'TALENT ACQUISITION', subtitle: 'Competitor talent poach (₹100 Cash)', color: 'text-[#7484FE]' };
      case 'business':
      default:
        return {
          title: `LANDED ON ${space.name.toUpperCase()}`,
          subtitle: bizOwner ? `Owned by ${bizOwner.name}` : 'Unowned Enterprise Opportunity',
          color: 'text-white',
        };
    }
  };

  const landingInfo = getPublicLandingSnippet(targetSpace);

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D0F]/90 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="w-full max-w-4xl flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: meta.color }}
          />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block leading-none">
              {team.name} Turn Movement
            </span>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
              Rolled a {animationEvent.roll}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {renderDieFace(animationEvent.roll)}
          <button
            onClick={onDismiss}
            className="p-2 rounded-xl bg-[#202024] border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Track Display */}
      <div className="w-full max-w-4xl my-auto py-2 overflow-y-auto max-h-[68vh]">
        <StartupolyBoard
          mode="animation"
          teams={state.teams}
          businesses={state.businesses}
          activeTeamIndex={animationEvent.teamIndex}
          animatedPawnPosition={currentStepSpace ?? animationEvent.fromSpace}
          targetSpaceIndex={animationEvent.toSpace}
          pulseStart={pulsingStart}
        />
      </div>

      {/* Bottom Public Landing Notification Card */}
      <div className="w-full max-w-md pb-2 safe-bottom">
        <div className="p-4 rounded-2xl eqx-card-elevated border transition-all duration-300 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7484FE] animate-ping" />
            <span className={`text-xs font-bold uppercase tracking-wider ${landingInfo.color}`}>
              {isLanded ? landingInfo.title : `MOVING TO SPACE #${(animationEvent.toSpace + 1).toString().padStart(2, '0')}...`}
            </span>
          </div>
          <p className="text-sm font-semibold text-white/90">
            {isLanded ? landingInfo.subtitle : `${team.name} token travelling on track`}
          </p>
        </div>
      </div>
    </div>
  );
};
