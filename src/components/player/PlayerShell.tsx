import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { MARIO_CHARACTERS } from '../../constants/theme';
import { PlayerHome } from './PlayerHome';
import { PlayerPortfolio } from './PlayerPortfolio';
import { PlayerActivity } from './PlayerActivity';
import { PlayerRules } from './PlayerRules';
import { PlayerWaitingRoom } from './PlayerWaitingRoom';
import { PlayerForcedSaleModal } from './PlayerForcedSaleModal';
import { PlayerWinnerScreen } from './PlayerWinnerScreen';
import { Home, Star, BookOpen, Activity, X } from 'lucide-react';

export const PlayerShell: React.FC = () => {
  const { state, session, logout, themeMode } = useGame();
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'activity' | 'rules'>('home');
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const teamNumber = session.teamNumber || 1;
  const team = state.teams.find(t => t.number === teamNumber) || state.teams[0];
  const isLight = themeMode === 'light';

  if (!team) return null;

  return (
    <div className={`w-screen min-h-[100dvh] flex flex-col items-center justify-start select-none transition-colors ${
      isLight ? 'bg-[#3B82F6] text-black' : 'bg-[#101014] text-[#FDF6E2]'
    }`}>
      {/* 390px Mobile Viewport Container */}
      <div className="w-full max-w-[390px] min-h-[100dvh] flex flex-col relative px-3.5 pt-2 pb-24 safe-top">
        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto">
          {state.status === 'setup' || state.status === 'waiting' ? (
            <PlayerWaitingRoom team={team} onOpenExitConfirm={() => setShowExitConfirm(true)} />
          ) : state.status === 'finished' ? (
            <PlayerWinnerScreen team={team} onOpenExitConfirm={() => setShowExitConfirm(true)} />
          ) : team.isBankrupt ? (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 mario-card bg-[#E52521] text-white flex items-center justify-center text-3xl">
                💀
              </div>
              <h2 className="font-pixel text-base text-[#E52521]">
                GAME OVER!
              </h2>
              <span className="px-3 py-1 mario-card bg-[#E52521] text-[9px] font-pixel text-white uppercase">
                BANKRUPT & OUT OF LIVES
              </span>
              <p className="font-arcade text-xs max-w-xs leading-relaxed font-bold text-slate-800">
                Your startup ran out of runway. All warp pipes and businesses have been liquidated!
              </p>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="px-6 py-3 btn-mario-brick font-pixel text-xs transition cursor-pointer"
              >
                EXIT ARENA
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
              {activeTab === 'activity' && <PlayerActivity team={team} />}
              {activeTab === 'rules' && <PlayerRules />}
            </>
          )}
        </main>

        {/* Forced Sale Emergency Overlay */}
        <PlayerForcedSaleModal team={team} />

        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end justify-center p-0">
            <div className="w-full max-w-[390px] mario-card rounded-t-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-sm text-[#E52521]">
                  LEAVE STAGE?
                </h3>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="p-1 bg-white border-2 border-black rounded-lg text-black shadow-[2px_2px_0px_#000]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="font-arcade text-xs leading-relaxed font-bold text-slate-800">
                You will leave {team.name}'s console. Your team's coins and star points will <strong>NOT</strong> be deleted.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="py-3 bg-white border-2 border-black rounded-xl font-pixel text-xs text-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  STAY
                </button>
                <button
                  onClick={() => { setShowExitConfirm(false); logout(); }}
                  className="py-3 bg-[#E52521] border-2 border-black rounded-xl font-pixel text-xs text-white shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  EXIT MATCH
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Retro Mario Floating Translucent Bottom Navigation (~64px height, Screen 3) */}
        {state.status !== 'setup' && state.status !== 'waiting' && state.status !== 'finished' && !team.isBankrupt && (
          <div className="fixed bottom-3 inset-x-0 flex justify-center z-40 px-4 pointer-events-none">
            <nav className="w-full max-w-[370px] h-[64px] bg-white/95 backdrop-blur-xl border-3 border-black rounded-2xl px-2 py-1 shadow-[4px_4px_0px_#000] flex items-center justify-around pointer-events-auto">
              {[
                { id: 'home', label: 'HOME', charIcon: '🍄' },
                { id: 'portfolio', label: 'PORTFOLIO', charIcon: '⭐' },
                { id: 'rules', label: 'RULES', charIcon: '📖' },
                { id: 'activity', label: 'ACTIVITY', charIcon: '⚙️' },
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#FBD000] text-black border-2 border-black shadow-[2px_2px_0px_#000]' 
                        : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    <span className="text-base leading-none mb-0.5">{item.charIcon}</span>
                    <span className={`text-[8px] font-pixel tracking-tighter ${isActive ? 'font-black' : ''}`}>
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


