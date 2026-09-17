import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOARD_SPACES } from '../../constants/board';
import { BONUS_CARDS, CRISIS_CARDS } from '../../constants/cards';
import { INITIAL_BUSINESSES } from '../../constants/businesses';
import { BookOpen, Star, Coins, Clock, Users, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';

interface PlayerRulesProps {
  onBack?: () => void;
}

export const PlayerRules: React.FC<PlayerRulesProps> = ({ onBack }) => {
  const { themeMode } = useGame();
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'cards'>('overview');
  const [showCelebration, setShowCelebration] = useState(false);

  return (
    <div className="space-y-3.5 max-w-[390px] mx-auto pb-28 select-none">
      {/* Top Header (Screen 4: ← Game Rules) */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="font-pixel text-sm text-black leading-none drop-shadow-[1px_1px_0px_rgba(255,255,255,0.8)]">
              GAME RULES
            </h1>
            <span className="font-arcade text-[10px] text-slate-700 font-bold block mt-0.5">
              STARTUPOLY OFFICIAL MANUAL
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-[#FBD000] border-2 border-black flex items-center justify-center font-pixel text-xs text-black shadow-[2px_2px_0px_#000]">
          📖
        </div>
      </div>

      {/* Segmented Control / Tabs (Screen 4: Overview | Businesses | Cards) */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-pixel">
        {[
          { id: 'overview', label: 'OVERVIEW' },
          { id: 'businesses', label: 'BUSINESSES' },
          { id: 'cards', label: 'CARDS' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 rounded-xl text-[9px] transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#FBD000] text-black border-2 border-black shadow-[2px_2px_0px_#000] font-black'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview (Screen 4) */}
      {activeTab === 'overview' && (
        <div className="space-y-2.5">
          {/* Objective Card */}
          <div className="mario-card p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⭐</span>
              <h3 className="font-pixel text-[10px] text-black uppercase">
                OBJECTIVE
              </h3>
            </div>
            <p className="font-arcade text-xs text-slate-800 leading-relaxed font-bold">
              Build the highest total startup valuation by acquiring high-yield businesses, executing strategic power-up upgrades, and extracting rent from rival teams!
            </p>
          </div>

          {/* Starting Resources Card */}
          <div className="mario-card p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🪙</span>
              <h3 className="font-pixel text-[10px] text-black uppercase">
                STARTING RESOURCES
              </h3>
            </div>
            <p className="font-arcade text-xs text-slate-800 leading-relaxed font-bold">
              ₹ 1,000 Starting Cash per team. Max 3 business pipes per company. Initial CV is 0 until you acquire your first enterprise.
            </p>
          </div>

          {/* Match Format Card */}
          <div className="mario-card p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⏱️</span>
              <h3 className="font-pixel text-[10px] text-black uppercase">
                MATCH FORMAT
              </h3>
            </div>
            <p className="font-arcade text-xs text-slate-800 leading-relaxed font-bold">
              50 Minutes live physical simulation with outdoor giant board track. Real-time turn timer and Game Master action validation.
            </p>
          </div>

          {/* Team Size Card */}
          <div className="mario-card p-4 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">👥</span>
              <h3 className="font-pixel text-[10px] text-black uppercase">
                TEAM SIZE
              </h3>
            </div>
            <p className="font-arcade text-xs text-slate-800 leading-relaxed font-bold">
              5–6 Players per squad. 1 Lead Token Mover on track, financial strategists, and card tacticians on mobile consoles.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Businesses (Screen 4) */}
      {activeTab === 'businesses' && (
        <div className="space-y-2.5">
          <div className="mario-card p-4 space-y-2">
            <h3 className="font-pixel text-[10px] text-black">TOLL & VALUATION FORMULAS</h3>
            <ul className="font-arcade text-xs text-slate-800 space-y-1 font-bold list-disc pl-4">
              <li><strong>★ Base Pipe:</strong> Rent = 50% Cost | Value = +50% CV</li>
              <li><strong>★★ Super Pipe:</strong> Rent = 75% Cost | Value = +60% CV</li>
              <li><strong>★★★ Max Pipe:</strong> Rent = 100% Cost | Value = +75% CV</li>
              <li><strong>🏁 START Lap:</strong> +₹ 200 Cash + (100 × Businesses Owned) CV</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-pixel text-[8px] text-slate-700 uppercase px-1 block font-bold">
              ENTERPRISE CATEGORIES
            </span>
            {INITIAL_BUSINESSES.map((biz) => (
              <div key={biz.id} className="mario-card-white p-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-pixel text-[10px] text-black">{biz.name}</h4>
                  <span className="font-arcade text-[10px] text-slate-500 font-bold block">{biz.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-pixel text-[9px] text-[#22C55E] block font-bold">Cost: ₹{biz.cost}</span>
                  <span className="font-arcade text-[10px] text-slate-600 font-bold">Base CV: +{biz.baseCv}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Cards (Screen 4) */}
      {activeTab === 'cards' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <span className="font-pixel text-[8px] uppercase tracking-wider text-[#22C55E] block px-1 font-bold">
              🍄 BONUS CARDS (DIE ROLL 1–6)
            </span>
            {BONUS_CARDS.map(card => (
              <div key={card.number} className="mario-card-white p-3 flex items-center justify-between text-xs">
                <span className="font-pixel text-[9px] text-black">#{card.number} {card.name}</span>
                <span className="font-arcade text-xs font-bold text-[#22C55E]">{card.effectText}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <span className="font-pixel text-[8px] uppercase tracking-wider text-[#E52521] block px-1 font-bold">
              💣 CRISIS HAZARDS (DIE ROLL 1–6)
            </span>
            {CRISIS_CARDS.map(card => (
              <div key={card.number} className="mario-card-white p-3 flex items-center justify-between text-xs">
                <span className="font-pixel text-[9px] text-black">#{card.number} {card.name}</span>
                <span className="font-arcade text-xs font-bold text-[#E52521]">{card.effectText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brick Arcade Button (Screen 4: LET'S BUILD!) */}
      <div className="pt-2">
        <button
          onClick={() => {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2500);
          }}
          className="w-full btn-mario-brick text-xs flex items-center justify-center gap-2 cursor-pointer py-3.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>LET'S BUILD!</span>
        </button>
      </div>

      {showCelebration && (
        <div className="p-3 rounded-2xl bg-[#FFF8E7] border-2 border-black text-center font-arcade text-xs font-bold text-amber-950 animate-bounce shadow-[2px_2px_0px_#000]">
          ⭐ LEVEL UP! GET READY FOR WORLD 1-1! ⭐
        </div>
      )}
    </div>
  );
};


