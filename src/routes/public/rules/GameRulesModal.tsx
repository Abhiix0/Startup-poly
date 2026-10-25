import React, { useState, useEffect, useRef } from 'react';
import {
  BOARD_SPACES,
  REAL_BONUS_CARDS,
  REAL_CRISIS_CARDS,
  WILDCARD_CHALLENGES,
} from '../../../domain/board';
import { OFFICIAL_BUSINESSES, formatINR } from '../../../domain/economy';

export interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'how-to-play' | 'board-preview' | 'businesses' | 'spaces-cards';

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('how-to-play');
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState<number>(0);
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap / prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedSpace = BOARD_SPACES[selectedSpaceIndex] || BOARD_SPACES[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#081226]/80 backdrop-blur-[2px] anim-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-[#FEF9C3] border-[4px] border-[#181512] shadow-[8px_8px_0px_#102040] rounded-sm flex flex-col overflow-hidden text-[#181512]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(184, 107, 30, 0.08) 1px, transparent 1px), linear-gradient(180deg, #FFFDF0 0%, #FEF9C3 60%, #FDF4AA 100%)',
          backgroundSize: '8px 8px, 100% 100%',
        }}
      >
        {/* ================================================================= */}
        {/* RETRO MARIO NES HEADER BAR                                        */}
        {/* ================================================================= */}
        <div className="bg-[#102040] border-b-[3px] border-[#FFCC00] px-3 sm:px-5 py-2.5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[#FFCC00] text-sm sm:text-base animate-pulse">★</span>
            <h2
              id="rules-modal-title"
              className="font-pixel text-[11px] sm:text-xs md:text-sm text-[#FFCC00] tracking-wider uppercase drop-shadow-[1px_1px_0px_#B84418]"
            >
              STARTUPOLY — OFFICIAL RULES
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rules"
            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#E11D48] hover:bg-[#F43F5E] active:translate-y-0.5 text-white font-pixel text-xs sm:text-sm border-2 border-[#181512] shadow-[2px_2px_0px_#181512] flex items-center justify-center cursor-pointer transition-transform"
          >
            ✕
          </button>
        </div>

        {/* ================================================================= */}
        {/* RETRO NAVIGATION TABS                                             */}
        {/* ================================================================= */}
        <div className="bg-[#182642] px-2 sm:px-4 py-1.5 border-b-2 border-[#181512] flex gap-1.5 sm:gap-2 overflow-x-auto shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('how-to-play')}
            className={`font-pixel text-[9px] sm:text-[10px] px-2.5 py-1.5 rounded-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'how-to-play'
                ? 'bg-[#FFCC00] text-[#102040] border-2 border-[#102040] font-bold shadow-[2px_2px_0px_#B84418]'
                : 'bg-[#25375A] text-[#E2E8F0] hover:bg-[#334B7A] border border-[#102040]'
            }`}
          >
            🎮 HOW TO PLAY
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('board-preview')}
            className={`font-pixel text-[9px] sm:text-[10px] px-2.5 py-1.5 rounded-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'board-preview'
                ? 'bg-[#FFCC00] text-[#102040] border-2 border-[#102040] font-bold shadow-[2px_2px_0px_#B84418]'
                : 'bg-[#25375A] text-[#E2E8F0] hover:bg-[#334B7A] border border-[#102040]'
            }`}
          >
            🗺️ BOARD PREVIEW
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('businesses')}
            className={`font-pixel text-[9px] sm:text-[10px] px-2.5 py-1.5 rounded-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'businesses'
                ? 'bg-[#FFCC00] text-[#102040] border-2 border-[#102040] font-bold shadow-[2px_2px_0px_#B84418]'
                : 'bg-[#25375A] text-[#E2E8F0] hover:bg-[#334B7A] border border-[#102040]'
            }`}
          >
            🏢 BUSINESSES
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spaces-cards')}
            className={`font-pixel text-[9px] sm:text-[10px] px-2.5 py-1.5 rounded-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'spaces-cards'
                ? 'bg-[#FFCC00] text-[#102040] border-2 border-[#102040] font-bold shadow-[2px_2px_0px_#B84418]'
                : 'bg-[#25375A] text-[#E2E8F0] hover:bg-[#334B7A] border border-[#102040]'
            }`}
          >
            🃏 SPACES & CARDS
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB CONTENTS (Scrollable Area)                                    */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {/* --------------------------------------------------------------- */}
          {/* TAB 1: HOW TO PLAY                                              */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'how-to-play' && (
            <div className="space-y-4">
              {/* Match Timing & Starting Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-[#FFFFFF]/90 border-2 border-[#181512] p-3 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                  <h3 className="font-pixel text-[10px] sm:text-[11px] text-[#102040] flex items-center gap-1.5 mb-1.5 font-bold">
                    <span>⏱️</span> MATCH SCHEDULE
                  </h3>
                  <ul className="text-xs space-y-1 text-[#334155] font-sans">
                    <li>• <strong>5 Mins:</strong> Team setup & registration</li>
                    <li>• <strong>50 Mins:</strong> Live competitive gameplay</li>
                    <li>• <strong>5 Mins:</strong> Wrap-up, scoring & reset</li>
                  </ul>
                </div>

                <div className="bg-[#FFFFFF]/90 border-2 border-[#181512] p-3 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                  <h3 className="font-pixel text-[10px] sm:text-[11px] text-[#102040] flex items-center gap-1.5 mb-1.5 font-bold">
                    <span>💰</span> STARTING INVENTORY
                  </h3>
                  <div className="grid grid-cols-3 gap-1 text-center font-pixel text-[9px] pt-1">
                    <div className="bg-[#FEF9C3] p-1 border border-[#B45309]">
                      <div className="text-[#B45309]">CASH</div>
                      <div className="font-bold text-[11px] text-[#181512]">₹1,000</div>
                    </div>
                    <div className="bg-[#E0F2FE] p-1 border border-[#0284C7]">
                      <div className="text-[#0284C7]">COMPANY VAL</div>
                      <div className="font-bold text-[11px] text-[#181512]">0 CV</div>
                    </div>
                    <div className="bg-[#DCFCE7] p-1 border border-[#16A34A]">
                      <div className="text-[#16A34A]">BUSINESSES</div>
                      <div className="font-bold text-[11px] text-[#181512]">0 Owned</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Victory & Goal */}
              <div className="bg-[#FFFFFF]/90 border-2 border-[#181512] p-3.5 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                <h3 className="font-pixel text-[10px] sm:text-[11px] text-[#B84418] flex items-center gap-1.5 mb-1.5 font-bold">
                  <span>🏆</span> VICTORY CONDITION & TIE-BREAKERS
                </h3>
                <p className="text-xs text-[#1E293B] font-sans leading-relaxed">
                  The match winner is the team with the highest <strong>Company Value (CV)</strong> when the 50-minute clock expires.
                </p>
                <div className="mt-2 bg-[#F1F5F9] p-2 border-l-4 border-[#3B82F6] text-[11px] text-[#334155] font-sans">
                  <strong>Tie-Break Order:</strong> (1) Highest Cash Balance → (2) Most Businesses Owned.
                </div>
              </div>

              {/* Turn Sequence & Dice Rules */}
              <div className="bg-[#FFFFFF]/90 border-2 border-[#181512] p-3.5 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                <h3 className="font-pixel text-[10px] sm:text-[11px] text-[#102040] flex items-center gap-1.5 mb-2 font-bold">
                  <span>🎲</span> TURN SEQUENCE & DICE ROLLS
                </h3>
                <div className="space-y-2 text-xs text-[#334155] font-sans leading-relaxed">
                  <p>
                    1. <strong>Round-Robin Order:</strong> Teams take turns clockwise in structured order.
                  </p>
                  <p>
                    2. <strong>Roll & Move:</strong> Roll one standard die, advance that number of spaces, and resolve the landing space immediately.
                  </p>
                  <p>
                    3. <strong>Rolling a 6:</strong> Grants an <strong>extra roll</strong> immediately after resolving the current space.
                  </p>
                  <div className="bg-[#FEE2E2] border border-[#EF4444] p-2 rounded-xs text-[11px] text-[#991B1B]">
                    ⚠️ <strong>Three 6s Rule:</strong> Rolling three consecutive 6s in a single turn cancels the entire turn and completely reverses its effects!
                  </div>
                </div>
              </div>

              {/* START Space & CV Growth Bonus */}
              <div className="bg-[#FFFFFF]/90 border-2 border-[#181512] p-3.5 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                <h3 className="font-pixel text-[10px] sm:text-[11px] text-[#16A34A] flex items-center gap-1.5 mb-1.5 font-bold">
                  <span>🚩</span> START SPACE & SCALING GROWTH BONUS
                </h3>
                <p className="text-xs text-[#334155] font-sans leading-relaxed">
                  Each time a team lands on or passes <strong>START</strong>, they collect <strong>₹200 Cash</strong>.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center font-pixel text-[9px]">
                  <div className="bg-[#DCFCE7] p-2 border border-[#16A34A]">
                    <div className="text-[#16A34A]">OWN 2 BUSINESSES</div>
                    <div className="font-bold text-[11px] text-[#15803D] mt-0.5">+200 CV Growth Bonus</div>
                  </div>
                  <div className="bg-[#DCFCE7] p-2 border border-[#16A34A]">
                    <div className="text-[#16A34A]">OWN 3 BUSINESSES</div>
                    <div className="font-bold text-[11px] text-[#15803D] mt-0.5">+500 CV Growth Bonus</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 2: BOARD PREVIEW                                            */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'board-preview' && (
            <div className="space-y-3">
              {/* Official Physical Board Artwork Display */}
              <div className="bg-[#102040] border-3 border-[#181512] rounded-sm p-3 shadow-[4px_4px_0px_#181512] flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#FFCC00] text-sm animate-pulse">★</span>
                    <span className="font-pixel text-[10px] sm:text-xs text-[#FFCC00] font-bold">
                      OFFICIAL 24-SPACE PHYSICAL BOARD
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsImageZoomed(true)}
                    className="font-pixel text-[8px] sm:text-[9px] bg-[#FFCC00] text-[#102040] hover:bg-[#FFE066] px-2 py-1 border border-[#102040] shadow-[1px_1px_0px_#B84418] cursor-pointer"
                  >
                    🔍 ENLARGE BOARD
                  </button>
                </div>

                {/* High-res Board Image with Click-to-Zoom */}
                <div
                  className="relative group w-full max-w-[420px] aspect-square rounded-sm overflow-hidden border-3 border-[#FFCC00] shadow-[3px_3px_0px_#181512] bg-[#38BDF8] cursor-zoom-in"
                  onClick={() => setIsImageZoomed(true)}
                >
                  <img
                    src="/board.png"
                    alt="STARTUPOLY Official Physical Board"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 font-pixel text-[10px] bg-[#102040]/90 text-[#FFCC00] border border-[#FFCC00] px-3 py-1.5 shadow-[2px_2px_0px_#000] transition-opacity">
                      CLICK TO FULLSCREEN
                    </span>
                  </div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#93C5FD] font-sans mt-2 text-center">
                  Official STARTUPOLY board diagram featuring Start, AI, SaaS, FinTech, DevTools, Cyber Security, EdTech, HealthTech, CleanTech, Robotics, Action spaces, Bonus &amp; Crisis cards!
                </div>
              </div>

              {/* Space Counts Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center font-pixel text-[8px] sm:text-[9px] select-none">
                <div className="bg-[#FFFFFF] p-1.5 border border-[#181512]">
                  <div className="text-[#B84418]">CORNERS</div>
                  <div className="font-bold text-xs text-[#181512]">4 Spaces</div>
                </div>
                <div className="bg-[#E0F2FE] p-1.5 border border-[#0284C7]">
                  <div className="text-[#0284C7]">BUSINESSES</div>
                  <div className="font-bold text-xs text-[#0369A1]">10 Spaces</div>
                </div>
                <div className="bg-[#DCFCE7] p-1.5 border border-[#16A34A]">
                  <div className="text-[#16A34A]">BONUS CARDS</div>
                  <div className="font-bold text-xs text-[#15803D]">4 Spaces</div>
                </div>
                <div className="bg-[#FEE2E2] p-1.5 border border-[#DC2626]">
                  <div className="text-[#DC2626]">CRISIS CARDS</div>
                  <div className="font-bold text-xs text-[#B91C1C]">4 Spaces</div>
                </div>
                <div className="bg-[#F3E8FF] p-1.5 border border-[#9333EA] col-span-2 sm:col-span-1">
                  <div className="text-[#9333EA]">WILDCARDS</div>
                  <div className="font-bold text-xs text-[#7E22CE]">2 Spaces</div>
                </div>
              </div>

              {/* 24-Space Inspector Directory */}
              <div className="bg-[#FFFFFF]/95 border-2 border-[#181512] p-2.5 sm:p-3 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                <div className="text-[10px] sm:text-[11px] font-pixel text-[#102040] mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>🔍</span> INSPECT SPACES (0–23):
                  </span>
                  <span className="font-mono text-[9px] text-[#64748B]">Click space # to view details</span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center font-pixel text-[8px] sm:text-[9px]">
                  {BOARD_SPACES.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSpaceIndex(idx)}
                      className={`py-1.5 px-0.5 border rounded-xs transition-all cursor-pointer truncate ${
                        selectedSpaceIndex === idx
                          ? 'bg-[#FFCC00] text-[#102040] border-[#102040] font-bold shadow-[1px_1px_0px_#102040] scale-105 z-10'
                          : 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1] hover:bg-[#E2E8F0]'
                      }`}
                      title={`Space ${s.index}: ${s.name} (${s.type})`}
                    >
                      #{idx}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Space Inspector Detail Box */}
              <div className="bg-[#FFFFFF]/90 border-2 border-[#181512] p-3 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5 mb-1.5">
                  <span className="font-pixel text-[9px] sm:text-[10px] text-[#102040] font-bold">
                    SPACE #{selectedSpace.index}: {selectedSpace.name}
                  </span>
                  <span className="font-pixel text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-[#102040] text-[#FFCC00] rounded-xs font-bold">
                    {selectedSpace.type}
                  </span>
                </div>
                <p className="text-xs text-[#334155] font-sans leading-relaxed">
                  {selectedSpace.description}
                </p>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 3: BUSINESSES                                               */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'businesses' && (
            <div className="space-y-3.5">
              {/* Business Rules Summary Banner */}
              <div className="bg-[#FFFFFF]/90 border-2 border-[#181512] p-3 rounded-sm shadow-[2px_2px_0px_#C89B3C] space-y-1.5 text-xs text-[#334155] font-sans leading-relaxed">
                <h3 className="font-pixel text-[10px] text-[#102040] font-bold flex items-center gap-1.5">
                  <span>🏢</span> ACQUISITION & UPGRADE RULES
                </h3>
                <p>• <strong>Buying:</strong> Teams may purchase an unowned business upon landing at its listed purchase cost.</p>
                <p>• <strong>Ownership Limit:</strong> Each team may own a maximum of <strong>3 businesses</strong>.</p>
                <p>• <strong>2 Upgrade Levels:</strong> Each upgrade tier boosts both rent charged to opponents and Company Value!</p>
                <p>• <strong>Landing on Opponent's Business:</strong> Landing team pays <strong>Rent</strong> to owner, and the owner is awarded <strong>Company Value</strong> based on current upgrade level.</p>
                <p>• <strong>No Voluntary Sales:</strong> Businesses cannot be sold voluntarily. If a team cannot pay debt/rent, forced-sale rules apply.</p>
              </div>

              {/* 10 Businesses Roster */}
              <div className="space-y-2.5">
                <h4 className="font-pixel text-[9px] sm:text-[10px] text-[#102040] uppercase tracking-wider font-bold">
                  10 STARTUP BUSINESSES
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OFFICIAL_BUSINESSES.map((b) => (
                    <div
                      key={b.key}
                      className={`p-3 rounded-sm border-2 shadow-[2px_2px_0px_#C89B3C] ${
                        b.is_provisional
                          ? 'bg-[#FEFCE8] border-[#CA8A04]'
                          : 'bg-[#FFFFFF] border-[#181512]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <div>
                          <h5 className="font-pixel text-[10px] text-[#102040] font-bold">
                            {b.name}
                          </h5>
                          {b.is_provisional && (
                            <span className="font-pixel text-[7px] text-[#B45309] bg-[#FEF08A] px-1 py-0.5 rounded-xs inline-block mt-0.5">
                              [Provisional — Pending Rulebook Confirmation]
                            </span>
                          )}
                        </div>
                        <span className="font-pixel text-[9px] text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded-xs shrink-0">
                          {formatINR(b.cost)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-[10px] font-sans text-[#334155] bg-[#F8FAFC] p-1.5 border border-[#E2E8F0] rounded-xs text-center">
                        <div>
                          <div className="font-bold text-[#64748B] text-[8px] font-pixel">BASE</div>
                          <div>{b.initial_cv} CV</div>
                          <div className="text-[9px] text-[#64748B]">Rent: {formatINR(Math.round(b.cost * 0.5))}</div>
                        </div>
                        <div>
                          <div className="font-bold text-[#0284C7] text-[8px] font-pixel">LVL 1 (+{b.u1_cv})</div>
                          <div className="text-[#0369A1]">Cost: {formatINR(b.u1_cost)}</div>
                          <div className="text-[9px] text-[#64748B]">Rent: {formatINR(Math.round(b.cost * 0.75))}</div>
                        </div>
                        <div>
                          <div className="font-bold text-[#16A34A] text-[8px] font-pixel">LVL 2 (+{b.u2_cv})</div>
                          <div className="text-[#15803D]">Cost: {formatINR(b.u2_cost)}</div>
                          <div className="text-[9px] text-[#64748B]">Rent: {formatINR(b.cost)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 4: SPACES & CARDS                                           */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'spaces-cards' && (
            <div className="space-y-4">
              {/* Corner Action Spaces */}
              <div className="space-y-2">
                <h4 className="font-pixel text-[9px] sm:text-[10px] text-[#102040] uppercase tracking-wider font-bold">
                  CORNER ACTION SPACES
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-[#FFFFFF]/95 border-2 border-[#181512] p-2.5 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                    <div className="font-pixel text-[9px] text-[#B84418] font-bold mb-1">
                      ACTION B: PITCH
                    </div>
                    <p className="text-[11px] text-[#334155] font-sans leading-relaxed">
                      30-sec pitch for an owned business. If the team owns <strong>0 businesses, skip it penalty-free</strong>. Refusing or failing a required pitch costs the team its next turn.
                    </p>
                  </div>

                  <div className="bg-[#FFFFFF]/95 border-2 border-[#181512] p-2.5 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                    <div className="font-pixel text-[9px] text-[#DC2626] font-bold mb-1">
                      ACTION C: TECH DEBT
                    </div>
                    <p className="text-[11px] text-[#334155] font-sans leading-relaxed">
                      "Lose the Feature": tech debt strike causes the landing team to immediately lose <strong>−200 Company Value</strong> (floored at 0 CV).
                    </p>
                  </div>

                  <div className="bg-[#FFFFFF]/95 border-2 border-[#181512] p-2.5 rounded-sm shadow-[2px_2px_0px_#C89B3C]">
                    <div className="font-pixel text-[9px] text-[#0284C7] font-bold mb-1">
                      ACTION D: STEAL TALENT
                    </div>
                    <p className="text-[11px] text-[#334155] font-sans leading-relaxed">
                      Choose another team and take <strong>up to ₹100</strong> from them. A target team with ₹0 is still a valid legal target!
                    </p>
                  </div>
                </div>
              </div>

              {/* Bonus Cards (1-6) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-pixel text-[9px] sm:text-[10px] text-[#15803D] uppercase tracking-wider font-bold">
                    🎁 BONUS CARDS (DETERMINED BY MOVEMENT ROLL 1–6)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REAL_BONUS_CARDS.map((card) => (
                    <div
                      key={card.id}
                      className="bg-[#F0FDF4] border border-[#16A34A] p-2 rounded-xs flex items-start gap-2"
                    >
                      <span className="font-pixel text-[10px] text-white bg-[#16A34A] px-1.5 py-0.5 rounded-xs shrink-0">
                        #{card.id}
                      </span>
                      <div>
                        <div className="font-pixel text-[9px] text-[#166534] font-bold">
                          {card.title}
                        </div>
                        <div className="text-[11px] text-[#14532D] font-sans">
                          {card.effectText}
                          {card.id === 6 && (
                            <span className="block text-[10px] text-[#059669] italic mt-0.5">
                              *Reward roll is for cash only and does NOT move token.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crisis Cards (1-6) */}
              <div className="space-y-2">
                <h4 className="font-pixel text-[9px] sm:text-[10px] text-[#DC2626] uppercase tracking-wider font-bold">
                  ⚠️ CRISIS CARDS (DETERMINED BY MOVEMENT ROLL 1–6)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REAL_CRISIS_CARDS.map((card) => (
                    <div
                      key={card.id}
                      className="bg-[#FEF2F2] border border-[#EF4444] p-2 rounded-xs flex items-start gap-2"
                    >
                      <span className="font-pixel text-[10px] text-white bg-[#DC2626] px-1.5 py-0.5 rounded-xs shrink-0">
                        #{card.id}
                      </span>
                      <div>
                        <div className="font-pixel text-[9px] text-[#991B1B] font-bold">
                          {card.title}
                        </div>
                        <div className="text-[11px] text-[#7F1D1D] font-sans">
                          {card.effectText}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wildcard Challenges */}
              <div className="bg-[#FAF5FF] border-2 border-[#9333EA] p-3 rounded-sm shadow-[2px_2px_0px_#7E22CE]">
                <h4 className="font-pixel text-[9px] sm:text-[10px] text-[#7E22CE] uppercase tracking-wider font-bold mb-1.5">
                  ⚡ WILDCARD CHALLENGES
                </h4>
                <p className="text-xs text-[#581C87] font-sans leading-relaxed mb-2">
                  When landing on a Wildcard space, the team draws and immediately executes a mandatory quick physical or social challenge:
                </p>
                <ul className="text-xs space-y-1 text-[#6B21A8] font-sans">
                  {WILDCARD_CHALLENGES.slice(0, 4).map((c, idx) => (
                    <li key={idx}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RETRO FOOTER CLOSE BAR                                            */}
        {/* ================================================================= */}
        <div className="bg-[#102040] border-t-2 border-[#FFCC00] px-4 py-2 flex items-center justify-between shrink-0 select-none">
          <span className="font-pixel text-[8px] text-[#93C5FD]">
            Press ESC to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-pixel text-[9px] sm:text-[10px] px-3 py-1 bg-[#FFCC00] hover:bg-[#FFB800] active:translate-y-0.5 text-[#102040] border-2 border-[#181512] shadow-[2px_2px_0px_#B84418] cursor-pointer font-bold tracking-wider"
          >
            CLOSE [✕]
          </button>
        </div>
      </div>

      {/* High-Res Fullscreen Lightbox Zoom Modal */}
      {isImageZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged STARTUPOLY Board"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-3 sm:p-6 bg-[#081226]/95 backdrop-blur-md anim-fade-in"
          onClick={() => setIsImageZoomed(false)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] flex flex-col items-center bg-[#102040] p-3 border-4 border-[#FFCC00] shadow-[8px_8px_0px_#081226]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b-2 border-[#FFCC00] mb-2">
              <span className="font-pixel text-[11px] sm:text-xs text-[#FFCC00] tracking-wider font-bold">
                STARTUPOLY — OFFICIAL PHYSICAL BOARD
              </span>
              <button
                type="button"
                onClick={() => setIsImageZoomed(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-[#E11D48] text-white font-pixel text-xs sm:text-sm border-2 border-[#181512] shadow-[2px_2px_0px_#181512] flex items-center justify-center cursor-pointer hover:bg-[#F43F5E]"
              >
                ✕
              </button>
            </div>
            <img
              src="/board.png"
              alt="STARTUPOLY Official Physical Board Fullscreen"
              className="max-h-[75vh] w-auto max-w-full object-contain border-2 border-[#181512]"
            />
            <p className="font-pixel text-[8px] text-[#93C5FD] mt-2 text-center">
              Click anywhere outside or press ✕ to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
