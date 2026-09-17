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
import { Smartphone, Monitor, ArrowLeft } from 'lucide-react';

export const MultiViewSimulator: React.FC = () => {
  const { state, setSimulatorMode } = useGame();
  const [device1Team, setDevice1Team] = useState<number>(1);
  const [device2Team, setDevice2Team] = useState<number>(2);

  const [tab1, setTab1] = useState<'home' | 'portfolio' | 'activity' | 'rules'>('home');
  const [tab2, setTab2] = useState<'home' | 'portfolio' | 'activity' | 'rules'>('home');

  const team1 = state.teams.find(t => t.number === device1Team) || state.teams[0];
  const team2 = state.teams.find(t => t.number === device2Team) || state.teams[1];

  return (
    <div className="min-h-screen bg-[#101014] text-[#F7F2F6] flex flex-col select-none">
      {/* Simulator Control Header */}
      <header className="bg-[#181820] border-b-4 border-black px-4 py-3 flex items-center justify-between z-50 shadow-[0px_4px_0px_#000]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSimulatorMode(false);
              window.location.hash = '#/play';
            }}
            className="px-3 py-1.5 nes-box bg-[#22222E] hover:bg-[#E52521] text-gray-300 hover:text-white border-2 border-black transition flex items-center gap-1.5 font-pixel text-[9px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> EXIT ARENA
          </button>
          <div className="h-5 w-0.5 bg-black" />
          <span className="font-pixel text-xs text-[#FBD000] flex items-center gap-1.5">
            🕹️ RETRO MARIO SIMULATOR
          </span>
        </div>

        <div className="flex items-center gap-2 font-pixel text-[10px] text-gray-300">
          <span className="hidden sm:inline">WORLD CLOCK:</span>
          <span className="text-[#FBD000] bg-[#101014] px-2.5 py-1 nes-box border border-black">
            ⏱️ {state.secondsRemaining}s
          </span>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 p-3 sm:p-4 overflow-y-auto">
        {/* Left: Admin Game Master Cockpit (7 cols on xl) */}
        <div className="xl:col-span-7 nes-box bg-[#181820] border-4 border-black overflow-hidden flex flex-col max-h-[calc(100vh-80px)] overflow-y-auto shadow-[4px_4px_0px_#000]">
          <div className="p-3 bg-[#22222E] border-b-4 border-black flex items-center justify-between font-pixel text-[10px]">
            <span className="text-[#43B047]">🏰 GAME MASTER CASTLE VIEW</span>
            <span className="text-[#FBD000]">STAGE {state.matchCode}</span>
          </div>
          <div className="p-2 sm:p-4 flex-1">
            <AdminShell />
          </div>
        </div>

        {/* Right: Two 390px Simulated Mobile Phones (5 cols on xl) */}
        <div className="xl:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulated Mobile Device 1 */}
          <div className="flex flex-col items-center">
            {/* Device Frame */}
            <div className="w-full max-w-[390px] h-[780px] bg-[#101014] rounded-[36px] border-4 border-black shadow-[6px_6px_0px_#000] flex flex-col overflow-hidden relative">
              {/* Top Speaker Notch */}
              <div className="w-24 h-4 bg-[#22222E] rounded-b-xl mx-auto z-50 flex items-center justify-center border-b-2 border-x-2 border-black">
                <span className="w-8 h-1 bg-black rounded-full" />
              </div>

              {/* Team Selector Toolbar */}
              <div className="px-3 py-1.5 bg-[#181820] border-b-2 border-black flex items-center justify-between text-[11px]">
                <span className="font-pixel text-[9px] text-[#5C94FC] flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> PHONE 1
                </span>
                <select
                  value={device1Team}
                  onChange={(e) => setDevice1Team(Number(e.target.value))}
                  className="px-2 py-0.5 nes-box bg-[#101014] border border-black font-pixel text-[9px] text-[#FBD000]"
                >
                  {state.teams.slice(0, state.settings.teamCount).map(t => (
                    <option key={t.id} value={t.number}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Screen Content */}
              <div className="flex-1 p-3 overflow-y-auto pb-16">
                {state.status === 'setup' || state.status === 'waiting' ? (
                  <PlayerWaitingRoom team={team1} />
                ) : state.status === 'finished' ? (
                  <PlayerWinnerScreen team={team1} />
                ) : (
                  <>
                    {tab1 === 'home' && <PlayerHome team={team1} onNavigateTab={setTab1} />}
                    {tab1 === 'portfolio' && <PlayerPortfolio team={team1} />}
                    {tab1 === 'activity' && <PlayerActivity team={team1} />}
                    {tab1 === 'rules' && <PlayerRules />}
                  </>
                )}
                <PlayerForcedSaleModal team={team1} />
              </div>

              {/* Mobile Bottom Tabs */}
              {state.status !== 'setup' && state.status !== 'waiting' && state.status !== 'finished' && (
                <div className="absolute bottom-0 inset-x-0 bg-[#181820] border-t-2 border-black grid grid-cols-4 py-1.5 px-2 text-[9px] font-pixel text-center">
                  {(['home', 'portfolio', 'activity', 'rules'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTab1(tab)}
                      className={`py-1 rounded uppercase ${tab1 === tab ? 'text-[#FBD000] bg-[#FBD000]/20' : 'text-gray-400'}`}
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
            {/* Device Frame */}
            <div className="w-full max-w-[390px] h-[780px] bg-[#101014] rounded-[36px] border-4 border-black shadow-[6px_6px_0px_#000] flex flex-col overflow-hidden relative">
              {/* Top Speaker Notch */}
              <div className="w-24 h-4 bg-[#22222E] rounded-b-xl mx-auto z-50 flex items-center justify-center border-b-2 border-x-2 border-black">
                <span className="w-8 h-1 bg-black rounded-full" />
              </div>

              {/* Team Selector Toolbar */}
              <div className="px-3 py-1.5 bg-[#181820] border-b-2 border-black flex items-center justify-between text-[11px]">
                <span className="font-pixel text-[9px] text-[#43B047] flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> PHONE 2
                </span>
                <select
                  value={device2Team}
                  onChange={(e) => setDevice2Team(Number(e.target.value))}
                  className="px-2 py-0.5 nes-box bg-[#101014] border border-black font-pixel text-[9px] text-[#FBD000]"
                >
                  {state.teams.slice(0, state.settings.teamCount).map(t => (
                    <option key={t.id} value={t.number}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Screen Content */}
              <div className="flex-1 p-3 overflow-y-auto pb-16">
                {state.status === 'setup' || state.status === 'waiting' ? (
                  <PlayerWaitingRoom team={team2} />
                ) : state.status === 'finished' ? (
                  <PlayerWinnerScreen team={team2} />
                ) : (
                  <>
                    {tab2 === 'home' && <PlayerHome team={team2} onNavigateTab={setTab2} />}
                    {tab2 === 'portfolio' && <PlayerPortfolio team={team2} />}
                    {tab2 === 'activity' && <PlayerActivity team={team2} />}
                    {tab2 === 'rules' && <PlayerRules />}
                  </>
                )}
                <PlayerForcedSaleModal team={team2} />
              </div>

              {/* Mobile Bottom Tabs */}
              {state.status !== 'setup' && state.status !== 'waiting' && state.status !== 'finished' && (
                <div className="absolute bottom-0 inset-x-0 bg-[#181820] border-t-2 border-black grid grid-cols-4 py-1.5 px-2 text-[9px] font-pixel text-center">
                  {(['home', 'portfolio', 'activity', 'rules'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTab2(tab)}
                      className={`py-1 rounded uppercase ${tab2 === tab ? 'text-[#43B047] bg-[#43B047]/20' : 'text-gray-400'}`}
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
