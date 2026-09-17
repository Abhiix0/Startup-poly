import React from 'react';
import { CardDefinition } from '../../types/game';
import { X, Sparkles, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

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
  actionButtonText = 'ACKNOWLEDGE',
}) => {
  const isBonus = cardType === 'bonus' || (card && card.type === 'bonus');
  const title = customTitle || card?.name || 'Investor Milestone';
  const description = customDescription || card?.effectText || card?.description || 'Grant received from angel investor.';

  const themeColor = isBonus ? '#33FF67' : '#FF5C7A';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      {/* Main Modal Card */}
      <div className="w-full max-w-[380px] eqx-card-elevated p-6 space-y-4 rounded-3xl relative animate-in zoom-in-95 duration-200 text-center border-white/15">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#19191C] border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-[#202024] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Icon */}
        <div 
          className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center border shadow-lg"
          style={{ 
            backgroundColor: `${themeColor}15`, 
            borderColor: `${themeColor}40`,
            color: themeColor
          }}
        >
          {isBonus ? <Sparkles className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>

        {/* Card Type Badge */}
        <div 
          className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border"
          style={{ 
            backgroundColor: `${themeColor}15`, 
            borderColor: `${themeColor}30`,
            color: themeColor 
          }}
        >
          {isBonus ? 'BONUS ADVANTAGE CARD' : 'CRISIS RISK CARD'}
        </div>

        {/* Title */}
        <h2 className="text-base font-bold text-white pt-1">
          {title}
        </h2>

        {/* Description Box */}
        <div className="p-4 rounded-2xl bg-[#141416] border border-white/5">
          <p className="text-xs text-white/80 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (onAction) onAction();
            onClose();
          }}
          className={`w-full py-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer mt-2 transition ${
            isBonus ? 'btn-eqx-green' : 'btn-eqx-danger'
          }`}
        >
          <span>{actionButtonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
