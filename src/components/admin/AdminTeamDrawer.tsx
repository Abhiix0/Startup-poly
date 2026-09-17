import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, MARIO_CHARACTERS } from '../../constants/theme';
import { X } from 'lucide-react';

interface AdminTeamDrawerProps {
  teamIndex: number | null;
  onClose: () => void;
}

export const AdminTeamDrawer: React.FC<AdminTeamDrawerProps> = ({ teamIndex, onClose }) => {
  const { state, manualAdjust } = useGame();
  const [customCash, setCustomCash] = useState<string>('');
  const [customCv, setCustomCv] = useState<string>('');
  const [reason, setReason] = useState<string>('Game Master Adjustment');

  if (teamIndex === null) return null;
  const team = state.teams[teamIndex];
  if (!team) return null;

  const char = MARIO_CHARACTERS[team.number] || MARIO_CHARACTERS[1];
  const myBusinesses = state.businesses.filter(b => b.owner === teamIndex);

  const applyAdjustment = (cashDelta: number, cvDelta: number, customReason?: string) => {
    manualAdjust(teamIndex, cashDelta, cvDelta, customReason || reason);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(customCash, 10) || 0;
    const v = parseInt(customCv, 10) || 0;
    if (c !== 0 || v !== 0) {
      applyAdjustment(c, v, reason);
      setCustomCash('');
      setCustomCv('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end select-none">
      <div className="w-full max-w-[420px] bg-[#1B1718] border-l-3 border-[#FDF6E2] h-full overflow-y-auto p-6 space-y-5 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#3D3234]">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{char.icon}</span>
            <div>
              <h2 className="font-pixel text-xs text-[#FDF6E2]">
                {char.characterName.toUpperCase()} (T0{team.number})
              </h2>
              <span className="font-arcade text-xs text-[#A89F91]">
                Game Master Overrides
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#262022] hover:bg-[#332A2D] text-[#A89F91] hover:text-[#FDF6E2] border border-[#3D3234] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-xl bg-[#101014] border-2 border-[#FBD000]/40">
            <span className="font-pixel text-[8px] text-[#A89F91] block mb-1">COINS</span>
            <span className="font-pixel text-sm text-[#FBD000]">{formatCurrency(team.cash)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#101014] border-2 border-[#5C94FC]/40">
            <span className="font-pixel text-[8px] text-[#A89F91] block mb-1">STAR POINTS</span>
            <span className="font-pixel text-sm text-[#5C94FC]">{formatNumber(team.cv)} CV</span>
          </div>
        </div>

        {/* Quick Cash Adjustments */}
        <div className="space-y-2">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-[#FBD000] block">
            🪙 ADJUST COINS
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[+100, +200, -100, -200].map(val => (
              <button
                key={val}
                onClick={() => applyAdjustment(val, 0, `Manual coins ${val > 0 ? '+' : ''}${val}`)}
                className={`py-2 rounded-lg font-pixel text-[9px] transition cursor-pointer shadow-[2px_2px_0px_#000] ${
                  val > 0 
                    ? 'bg-[#43B047]/20 border border-[#43B047] text-[#43B047] hover:bg-[#43B047]/30' 
                    : 'bg-[#E52521]/20 border border-[#E52521] text-[#E52521] hover:bg-[#E52521]/30'
                }`}
              >
                {val > 0 ? `+₹${val}` : `−₹${Math.abs(val)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Quick CV Adjustments */}
        <div className="space-y-2">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-[#5C94FC] block">
            ⭐ ADJUST STAR POWER
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[+100, +200, -100, -200].map(val => (
              <button
                key={val}
                onClick={() => applyAdjustment(0, val, `Manual stars ${val > 0 ? '+' : ''}${val}`)}
                className={`py-2 rounded-lg font-pixel text-[9px] transition cursor-pointer shadow-[2px_2px_0px_#000] ${
                  val > 0 
                    ? 'bg-[#5C94FC]/20 border border-[#5C94FC] text-[#5C94FC] hover:bg-[#5C94FC]/30' 
                    : 'bg-[#E52521]/20 border border-[#E52521] text-[#E52521] hover:bg-[#E52521]/30'
                }`}
              >
                {val > 0 ? `+${val}` : `−${Math.abs(val)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-xl bg-[#101014] border border-[#3D3234] space-y-2.5 text-xs">
          <span className="font-pixel text-[9px] text-[#FDF6E2] block">CUSTOM VALUE TWEAK</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Coins (+/-)"
              value={customCash}
              onChange={(e) => setCustomCash(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#1B1718] border border-[#3D3234] font-arcade text-xs text-[#FDF6E2]"
            />
            <input
              type="number"
              placeholder="Stars (+/-)"
              value={customCv}
              onChange={(e) => setCustomCv(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#1B1718] border border-[#3D3234] font-arcade text-xs text-[#FDF6E2]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg mario-btn-gold font-pixel text-[9px] cursor-pointer"
          >
            APPLY OVERRIDE
          </button>
        </form>

        {/* Pipes */}
        <div className="space-y-2">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-[#A89F91] block">
            OWNED WARP PIPES ({myBusinesses.length} / 3)
          </span>
          {myBusinesses.length > 0 ? (
            myBusinesses.map(biz => (
              <div key={biz.id} className="p-3 rounded-xl bg-[#101014] border border-[#3D3234] flex items-center justify-between text-xs">
                <div>
                  <strong className="font-pixel text-[9px] text-[#FDF6E2] block">{biz.name}</strong>
                  <span className="font-arcade text-xs text-[#A89F91]">Level {biz.level} · {formatCurrency(biz.cost)}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#5C94FC]/20 text-[#5C94FC] font-pixel text-[8px]">
                  {biz.level === 0 ? '★' : `★${biz.level + 1}`}
                </span>
              </div>
            ))
          ) : (
            <p className="font-arcade text-xs text-[#A89F91]">No warp pipes acquired yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

