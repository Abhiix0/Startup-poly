import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber } from '../../constants/theme';
import { X, Lock, Unlock, ShieldAlert, Plus, Trash2, Sliders } from 'lucide-react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const { state, updateSettings } = useGame();
  const [unlocked, setUnlocked] = useState<boolean>(!state.settings.rulesLocked);
  const [challenges, setChallenges] = useState<string[]>([...state.settings.wildcardChallenges]);
  const [newChallenge, setNewChallenge] = useState<string>('');

  if (!isOpen) return null;

  const toggleLock = () => {
    const nextLocked = !unlocked;
    setUnlocked(nextLocked);
    updateSettings({ rulesLocked: !nextLocked });
  };

  const handleAddChallenge = () => {
    if (newChallenge.trim()) {
      const updated = [...challenges, newChallenge.trim()];
      setChallenges(updated);
      updateSettings({ wildcardChallenges: updated });
      setNewChallenge('');
    }
  };

  const handleRemoveChallenge = (idx: number) => {
    const updated = challenges.filter((_, i) => i !== idx);
    setChallenges(updated);
    updateSettings({ wildcardChallenges: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] eqx-card-elevated flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-[#141416] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${unlocked ? 'bg-[#FF5C7A]/15 border-[#FF5C7A]/30 text-[#FF5C7A]' : 'bg-[#7484FE]/15 border-[#7484FE]/30 text-[#7484FE]'}`}>
              {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                RULES & ECONOMICS CONFIGURATION
              </h2>
              <p className="text-xs text-white/50">
                Tournament economics database and wildcard challenges pool.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#19191C] hover:bg-[#202024] text-white/60 hover:text-white border border-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Lock / Unlock Safety Barrier */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            unlocked 
              ? 'bg-[#FF5C7A]/10 border-[#FF5C7A]/30 text-[#FF5C7A]' 
              : 'bg-[#141416] border-white/5 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="text-xs uppercase font-bold block">
                  {unlocked ? 'RULES UNLOCKED (EDIT MODE)' : 'RULES LOCKED (TOURNAMENT SAFETY)'}
                </strong>
                <span className="text-xs text-white/60">
                  {unlocked ? 'Referee overrides enabled.' : 'Unlock to modify venture economics or wildcard challenges.'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleLock}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase transition cursor-pointer ${
                unlocked
                  ? 'btn-eqx-danger'
                  : 'btn-eqx-primary'
              }`}
            >
              {unlocked ? 'LOCK RULES' : 'UNLOCK RULES'}
            </button>
          </div>

          {/* Business Economics Reference */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-white/50">
              10 ENTERPRISE ECONOMICS DATABASE
            </h3>
            <div className="space-y-2">
              {state.businesses.map(biz => (
                <div 
                  key={biz.id}
                  className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <strong className="text-white block font-bold">{biz.name}</strong>
                    <span className="text-white/50 text-[11px]">{biz.category}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-white/40 block">COST</span>
                      <span className="font-bold text-white">{formatCurrency(biz.cost)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block">BASE CV</span>
                      <span className="font-bold text-[#7484FE]">+{biz.baseCv}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block">U1</span>
                      <span className="text-white/70">{formatCurrency(biz.u1Cost)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block">U2</span>
                      <span className="text-white/70">{formatCurrency(biz.u2Cost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wildcard Challenges Configurator */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-white/50">
              WILDCARD CHALLENGES POOL
            </h3>

            <div className="space-y-2">
              {challenges.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 flex items-center justify-between gap-3 text-xs">
                  <span className="text-white/90">{c}</span>
                  {unlocked && (
                    <button
                      onClick={() => handleRemoveChallenge(idx)}
                      className="p-1.5 rounded-lg bg-[#FF5C7A]/20 text-[#FF5C7A] hover:bg-[#FF5C7A]/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {unlocked && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter new challenge text…"
                  value={newChallenge}
                  onChange={(e) => setNewChallenge(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder:text-white/30"
                />
                <button
                  onClick={handleAddChallenge}
                  className="px-4 py-2.5 btn-eqx-green text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#141416] flex justify-end">
          <button
            onClick={onClose}
            className="btn-eqx-secondary px-5 py-2.5 text-xs font-semibold"
          >
            CLOSE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
