import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AdminShell } from '../admin/AdminShell';
import { PlayerHome } from '../player/PlayerHome';
import { PlayerPortfolio } from '../player/PlayerPortfolio';
import { PlayerActivity } from '../player/PlayerActivity';
import { PlayerRules } from '../player/PlayerRules';
import { PlayerWaitingRoom } from '../player/PlayerWaitingRoom';
import { PlayerWinnerScreen } from '../player/PlayerWinnerScreen';
import { PlayerForcedSaleModal } from '../player/PlayerForcedSaleModal';
import { LiveRollBoardModal } from '../common/LiveRollBoardModal';
import { StartupolyBoard } from '../common/StartupolyBoard';
import { Smartphone, ArrowLeft, Radio } from 'lucide-react';
import { formatTimer, TEAM_METAS } from '../../constants/theme';

export const MultiViewSimulator: React.FC = () => {
  const { state, setSimulatorMode } = useGame();
  const [device1Team, setDevice1Team] = useState<number>(1);
  const [device2Team, setDevice2Team] = useState<number>(2);

  const [tab1, setTab1] = useState<'home' | 'portfolio' | 'board' | 'activity' | 'rules'>('home');
  const [tab2, setTab2] = useState<'home' | 'portfolio' | 'board' | 'activity' | 'rules'>('home');

  const team1 = state.teams.find(t => t.number === device1Team) || state.teams[0];
  const team2 = state.teams.find(t => t.number === device2Team) || state.teams[1];

  const meta1 = TEAM_METAS[team1.number] || TEAM_METAS[1];
  const meta2 = TEAM_METAS[team2.number] || TEAM_METAS[2];

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F7F2F6] flex flex-col select-none">
      {/* Simulator Control Header */}
      <header className="bg-[#141416] border-b border-white/10 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSimulatorMode(false);
              window.location.hash = '#/play';
            }}
            className="px-3 py-1.5 rounded-xl bg-[#19191C] hover:bg-[#202024] text-white/70 hover:text-white border border-white/10 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT SIMULATOR</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#33FF67] animate-pulse" />
            <span>STARTUPOLY LIVE MULTI-DEVICE SIMULATOR</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/60 font-mono">
          <span>COUNTDOWN:</span>
          <span className="text-white font-bold bg-[#19191C] px-3 py-1 rounded-lg border border-white/10">
            {formatTimer(state.secondsRemaining)}
          </span>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 p-4 overflow-y-auto">
        {/* Left: Admin Game Master Cockpit (7 cols on xl) */}
        <div className="xl:col-span-7 eqx-card-elevated overflow-hidden flex flex-col max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-3 bg-[#141416] border-b border-white/10 flex items-center justify-between text-xs font-bold">
            <span className="text-[#7484FE]">GAME MASTER AUTHORITATIVE CONSOLE</span>
            <span className="text-white/50 font-mono">ROOM: {state.matchCode}</span>
          </div>
          <div className="p-2 sm:p-4 flex-1">
            <AdminShell />
          </div>
        </div>

        {/* Right: Two Simulated Mobile Phones (5 cols on xl) */}
        <div className="xl:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulated Mobile Device 1 */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[390px] h-[780px] bg-[#0D0D0F] rounded-[36px] border-2 border-white/15 shadow-2xl flex flex-col overflow-hidden relative">
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-[#141416] rounded-b-xl mx-auto z-50 flex items-center justify-center border-b border-x border-white/10">
                <span className="w-8 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Team Selector Toolbar */}
              <div className="px-3.5 py-2 bg-[#141416] border-b border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#7484FE]" />
                  <span>PHONE 01</span>
                </span>
                <select
                  value={device1Team}
                  onChange={(e) => setDevice1Team(Number(e.target.value))}
                  className="px-2.5 py-0.5 rounded-lg bg-[#19191C] border border-white/10 text-xs font-semibold text-white"
                >
                  {state.teams.slice(0, state.settings.teamCount).map(t => (
                    <option key={t.id} value={t.number}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Screen Content */}
              <div className="flex-1 p-3 overflow-y-auto pb-16">
                <LiveRollBoardModal />
                {state.status === 'setup' || state.status === 'waiting' ? (
                  <PlayerWaitingRoom team={team1} />
                ) : state.status === 'finished' ? (
                  <PlayerWinnerScreen team={team1} />
                ) : (
                  <>
                    {tab1 === 'home' && <PlayerHome team={team1} onNavigateTab={setTab1} />}
                    {tab1 === 'portfolio' && <PlayerPortfolio team={team1} />}
                    {tab1 === 'board' && (
                      <div className="space-y-3 pb-24">
                        <div className="flex items-center justify-between px-1">
                          <h2 className="text-sm font-bold text-white">LIVE 24-SPACE BOARD</h2>
                          <span className="text-[11px] font-mono text-white/50">Space #{team1.position + 1}</span>
                        </div>
                        <StartupolyBoard mode="player" activeTeamNumber={team1.number} />
                      </div>
                    )}
                    {tab1 === 'activity' && <PlayerActivity team={team1} />}
                    {tab1 === 'rules' && <PlayerRules />}
                  </>
                )}
                <PlayerForcedSaleModal team={team1} />
              </div>

              {/* Mobile Bottom Navigation */}
              {state.status !== 'setup' && state.status !== 'waiting' && state.status !== 'finished' && (
                <div className="absolute bottom-0 inset-x-0 bg-[#141416]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 py-2 px-1 text-[10px] text-center font-medium">
                  {(['home', 'portfolio', 'board', 'activity', 'rules'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTab1(tab)}
                      className={`py-1 rounded-lg uppercase ${tab1 === tab ? 'text-[#7484FE] font-bold' : 'text-white/40'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Simulated Mobile Device 2 */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[390px] h-[780px] bg-[#0D0D0F] rounded-[36px] border-2 border-white/15 shadow-2xl flex flex-col overflow-hidden relative">
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-[#141416] rounded-b-xl mx-auto z-50 flex items-center justify-center border-b border-x border-white/10">
                <span className="w-8 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Team Selector Toolbar */}
              <div className="px-3.5 py-2 bg-[#141416] border-b border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#33FF67]" />
                  <span>PHONE 02</span>
                </span>
                <select
                  value={device2Team}
                  onChange={(e) => setDevice2Team(Number(e.target.value))}
                  className="px-2.5 py-0.5 rounded-lg bg-[#19191C] border border-white/10 text-xs font-semibold text-white"
                >
                  {state.teams.slice(0, state.settings.teamCount).map(t => (
                    <option key={t.id} value={t.number}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Screen Content */}
              <div className="flex-1 p-3 overflow-y-auto pb-16">
                <LiveRollBoardModal />
                {state.status === 'setup' || state.status === 'waiting' ? (
                  <PlayerWaitingRoom team={team2} />
                ) : state.status === 'finished' ? (
                  <PlayerWinnerScreen team={team2} />
                ) : (
                  <>
                    {tab2 === 'home' && <PlayerHome team={team2} onNavigateTab={setTab2} />}
                    {tab2 === 'portfolio' && <PlayerPortfolio team={team2} />}
                    {tab2 === 'board' && (
                      <div className="space-y-3 pb-24">
                        <div className="flex items-center justify-between px-1">
                          <h2 className="text-sm font-bold text-white">LIVE 24-SPACE BOARD</h2>
                          <span className="text-[11px] font-mono text-white/50">Space #{team2.position + 1}</span>
                        </div>
                        <StartupolyBoard mode="player" activeTeamNumber={team2.number} />
                      </div>
                    )}
                    {tab2 === 'activity' && <PlayerActivity team={team2} />}
                    {tab2 === 'rules' && <PlayerRules />}
                  </>
                )}
                <PlayerForcedSaleModal team={team2} />
              </div>

              {/* Mobile Bottom Navigation */}
              {state.status !== 'setup' && state.status !== 'waiting' && state.status !== 'finished' && (
                <div className="absolute bottom-0 inset-x-0 bg-[#141416]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 py-2 px-1 text-[10px] text-center font-medium">
                  {(['home', 'portfolio', 'board', 'activity', 'rules'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTab2(tab)}
                      className={`py-1 rounded-lg uppercase ${tab2 === tab ? 'text-[#33FF67] font-bold' : 'text-white/40'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
