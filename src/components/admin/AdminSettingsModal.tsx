import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatCoins, formatStars } from '../../constants/theme';
import { X, Lock, Unlock, ShieldAlert, Plus, Trash2 } from 'lucide-react';

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
      <div className="w-full max-w-2xl max-h-[90vh] nes-box bg-[#181820] border-4 border-black flex flex-col shadow-[6px_6px_0px_#000] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b-4 border-black bg-[#22222E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 nes-box border-2 border-black ${unlocked ? 'bg-[#E52521] text-white' : 'bg-[#FBD000] text-black'}`}>
              {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-pixel text-[#FBD000]">
                RULES & ECONOMICS CONFIG
              </h2>
              <p className="text-xs font-arcade text-gray-300">
                Configure Warp Pipe pricing and Mushroom Kingdom rules.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 nes-box bg-[#181820] hover:bg-[#E52521] text-gray-400 hover:text-white border-2 border-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Lock / Unlock Safety Barrier */}
          <div className={`p-4 nes-box border-2 border-black flex items-center justify-between ${
            unlocked 
              ? 'bg-[#E52521]/20 text-[#E52521]' 
              : 'bg-[#101014] text-white'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="text-[10px] font-pixel block">
                  {unlocked ? 'RULES UNLOCKED (EDIT MODE)' : 'RULES LOCKED (MATCH SAFETY)'}
                </strong>
                <span className="text-xs font-arcade text-gray-300">
                  {unlocked ? 'Organizer overrides enabled.' : 'Unlock to modify venture economics or challenges.'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleLock}
              className={`px-3 py-2 font-pixel text-[9px] uppercase transition ${
                unlocked
                  ? 'mario-btn-red text-white'
                  : 'mario-btn-gold text-black'
              }`}
            >
              {unlocked ? 'LOCK RULES' : 'UNLOCK RULES'}
            </button>
          </div>

          {/* Business Economics Reference */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-pixel text-[#FBD000]">
              🏭 10 WARP PIPE ECONOMICS DATABASE
            </h3>
            <div className="space-y-2">
              {state.businesses.map(biz => (
                <div 
                  key={biz.id}
                  className="p-3 nes-box bg-[#101014] border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <strong className="text-white block font-arcade font-bold text-sm">{biz.name}</strong>
                    <span className="text-gray-400 font-arcade text-[11px]">{biz.category}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-pixel text-[9px]">
                    <div>
                      <span className="text-[8px] text-gray-400 block">COST</span>
                      <span className="text-[#FBD000]">{formatCoins(biz.cost)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 block">BASE STAR</span>
                      <span className="text-[#5C94FC]">+{biz.baseCv}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 block">U1</span>
                      <span className="text-gray-300">{formatCoins(biz.u1Cost)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 block">U2</span>
                      <span className="text-gray-300">{formatCoins(biz.u2Cost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wildcard Challenges Configurator */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-pixel text-[#FBD000]">
              ❓ WILDCARD CHALLENGES POOL
            </h3>

            <div className="space-y-2">
              {challenges.map((c, idx) => (
                <div key={idx} className="p-3 nes-box bg-[#101014] border-2 border-black flex items-center justify-between gap-3 text-xs font-arcade">
                  <span className="text-white">{c}</span>
                  {unlocked && (
                    <button
                      onClick={() => handleRemoveChallenge(idx)}
                      className="p-1 nes-box bg-[#E52521] text-white border border-black hover:bg-[#FF3333]"
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
                  className="flex-1 px-3 py-2 nes-box bg-[#101014] border-2 border-black text-xs font-arcade text-white placeholder:text-gray-500"
                />
                <button
                  onClick={handleAddChallenge}
                  className="px-3 py-2 mario-btn-green text-black font-pixel text-[9px] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-black bg-[#22222E] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 mario-btn-dark text-white font-pixel text-[9px]"
          >
            CLOSE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
