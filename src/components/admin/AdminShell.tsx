import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatTimer, formatCurrency, formatCoins } from '../../constants/theme';
import { AdminWaitingRoom } from './AdminWaitingRoom';
import { AdminTurnController } from './AdminTurnController';
import { AdminResolutionPanel } from './AdminResolutionPanel';
import { AdminTeamsGrid } from './AdminTeamsGrid';
import { AdminTeamDrawer } from './AdminTeamDrawer';
import { AdminBoardMap } from './AdminBoardMap';
import { AdminActivityLog } from './AdminActivityLog';
import { AdminSettingsModal } from './AdminSettingsModal';
import { AdminResultsModal } from './AdminResultsModal';
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
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';

export const AdminShell: React.FC = () => {
  const { state, toggleTimer, endMatch, logout, undoAction, themeMode, toggleThemeMode, soundMuted, toggleSound } = useGame();
  const [activeTab, setActiveTab] = useState<'game' | 'teams' | 'board' | 'activity'>('game');
  const [selectedTeamIdx, setSelectedTeamIdx] = useState<number | null>(null);
  const [showActivityDrawer, setShowActivityDrawer] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState<boolean>(false);

  const isLight = themeMode === 'light';
  const activeTeam = state.teams[state.activeTeamIndex];
  const recentTransactions = state.transactions.slice(-3).reverse();
  const lastTxToUndo = state.transactions.slice().reverse().find(t => t.snapshotBefore);

  return (
    <div className={`w-screen min-h-[100dvh] flex select-none overflow-x-hidden transition-colors ${
      isLight ? 'bg-sky-400/20 text-slate-900' : 'bg-[#101014] text-[#F7F2F6]'
    }`}>
      {/* 1. Left Icon Sidebar (Desktop >= 1024px) */}
      <aside className={`hidden lg:flex w-20 border-r-4 border-black flex-col items-center justify-between py-5 z-30 flex-shrink-0 shadow-[4px_0px_0px_#000] ${
        isLight ? 'bg-white' : 'bg-[#181820]'
      }`}>
        <div className="flex flex-col items-center gap-6">
          {/* Retro Mario Logo Mark */}
          <div className="w-12 h-12 nes-box bg-[#E52521] border-2 border-black flex items-center justify-center font-pixel text-white text-base shadow-[2px_2px_0px_#000]">
            M
          </div>

          {/* Nav Icons */}
          <nav className="flex flex-col gap-3">
            {[
              { id: 'game', label: 'Game', icon: Dices, badge: '🎮' },
              { id: 'teams', label: 'Teams', icon: Users, badge: '🍄' },
              { id: 'board', label: 'Board', icon: Map, badge: '🗺️' },
              { id: 'activity', label: 'Activity', icon: History, badge: '📜' },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-12 h-12 nes-box flex flex-col items-center justify-center transition ${
                    isActive
                      ? 'bg-[#FBD000] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:text-black hover:bg-slate-200 border-2 border-black'
                      : 'bg-[#22222E] text-gray-400 hover:text-white hover:bg-[#2D2D3D] border-2 border-black'
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
            className={`w-10 h-10 nes-box flex items-center justify-center border-2 border-black transition ${
              isLight ? 'bg-slate-100 text-slate-700 hover:text-black' : 'bg-[#22222E] text-gray-400 hover:text-[#FBD000]'
            }`}
            title="Rules & Settings"
          >
            <Shield className="w-5 h-5" />
          </button>

          <span className="text-[9px] font-pixel text-[#E52521] tracking-tighter font-bold">
            {state.matchCode}
          </span>
        </div>
      </aside>

      {/* 2. Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Retro Mario World HUD Top Bar */}
        <header className={`h-16 border-b-4 border-black px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 safe-top shadow-[0px_4px_0px_#000] ${
          isLight ? 'bg-white/95 backdrop-blur-md' : 'bg-[#181820]'
        }`}>
          {/* Left info & Exit button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitConfirm(true)}
              className={`p-2 nes-box hover:bg-[#E52521] hover:text-white border-2 border-black transition ${
                isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#22222E] text-gray-400'
              }`}
              title="Exit Castle"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`font-pixel text-xs tracking-wide ${isLight ? 'text-slate-900' : 'text-[#FBD000]'}`}>
                STARTUPOLY
              </span>
              <span className="text-[10px] font-pixel text-white px-2 py-0.5 nes-box bg-[#E52521] border border-black shadow-[1px_1px_0px_#000]">
                {state.matchCode}
              </span>
            </div>
          </div>

          {/* Center Status HUD */}
          <div className="hidden sm:flex items-center gap-3 font-pixel text-[10px]">
            <span className={`w-2.5 h-2.5 nes-box ${state.timerRunning ? 'bg-[#22C55E] animate-pulse' : 'bg-[#FBD000]'}`} />
            <span className={state.timerRunning ? 'text-[#22C55E]' : 'text-[#EAB308]'}>
              {state.timerRunning ? `WORLD 1-1 · ${activeTeam?.name?.toUpperCase()}'S TURN` : 'PAUSED'}
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 nes-box border-2 border-black text-xs ${
                soundMuted ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
              }`}
              title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleThemeMode}
              className={`p-2 nes-box border-2 border-black text-xs ${
                isLight ? 'bg-amber-100 text-amber-700' : 'bg-indigo-950 text-amber-300'
              }`}
              title={isLight ? 'Switch to Castle Dark Theme' : 'Switch to Overworld Light Theme'}
            >
              {isLight ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 nes-box bg-[#101014] border-2 border-black font-pixel text-[10px] text-[#FBD000] shadow-[2px_2px_0px_#000]">
              ⏱️ {formatTimer(state.secondsRemaining)}
            </div>

            {/* Pause / Resume button */}
            <button
              onClick={toggleTimer}
              className={`px-3 py-1.5 nes-box border-2 border-black font-pixel text-[9px] uppercase tracking-wider transition ${
                state.timerRunning
                  ? isLight
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-[#22222E] hover:bg-[#333344] text-[#FBD000] shadow-[2px_2px_0px_#000]'
                  : 'mario-btn-green text-black shadow-[2px_2px_0px_#000]'
              }`}
            >
              {state.timerRunning ? <><Pause className="w-3 h-3 inline mr-1" /> PAUSE</> : <><Play className="w-3 h-3 inline mr-1 fill-current" /> RESUME</>}
            </button>

            {/* Overflow Control Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 nes-box hover:text-[#E52521] border-2 border-black transition ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#22222E] text-gray-400'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className={`absolute right-0 mt-2 w-56 nes-box border-4 border-black p-2 shadow-[4px_4px_0px_#000] z-50 text-xs font-arcade space-y-1 animate-in fade-in zoom-in-95 ${
                  isLight ? 'bg-white text-slate-900' : 'bg-[#181820] text-white'
                }`}>
                  <button
                    onClick={() => { setShowSettings(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 nes-box bg-slate-100 dark:bg-[#22222E] hover:bg-[#3B82F6] hover:text-white flex items-center gap-2 border border-black"
                  >
                    <Shield className="w-4 h-4 text-[#EAB308]" /> Rules & Settings
                  </button>
                  <button
                    onClick={() => { setShowActivityDrawer(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 nes-box bg-slate-100 dark:bg-[#22222E] hover:bg-[#3B82F6] hover:text-white flex items-center gap-2 border border-black"
                  >
                    <History className="w-4 h-4 text-[#EAB308]" /> Full Activity Log
                  </button>
                  <div className="my-1 border-t-2 border-black" />
                  <button
                    onClick={() => { endMatch(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 nes-box bg-[#E52521] hover:bg-[#FF3333] text-white font-pixel text-[9px] border border-black"
                  >
                    END MATCH (STAGE CLEAR)
                  </button>
                  <button
                    onClick={() => { setShowExitConfirm(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 nes-box bg-slate-100 dark:bg-[#22222E] hover:bg-slate-200 border border-black"
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

                  {/* Clean Teams Strip */}
                  <AdminTeamsGrid onSelectTeam={setSelectedTeamIdx} />

                  {/* Recent Activity Strip with ↶ Undo */}
                  <div className="p-4 nes-box bg-[#181820] border-4 border-black space-y-2.5 shadow-[4px_4px_0px_#000]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-pixel uppercase tracking-wider text-[#FBD000]">
                          📜 QUEST RECAP
                        </span>
                        {lastTxToUndo && (
                          <button
                            onClick={() => setShowUndoConfirm(true)}
                            className="px-2.5 py-1 nes-box bg-[#E52521] hover:bg-[#FF3333] text-white text-[9px] font-pixel flex items-center gap-1 border border-black shadow-[2px_2px_0px_#000] transition"
                            title="Undo last recorded action"
                          >
                            <RotateCcw className="w-3 h-3" /> UNDO LAST
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setShowActivityDrawer(true)}
                        className="text-[10px] font-pixel text-[#5C94FC] hover:text-[#7484FE] flex items-center gap-0.5 transition"
                      >
                        VIEW ALL →
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {recentTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between text-xs py-1.5 px-2 bg-[#22222E] border border-black rounded">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-pixel text-[8px] text-[#8E8E93]">{tx.timeFormatted}</span>
                            <span className="font-arcade font-bold text-[#FBD000]">{tx.teamName}</span>
                            <span className="text-gray-300 font-arcade truncate">{tx.description}</span>
                          </div>
                          {tx.cashDelta !== undefined && (
                            <span className={`font-pixel text-[9px] flex-shrink-0 ${tx.cashDelta >= 0 ? 'text-[#43B047]' : 'text-[#E52521]'}`}>
                              {tx.cashDelta >= 0 ? '+' : ''}{formatCoins(tx.cashDelta)}
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
                <div className="p-6 nes-box bg-[#181820] border-4 border-black shadow-[4px_4px_0px_#000]">
                  <AdminActivityLog />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on screen < 1024px) */}
      <nav className="lg:hidden fixed bottom-3 inset-x-0 flex justify-center z-40 px-4 pointer-events-none">
        <div className="w-full max-w-[370px] h-[64px] bg-[#181820] border-4 border-black rounded-2xl px-3 py-1 shadow-[4px_4px_0px_#000] flex items-center justify-around pointer-events-auto">
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
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#FBD000] text-black font-pixel shadow-[2px_2px_0px_#000]' 
                    : 'text-[#8E8E93] hover:text-[#F7F2F6] font-arcade'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] tracking-tight mt-0.5">
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm nes-box bg-[#181820] border-4 border-black p-6 space-y-4 shadow-[6px_6px_0px_#000] animate-in zoom-in-95">
            <h3 className="text-sm font-pixel text-[#E52521]">
              ⚠️ EXIT CASTLE?
            </h3>
            <p className="text-xs font-arcade text-gray-300 leading-relaxed">
              The match will continue running in real time. You can re-enter this room anytime with the Game Master passcode.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 mario-btn-dark text-white font-pixel text-[9px]"
              >
                CANCEL
              </button>
              <button
                onClick={() => { setShowExitConfirm(false); logout(); }}
                className="py-2.5 mario-btn-red text-white font-pixel text-[9px]"
              >
                EXIT CASTLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Action Confirmation Modal */}
      {showUndoConfirm && lastTxToUndo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm nes-box bg-[#181820] border-4 border-black p-6 space-y-4 shadow-[6px_6px_0px_#000] animate-in zoom-in-95">
            <h3 className="text-sm font-pixel text-[#FBD000]">
              ↶ UNDO LAST MOVE?
            </h3>
            <p className="text-xs font-arcade text-gray-300 leading-relaxed">
              Revert quest action: <strong className="text-white">"{lastTxToUndo.description}"</strong>? Previous board positions, coins, and power-ups will be restored.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="py-2.5 mario-btn-dark text-white font-pixel text-[9px]"
              >
                CANCEL
              </button>
              <button
                onClick={() => { undoAction(); setShowUndoConfirm(false); }}
                className="py-2.5 mario-btn-red text-white font-pixel text-[9px]"
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
