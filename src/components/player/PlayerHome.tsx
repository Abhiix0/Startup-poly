import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Team, Business } from '../../types/game';
import { formatCurrency, MARIO_CHARACTERS } from '../../constants/theme';
import { BOARD_SPACES } from '../../constants/board';
import { calculateRentAndOwnerCv, getUpgradeCost } from '../../engine/gameEngine';
import { PlayerEventModal } from './PlayerEventModal';
import { ChevronRight, MapPin, X, ArrowLeft, Sun, Moon, Volume2, VolumeX, Sparkles, Plus, ArrowUpCircle } from 'lucide-react';

interface PlayerHomeProps {
  team: Team;
  onNavigateTab: (tab: 'home' | 'portfolio' | 'activity' | 'rules') => void;
  onOpenExitConfirm?: () => void;
}

export const PlayerHome: React.FC<PlayerHomeProps> = ({ team, onNavigateTab, onOpenExitConfirm }) => {
  const { state, themeMode, toggleThemeMode, soundMuted, toggleSound } = useGame();
  const [showSpaceSheet, setShowSpaceSheet] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const isMyTurn = state.activeTeamIndex === team.number - 1;
  const activeTeam = state.teams[state.activeTeamIndex];
  const pendingLanding = state.pendingLanding;
  const isMyLanding = pendingLanding && pendingLanding.teamIndex === team.number - 1;

  const myBusinesses = state.businesses.filter(b => b.owner === team.number - 1);
  const currentSpace = BOARD_SPACES[team.position];
  const char = MARIO_CHARACTERS[team.number] || MARIO_CHARACTERS[1];
  const activeChar = MARIO_CHARACTERS[activeTeam?.number || 1] || MARIO_CHARACTERS[1];

  const isLight = themeMode === 'light';

  // Find featured or first business in portfolio
  const featuredBusiness: Business | undefined = myBusinesses[0];

  // Recent transactions for this team
  const recentActivities = state.transactions
    .filter(tx => tx.teamIndex === team.number - 1 || tx.description.toLowerCase().includes(team.name.toLowerCase()))
    .slice(-4)
    .reverse();

  return (
    <div className="flex flex-col space-y-3.5 max-w-[390px] mx-auto pb-24 select-none">
      {/* 1. Top Bar (Screen 3: Mario Avatar + Team Name + Coin Balance) */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-2">
          {onOpenExitConfirm && (
            <button
              onClick={onOpenExitConfirm}
              className="p-1.5 rounded-xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 transition cursor-pointer"
              title="Exit Match"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mario Avatar Disc */}
          <div className="w-9 h-9 rounded-full bg-[#E52521] border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_#000]">
            {char.icon}
          </div>

          <div>
            <h1 className="font-pixel text-[11px] text-black leading-none drop-shadow-[1px_1px_0px_rgba(255,255,255,0.8)]">
              {team.name ? team.name : `TEAM 0${team.number}`}
            </h1>
            <span className="font-arcade text-[9px] text-slate-700 font-bold block mt-0.5">
              WORLD 1-1 · {char.characterName}
            </span>
          </div>
        </div>

        {/* Coin Balance Pill (Screen 3) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E7] border-2 border-black rounded-full shadow-[2px_2px_0px_#000]">
          <span className="text-base animate-coin-spin">🪙</span>
          <span className="font-pixel text-xs text-black font-black">
            {formatCurrency(team.cash)}
          </span>
        </div>
      </div>

      {/* 2. Turn Banner (Active / Waiting on Board) */}
      <div className={`p-3 rounded-2xl border-2 border-black transition-all ${
        isMyTurn 
          ? 'bg-[#FBD000] text-black shadow-[3px_3px_0px_#000]' 
          : 'bg-white/95 text-slate-900 shadow-[3px_3px_0px_#000]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-[#E52521] animate-ping' : 'bg-slate-400'}`} />
            <span className="font-pixel text-[9px] uppercase font-bold tracking-wider">
              {isMyTurn ? '⭐ YOUR TURN TO ROLL! ⭐' : `${activeChar.characterName.toUpperCase()}'S TURN`}
            </span>
          </div>

          <button
            onClick={() => setShowSpaceSheet(true)}
            className="font-pixel text-[7px] px-2 py-0.5 bg-white border border-black rounded shadow-[1px_1px_0px_#000] text-black hover:bg-slate-100"
          >
            SPACE {team.position + 1}
          </button>
        </div>

        {isMyTurn && isMyLanding && (
          <div className="mt-2 pt-2 border-t border-black/20 font-arcade text-xs font-bold leading-snug">
            🎲 Rolled <strong>{pendingLanding.roll}</strong>! Landed on <u>{BOARD_SPACES[pendingLanding.spaceIndex].name}</u>. Game Master resolving!
          </div>
        )}
      </div>

      {/* 3. Section: Your Business Portfolio (1/3) (Screen 3) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-pixel text-[10px] text-black uppercase tracking-wider">
            YOUR BUSINESS PORTFOLIO ({myBusinesses.length}/3)
          </h2>
          <button
            onClick={() => onNavigateTab('portfolio')}
            className="font-pixel text-[8px] text-blue-700 hover:underline font-bold"
          >
            VIEW ALL →
          </button>
        </div>

        {featuredBusiness ? (
          /* Screen 3 White Card */
          <div className="mario-card-white p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-pixel text-sm text-black">
                    {featuredBusiness.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-600 font-pixel text-[7px] text-emerald-800 uppercase">
                    OWNED
                  </span>
                </div>
                <span className="font-arcade text-xs text-slate-600 font-bold block mt-0.5">
                  Initial Value: {formatCurrency(featuredBusiness.cost)}
                </span>
              </div>

              <span className="font-pixel text-[8px] px-2 py-1 rounded bg-[#FBD000] border border-black text-black">
                {featuredBusiness.level === 2 ? '★3 MAX' : featuredBusiness.level === 1 ? '★2 SUPER' : '★1 BASE'}
              </span>
            </div>

            {/* Rent Breakdown Box */}
            <div className="p-2.5 rounded-xl bg-slate-50 border-2 border-black/80 font-arcade text-xs text-slate-800 font-bold flex items-center justify-between">
              <span>Rent Toll:</span>
              <span className="font-pixel text-[9px] text-[#22C55E]">
                {formatCurrency(calculateRentAndOwnerCv(featuredBusiness).rent)}
              </span>
            </div>

            {/* Blue Upgrade Button (Screen 3) */}
            {featuredBusiness.level < 2 ? (
              <button
                onClick={() => onNavigateTab('portfolio')}
                className="w-full btn-mario-blue text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>UPGRADE ({formatCurrency(getUpgradeCost(featuredBusiness))})</span>
              </button>
            ) : (
              <div className="w-full py-2 bg-emerald-100 border-2 border-black rounded-xl text-center font-pixel text-[9px] text-emerald-800">
                ★ MAXED LEVEL ★
              </div>
            )}
          </div>
        ) : (
          /* Empty state prompt */
          <div 
            onClick={() => onNavigateTab('portfolio')}
            className="mario-card-white p-6 text-center space-y-2 cursor-pointer hover:bg-slate-50"
          >
            <span className="text-3xl block animate-bounce">🏭</span>
            <h3 className="font-pixel text-xs text-black">NO BUSINESS PIPES ACQUIRED</h3>
            <p className="font-arcade text-xs text-slate-600 font-bold">
              Roll the physical die and land on business spaces to acquire up to 3 startup pipes!
            </p>
          </div>
        )}
      </div>

      {/* 4. Section: Your Cash (Screen 3 Cream Card) */}
      <div className="mario-card p-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[8px] text-slate-700 uppercase font-bold">
            YOUR CASH
          </span>
          <span className="text-xl">💰</span>
        </div>

        <div className="font-pixel text-2xl text-black font-black tracking-tight">
          {formatCurrency(team.cash)}
        </div>

        <p className="font-arcade text-xs text-slate-600 font-bold">
          Available to invest in new businesses and power-ups.
        </p>
      </div>

      {/* 5. Section: Recent Activity (Screen 3) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-pixel text-[10px] text-black uppercase tracking-wider">
            RECENT ACTIVITY
          </h2>
          <button
            onClick={() => onNavigateTab('activity')}
            className="font-pixel text-[8px] text-blue-700 hover:underline font-bold"
          >
            ALL LOGS →
          </button>
        </div>

        <div className="space-y-1.5">
          {recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div
                key={act.id}
                className="mario-card-white p-2.5 flex items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {/* Color-Coded Circular Icon Badge (Screen 3) */}
                  <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 text-sm shadow-[1px_1px_0px_#000] ${
                    act.actionType === 'rent'
                      ? 'bg-emerald-100 text-emerald-800'
                      : act.actionType === 'upgrade'
                      ? 'bg-purple-100 text-purple-800'
                      : act.actionType === 'purchase'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {act.actionType === 'rent' ? '🪙' : act.actionType === 'upgrade' ? '⭐' : act.actionType === 'purchase' ? '🏭' : '📜'}
                  </div>

                  <div>
                    <p className="font-arcade text-xs text-black font-bold leading-tight line-clamp-1">
                      {act.description}
                    </p>
                    <span className="font-arcade text-[10px] text-slate-500 font-bold block">
                      {act.timeFormatted}
                    </span>
                  </div>
                </div>

                {/* Amount Delta */}
                {act.cashDelta !== undefined && (
                  <span className={`font-pixel text-[9px] font-black flex-shrink-0 ${
                    act.cashDelta >= 0 ? 'text-[#22C55E]' : 'text-[#E52521]'
                  }`}>
                    {act.cashDelta >= 0 ? '+' : ''}{formatCurrency(act.cashDelta)}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="mario-card-white p-3 text-center font-arcade text-xs text-slate-500 font-bold">
              Match starting! Waiting for first turn activity.
            </div>
          )}
        </div>
      </div>

      {/* Bonus Card Quick-View Modal (Screen 5 Trigger) */}
      {showEventModal && (
        <PlayerEventModal
          onClose={() => setShowEventModal(false)}
          customTitle="Investor Visit!"
          customDescription="Receive ₹ 500 from the Bank."
          cardType="bonus"
          actionButtonText="COLLECT"
        />
      )}

      {/* Space Rules Modal */}
      {showSpaceSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0">
          <div className="w-full max-w-[390px] mario-card p-5 space-y-4 rounded-t-3xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-[#3B82F6] text-white font-pixel text-xs border-2 border-black rounded-lg flex items-center justify-center">
                  {team.position + 1}
                </span>
                <h3 className="font-pixel text-xs text-black">
                  {currentSpace.name}
                </h3>
              </div>
              <button 
                onClick={() => setShowSpaceSheet(false)}
                className="p-1.5 bg-white border-2 border-black rounded-lg text-black shadow-[2px_2px_0px_#000]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-arcade text-xs text-slate-800 leading-relaxed font-bold">
              {currentSpace.description}
            </p>

            <button
              onClick={() => setShowSpaceSheet(false)}
              className="w-full btn-mario-yellow text-xs"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


