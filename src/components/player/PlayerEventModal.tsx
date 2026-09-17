import React from 'react';
import { CardDefinition } from '../../types/game';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

interface PlayerEventModalProps {
  card?: CardDefinition | null;
  customTitle?: string;
  customDescription?: string;
  cardType?: 'bonus' | 'crisis' | 'action';
  onClose: () => void;
  onAction?: () => void;
  actionButtonText?: string;
}

export const PlayerEventModal: React.FC<PlayerEventModalProps> = ({
  card,
  customTitle,
  customDescription,
  cardType = 'bonus',
  onClose,
  onAction,
  actionButtonText = 'COLLECT',
}) => {
  const isBonus = cardType === 'bonus' || (card && card.type === 'bonus');
  const title = customTitle || card?.name || 'Investor Visit!';
  const description = customDescription || card?.effectText || card?.description || 'Receive ₹ 500 from the Bank.';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      {/* Background Floating Question Mark Blocks (Screen 5) */}
      <div className="absolute top-12 left-10 text-3xl opacity-70 pointer-events-none animate-block-jump">❓</div>
      <div className="absolute top-16 right-12 text-3xl opacity-70 pointer-events-none animate-star-pulse">⭐</div>
      <div className="absolute bottom-20 left-14 text-2xl opacity-50 pointer-events-none">🍄</div>
      <div className="absolute bottom-16 right-16 text-3xl opacity-70 pointer-events-none animate-block-jump">❓</div>

      {/* Main Yellow Parchment Modal Card (Screen 5) */}
      <div className="w-full max-w-[360px] mario-card p-6 space-y-4 rounded-3xl relative animate-in zoom-in-95 duration-200 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-white border-2 border-black rounded-full text-black hover:bg-slate-100 shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Star Badge (Screen 5) */}
        <div className="w-20 h-20 mx-auto bg-[#FBD000] border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] relative">
          <span className="text-4xl animate-star-pulse">
            {isBonus ? '⭐' : '💣'}
          </span>
          <div className="absolute -top-1 -right-1">
            <span className="text-base animate-ping">✨</span>
          </div>
        </div>

        {/* Card Type Badge */}
        <div className="inline-block px-3 py-1 rounded-full border-2 border-black font-pixel text-[9px] shadow-[2px_2px_0px_#000] uppercase tracking-wider bg-white text-black">
          {isBonus ? '🍄 BONUS CARD' : '💣 CRISIS HAZARD'}
        </div>

        {/* Title */}
        <h2 className="font-pixel text-base text-black pt-1">
          {title}
        </h2>

        {/* Description Box */}
        <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
          <p className="font-arcade text-sm text-slate-800 font-bold leading-relaxed">
            {description}
          </p>
        </div>

        {/* Big 3D Green Arcade Button (Screen 5) */}
        <button
          onClick={() => {
            if (onAction) onAction();
            onClose();
          }}
          className="w-full btn-mario-green text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <span>{actionButtonText}</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
