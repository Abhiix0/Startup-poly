import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatTimer, formatCurrency, formatNumber } from '../../constants/theme';
import { AdminWaitingRoom } from './AdminWaitingRoom';
import { AdminTurnController } from './AdminTurnController';
import { AdminResolutionPanel } from './AdminResolutionPanel';
import { AdminTeamsGrid } from './AdminTeamsGrid';
import { AdminTeamDrawer } from './AdminTeamDrawer';
import { AdminBoardMap } from './AdminBoardMap';
import { AdminActivityLog } from './AdminActivityLog';
import { AdminSettingsModal } from './AdminSettingsModal';
import { AdminResultsModal } from './AdminResultsModal';
import { LiveRollBoardModal } from '../common/LiveRollBoardModal';
import { 
  Play, 
  Pause, 
  MoreHorizontal, 
  Dices, 
  Users, 
  Map, 
  History, 
  Shield, 
  RotateCcw,
  ArrowLeft,
  X,
  Radio,
  Clock
} from 'lucide-react';

export const AdminShell: React.FC = () => {
  const { state, toggleTimer, endMatch, logout, undoAction } = useGame();
  const [activeTab, setActiveTab] = useState<'game' | 'teams' | 'board' | 'activity'>('game');
  const [selectedTeamIdx, setSelectedTeamIdx] = useState<number | null>(null);
  const [showActivityDrawer, setShowActivityDrawer] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState<boolean>(false);

  const activeTeam = state.teams[state.activeTeamIndex];
  const recentTransactions = state.transactions.slice(-3).reverse();
  const lastTxToUndo = state.transactions.slice().reverse().find(t => t.snapshotBefore);

  return (
    <div className="w-screen min-h-[100dvh] bg-[#0D0D0F] text-[#F7F2F6] flex select-none overflow-x-hidden">
      {/* Realtime Synchronized Roll Board Animation Overlay for GM */}
      <LiveRollBoardModal />

      {/* 1. Left Icon Sidebar (Desktop >= 1024px) */}
      <aside className="hidden lg:flex w-20 bg-[#141416] border-r border-white/10 flex-col items-center justify-between py-6 z-30 flex-shrink-0">
        <div className="flex flex-col items-center gap-6">
          {/* Logo Mark */}
          <div className="w-10 h-10 rounded-2xl bg-[#7484FE] flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-[#7484FE]/25">
            S
          </div>

          {/* Nav Icons */}
          <nav className="flex flex-col gap-2.5">
            {[
              { id: 'game', label: 'Game Deck', icon: Dices },
              { id: 'teams', label: 'Teams', icon: Users },
              { id: 'board', label: 'Track Map', icon: Map },
              { id: 'activity', label: 'Activity', icon: History },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer ${
                    isActive
                      ? 'bg-[#7484FE] text-white shadow-lg shadow-[#7484FE]/30'
                      : 'bg-[#19191C] text-white/50 hover:text-white hover:bg-[#202024] border border-white/5'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Info */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-xl bg-[#19191C] hover:bg-[#202024] text-white/50 hover:text-white border border-white/5 flex items-center justify-center transition cursor-pointer"
            title="Rules & Settings"
          >
            <Shield className="w-4 h-4" />
          </button>

          <span className="text-[10px] font-mono text-white/40 font-semibold tracking-tight">
            {state.matchCode}
          </span>
        </div>
      </aside>

      {/* 2. Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#141416]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 safe-top">
          {/* Left: Info & Exit Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-xl bg-[#19191C] hover:bg-[#202024] text-white/60 hover:text-white border border-white/10 transition cursor-pointer"
              title="Exit Console"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-white">
                STARTUPOLY
              </span>
              <span className="text-[10px] font-mono text-white/70 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                {state.matchCode}
              </span>
            </div>
          </div>

          {/* Center Status HUD */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${state.timerRunning ? 'bg-[#33FF67] animate-pulse' : 'bg-[#FFBD59]'}`} />
            <span className={state.timerRunning ? 'text-[#33FF67] font-semibold' : 'text-[#FFBD59] font-medium'}>
              {state.timerRunning ? `LIVE MATCH · ${activeTeam?.name?.toUpperCase()}'S TURN` : 'MATCH PAUSED'}
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#19191C] border border-white/10 font-mono text-xs text-white font-bold">
              <Clock className="w-3.5 h-3.5 text-[#7484FE]" />
              <span>{formatTimer(state.secondsRemaining)}</span>
            </div>

            {/* Pause / Resume Button */}
            <button
              onClick={toggleTimer}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer border ${
                state.timerRunning
                  ? 'bg-[#19191C] hover:bg-[#202024] text-white/80 border-white/10'
                  : 'btn-eqx-green text-black'
              }`}
            >
              {state.timerRunning ? (
                <><Pause className="w-3.5 h-3.5 inline mr-1" /> PAUSE</>
              ) : (
                <><Play className="w-3.5 h-3.5 inline mr-1 fill-current" /> RESUME</>
              )}
            </button>

            {/* Overflow Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl bg-[#19191C] hover:bg-[#202024] text-white/60 hover:text-white border border-white/10 transition cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 eqx-card-elevated p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => { setShowSettings(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex items-center gap-2 text-white/80 hover:text-white transition"
                  >
                    <Shield className="w-4 h-4 text-[#7484FE]" /> Rules & Settings
                  </button>
                  <button
                    onClick={() => { setShowActivityDrawer(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex items-center gap-2 text-white/80 hover:text-white transition"
                  >
                    <History className="w-4 h-4 text-[#7484FE]" /> Full Activity Log
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => { endMatch(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#FF5C7A]/15 hover:bg-[#FF5C7A]/25 text-[#FF5C7A] font-semibold"
                  >
                    CONCLUDE MATCH (FINAL RESULTS)
                  </button>
                  <button
                    onClick={() => { setShowExitConfirm(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition"
                  >
                    Exit Control Room
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto pb-24 lg:pb-8 overflow-y-auto">
          {state.status === 'setup' || state.status === 'waiting' ? (
            <AdminWaitingRoom onOpenExitConfirm={() => setShowExitConfirm(true)} />
          ) : (
            <>
              {activeTab === 'game' && (
                <div className="space-y-6">
                  {/* Hero Current Turn Controller */}
                  <AdminTurnController />

                  {/* Contextual Landing Resolution Panel */}
                  <AdminResolutionPanel />

                  {/* Clean Teams Grid Strip */}
                  <AdminTeamsGrid onSelectTeam={setSelectedTeamIdx} />

                  {/* Recent Activity Strip with Undo */}
                  <div className="p-5 rounded-3xl eqx-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
                          RECENT MATCH EVENTS
                        </span>
                        {lastTxToUndo && (
                          <button
                            onClick={() => setShowUndoConfirm(true)}
                            className="px-3 py-1 rounded-xl bg-[#FF5C7A]/15 hover:bg-[#FF5C7A]/25 text-[#FF5C7A] text-[11px] font-semibold flex items-center gap-1 border border-[#FF5C7A]/30 transition cursor-pointer"
                            title="Undo last recorded action"
                          >
                            <RotateCcw className="w-3 h-3" /> UNDO LAST
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setShowActivityDrawer(true)}
                        className="text-xs font-semibold text-[#7484FE] hover:text-[#8594FE] flex items-center gap-0.5 transition cursor-pointer"
                      >
                        VIEW FULL LOG →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {recentTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between text-xs py-2 px-3 bg-[#141416] border border-white/5 rounded-xl">
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="font-mono text-[10px] text-white/40">{tx.timeFormatted}</span>
                            <span className="font-bold text-white">{tx.teamName}</span>
                            <span className="text-white/60 truncate">{tx.description}</span>
                          </div>
                          {tx.cashDelta !== undefined && (
                            <span className={`font-mono text-xs font-bold flex-shrink-0 ${tx.cashDelta >= 0 ? 'text-[#33FF67]' : 'text-[#FF5C7A]'}`}>
                              {tx.cashDelta >= 0 ? '+' : ''}{formatCurrency(tx.cashDelta)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'teams' && (
                <div className="space-y-4">
                  <AdminTeamsGrid onSelectTeam={setSelectedTeamIdx} />
                </div>
              )}

              {activeTab === 'board' && (
                <div className="space-y-4">
                  <AdminBoardMap />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="p-6 rounded-3xl eqx-card">
                  <AdminActivityLog />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on screen < 1024px) */}
      <nav className="lg:hidden fixed bottom-3 inset-x-0 flex justify-center z-40 px-4 pointer-events-none">
        <div className="w-full max-w-[390px] h-[64px] bg-[#141416]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-1 shadow-2xl flex items-center justify-around pointer-events-auto">
          {[
            { id: 'game', label: 'Game', icon: Dices },
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'board', label: 'Board', icon: Map },
            { id: 'activity', label: 'Activity', icon: History },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  isActive 
                    ? 'text-[#7484FE] font-bold' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Right-Side Team Control Sheet Drawer */}
      <AdminTeamDrawer 
        teamIndex={selectedTeamIdx} 
        onClose={() => setSelectedTeamIdx(null)} 
      />

      {/* Right-Side Activity Log Drawer */}
      {showActivityDrawer && (
        <AdminActivityLog 
          isDrawer 
          onClose={() => setShowActivityDrawer(false)} 
        />
      )}

      {/* Settings Modal */}
      <AdminSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Results & Reset Modal */}
      <AdminResultsModal 
        isOpen={showResults || state.status === 'finished'} 
        onClose={() => setShowResults(false)} 
      />

      {/* Exit Castle Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm eqx-card-elevated p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              Exit Control Console?
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              The live match will continue running in real time. You can re-enter this console room at any time with the Game Master passcode.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="btn-eqx-secondary py-2.5 text-xs font-semibold"
              >
                CANCEL
              </button>
              <button
                onClick={() => { setShowExitConfirm(false); logout(); }}
                className="btn-eqx-danger py-2.5 text-xs font-semibold"
              >
                EXIT CONSOLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Action Confirmation Modal */}
      {showUndoConfirm && lastTxToUndo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm eqx-card-elevated p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              Revert Last Match Move?
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Revert action: <strong className="text-white">"{lastTxToUndo.description}"</strong>? Previous board positions, cash balances, and enterprise levels will be restored.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="btn-eqx-secondary py-2.5 text-xs font-semibold"
              >
                CANCEL
              </button>
              <button
                onClick={() => { undoAction(); setShowUndoConfirm(false); }}
                className="btn-eqx-danger py-2.5 text-xs font-semibold"
              >
                CONFIRM UNDO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
