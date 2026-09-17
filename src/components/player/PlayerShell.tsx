import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TEAM_METAS, formatTimer } from '../../constants/theme';
import { PlayerHome } from './PlayerHome';
import { PlayerPortfolio } from './PlayerPortfolio';
import { PlayerActivity } from './PlayerActivity';
import { PlayerRules } from './PlayerRules';
import { PlayerWaitingRoom } from './PlayerWaitingRoom';
import { PlayerForcedSaleModal } from './PlayerForcedSaleModal';
import { PlayerWinnerScreen } from './PlayerWinnerScreen';
import { StartupolyBoard } from '../common/StartupolyBoard';
import { LiveRollBoardModal } from '../common/LiveRollBoardModal';
import { Home, Briefcase, Map, Activity, BookOpen, LogOut, X, Wifi, AlertTriangle } from 'lucide-react';

export const PlayerShell: React.FC = () => {
  const { state, session, logout, isConnected, dismissRollAnimation } = useGame();
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'board' | 'activity' | 'rules'>('home');
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const teamNumber = session.teamNumber || 1;
  const team = state.teams.find(t => t.number === teamNumber) || state.teams[0];
  const meta = TEAM_METAS[team?.number || 1] || TEAM_METAS[1];

  if (!team) return null;

  return (
    <div className="w-screen min-h-[100dvh] bg-[#0D0D0F] text-[#F7F2F6] flex flex-col items-center justify-start select-none">
      {/* 390px-430px Mobile Viewport Container */}
      <div className="w-full max-w-[430px] min-h-[100dvh] flex flex-col relative px-4 pt-2 pb-24 safe-top">
        {/* Top Header Bar */}
        {state.status !== 'setup' && state.status !== 'waiting' && state.status !== 'finished' && !team.isBankrupt && (
          <header className="flex items-center justify-between py-2 border-b border-white/5 mb-3">
            {/* Left: Exit button & Team identification */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowExitConfirm(true)}
                className="p-1.5 rounded-xl bg-[#19191C] border border-white/8 text-white/70 hover:text-white transition cursor-pointer"
                title="Leave match"
              >
                <LogOut className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: meta.color }}
                />
                <div>
                  <span className="text-xs font-bold text-white block leading-none">
                    {team.name}
                  </span>
                  <span className="text-[10px] text-white/50 tracking-wider">
                    EQUINOX 2K26
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Live Connection & Timer */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#19191C] border border-white/8 text-[10px] font-bold text-white/80">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#33FF67] animate-pulse' : 'bg-[#FF5C7A]'}`} />
                <span>{isConnected ? 'LIVE' : 'SYNCING'}</span>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-[#202024] border border-white/10 text-xs font-mono font-bold text-[#7484FE]">
                {formatTimer(state.secondsRemaining)}
              </div>
            </div>
          </header>
        )}

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto">
          {state.status === 'setup' || state.status === 'waiting' ? (
            <PlayerWaitingRoom team={team} onOpenExitConfirm={() => setShowExitConfirm(true)} />
          ) : state.status === 'finished' ? (
            <PlayerWinnerScreen team={team} onOpenExitConfirm={() => setShowExitConfirm(true)} />
          ) : team.isBankrupt ? (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#FF5C7A]/20 border border-[#FF5C7A]/40 text-[#FF5C7A] flex items-center justify-center text-3xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#FF5C7A]">
                BANKRUPTCY DECLARED
              </h2>
              <p className="text-sm text-white/70 max-w-xs leading-relaxed">
                Your startup ran out of runway. All enterprises have been liquidated and returned to the ecosystem.
              </p>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="px-6 py-3 btn-eqx-secondary text-xs transition cursor-pointer"
              >
                EXIT CONSOLE
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <PlayerHome 
                  team={team} 
                  onNavigateTab={setActiveTab} 
                  onOpenExitConfirm={() => setShowExitConfirm(true)} 
                />
              )}
              {activeTab === 'portfolio' && <PlayerPortfolio team={team} />}
              {activeTab === 'board' && (
                <div className="space-y-3 pb-24">
                  <div className="flex items-center justify-between pt-1">
                    <h2 className="text-base font-bold text-white">Live Board Track</h2>
                    <span className="text-xs text-white/50">Space {team.position + 1} of 24</span>
                  </div>
                  <StartupolyBoard
                    mode="player"
                    teams={state.teams}
                    businesses={state.businesses}
                    activeTeamIndex={state.activeTeamIndex}
                  />
                </div>
              )}
              {activeTab === 'activity' && <PlayerActivity team={team} />}
              {activeTab === 'rules' && <PlayerRules />}
            </>
          )}
        </main>

        {/* Realtime Live Board Roll Modal Overlay */}
        <LiveRollBoardModal
          state={state}
          animationEvent={state.latestRollAnimation || null}
          onDismiss={dismissRollAnimation}
        />

        {/* Forced Sale Emergency Overlay */}
        <PlayerForcedSaleModal team={team} />

        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-[400px] eqx-card-elevated p-6 space-y-4 rounded-t-3xl sm:rounded-3xl border border-white/10 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#FF5C7A]">
                  Leave match?
                </h3>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="p-1 rounded-lg bg-[#19191C] text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                You will leave {team.name}'s console. Your team's match progress and balances will remain safely active on the live board.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="py-3 btn-eqx-secondary text-xs"
                >
                  Stay in Game
                </button>
                <button
                  onClick={() => { setShowExitConfirm(false); logout(); }}
                  className="py-3 btn-eqx-danger text-xs uppercase tracking-wider"
                >
                  Exit Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Floating Equinox Navigation Bar */}
        {state.status !== 'setup' && state.status !== 'waiting' && state.status !== 'finished' && !team.isBankrupt && (
          <div className="fixed bottom-3 inset-x-0 flex justify-center z-40 px-4 pointer-events-none">
            <nav className="w-full max-w-[400px] h-[64px] eqx-glass-elevated rounded-2xl px-2 py-1 shadow-2xl flex items-center justify-around pointer-events-auto">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
                { id: 'board', label: 'Board', icon: Map },
                { id: 'activity', label: 'Activity', icon: Activity },
                { id: 'rules', label: 'Rules', icon: BookOpen },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#7484FE]/20 text-[#7484FE] font-bold' 
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-0.5" />
                    <span className="text-[11px] font-medium tracking-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};



