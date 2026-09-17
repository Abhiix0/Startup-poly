import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber, TEAM_METAS } from '../../constants/theme';
import { X, Sliders, Building2, Coins, ArrowUpRight } from 'lucide-react';

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

  const meta = TEAM_METAS[team.number] || TEAM_METAS[1];
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end select-none">
      <div className="w-full max-w-[420px] bg-[#19191C] border-l border-white/10 h-full overflow-y-auto p-6 space-y-5 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border"
              style={{ 
                backgroundColor: meta.badgeBg, 
                color: meta.color,
                borderColor: `${meta.color}40`
              }}
            >
              T0{team.number}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {team.name}
              </h2>
              <span className="text-xs text-white/50">
                Game Master Override Controls
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202024] hover:bg-[#28282E] text-white/50 hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-xl bg-[#141416] border border-white/5 font-mono">
            <span className="text-[10px] uppercase font-bold text-white/40 block mb-0.5">CASH BALANCE</span>
            <span className="text-base font-bold text-[#33FF67]">{formatCurrency(team.cash)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141416] border border-white/5 font-mono">
            <span className="text-[10px] uppercase font-bold text-white/40 block mb-0.5">VALUATION</span>
            <span className="text-base font-bold text-[#7484FE]">{formatNumber(team.cv)} CV</span>
          </div>
        </div>

        {/* Quick Cash Adjustments */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
            QUICK CASH ADJUSTMENT (₹)
          </span>
          <div className="grid grid-cols-4 gap-1.5 font-mono">
            {[+100, +200, -100, -200].map(val => (
              <button
                key={val}
                onClick={() => applyAdjustment(val, 0, `Manual cash ${val > 0 ? '+' : ''}${val}`)}
                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  val > 0 
                    ? 'bg-[#33FF67]/10 border-[#33FF67]/30 text-[#33FF67] hover:bg-[#33FF67]/20' 
                    : 'bg-[#FF5C7A]/10 border-[#FF5C7A]/30 text-[#FF5C7A] hover:bg-[#FF5C7A]/20'
                }`}
              >
                {val > 0 ? `+₹${val}` : `−₹${Math.abs(val)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Quick CV Adjustments */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
            QUICK VALUATION ADJUSTMENT (CV)
          </span>
          <div className="grid grid-cols-4 gap-1.5 font-mono">
            {[+100, +200, -100, -200].map(val => (
              <button
                key={val}
                onClick={() => applyAdjustment(0, val, `Manual CV ${val > 0 ? '+' : ''}${val}`)}
                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  val > 0 
                    ? 'bg-[#7484FE]/10 border-[#7484FE]/30 text-[#7484FE] hover:bg-[#7484FE]/20' 
                    : 'bg-[#FF5C7A]/10 border-[#FF5C7A]/30 text-[#FF5C7A] hover:bg-[#FF5C7A]/20'
                }`}
              >
                {val > 0 ? `+${val}` : `−${Math.abs(val)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-[#141416] border border-white/5 space-y-3 text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 block">CUSTOM OVERRIDE ENTRY</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Cash (+/-)"
              value={customCash}
              onChange={(e) => setCustomCash(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#19191C] border border-white/10 text-xs text-white placeholder:text-white/30 font-mono"
            />
            <input
              type="number"
              placeholder="CV (+/-)"
              value={customCv}
              onChange={(e) => setCustomCv(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#19191C] border border-white/10 text-xs text-white placeholder:text-white/30 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full btn-eqx-primary py-2.5 text-xs font-semibold cursor-pointer"
          >
            EXECUTE OVERRIDE
          </button>
        </form>

        {/* Ventures List */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
            OWNED ENTERPRISES ({myBusinesses.length} / 3)
          </span>
          {myBusinesses.length > 0 ? (
            myBusinesses.map(biz => (
              <div key={biz.id} className="p-3 rounded-xl bg-[#141416] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-white font-semibold block">{biz.name}</strong>
                  <span className="text-[11px] text-white/50">Level {biz.level} · {formatCurrency(biz.cost)}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#7484FE]/15 text-[#7484FE] border border-[#7484FE]/30 font-mono text-[10px]">
                  TIER {biz.level + 1}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-white/40 italic">No enterprises acquired yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
