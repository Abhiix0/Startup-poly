import React from 'react';

export interface QuickActionsBarProps {
  onOpenRent: () => void;
  onOpenStartLap: () => void;
  onOpenBuy: () => void;
  onOpenUpgrade: () => void;
  onOpenForcedSale: () => void;
  onOpenSteal: () => void;
  onOpenBonusCard: () => void;
  onOpenCrisisCard: () => void;
  onOpenLoseFeature: () => void;
  disabled?: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onOpenRent,
  onOpenStartLap,
  onOpenBuy,
  onOpenUpgrade,
  onOpenForcedSale,
  onOpenSteal,
  onOpenBonusCard,
  onOpenCrisisCard,
  onOpenLoseFeature,
  disabled = false,
}) => {
  return (
    <div className="bg-brand-navy border-3 border-brand-navy p-2.5 shadow-pixel-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[11px] text-brand-gold uppercase tracking-wider">
          ⚡ QUICK ACTIONS (CALCULATOR)
        </span>
        <span className="hidden sm:inline font-mono text-[10px] text-neutral-400">
          Hotkeys: [R] Rent • [S] Start • [B] Buy • [U] Upgrade
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenRent}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-gold text-brand-navy
            border border-brand-navy shadow-pixel-sm hover:bg-interactive-gold-hover
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          RENT (R)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenStartLap}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-green text-brand-white
            border border-brand-navy shadow-pixel-sm hover:bg-interactive-green-hover
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          START LAP (S)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenBuy}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-cream text-brand-navy
            border border-brand-navy shadow-pixel-sm hover:bg-brand-white
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          BUY (B)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenUpgrade}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-cream text-brand-navy
            border border-brand-navy shadow-pixel-sm hover:bg-brand-white
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          UPGRADE (U)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenForcedSale}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-neutral-200 text-brand-navy
            border border-brand-navy shadow-pixel-sm hover:bg-brand-gold
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          FORCED SALE
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenSteal}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-neutral-200 text-brand-navy
            border border-brand-navy shadow-pixel-sm hover:bg-brand-gold
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          STEAL TALENT
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenBonusCard}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-sky text-brand-white
            border border-brand-navy shadow-pixel-sm hover:bg-interactive-blue-hover
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          BONUS CARD
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenCrisisCard}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-brand-red text-brand-white
            border border-brand-navy shadow-pixel-sm hover:bg-interactive-red-hover
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          CRISIS CARD
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenLoseFeature}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-neutral-800 text-neutral-400
            border border-white/20 hover:text-white
            active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          LOSE FEATURE
        </button>
      </div>
    </div>
  );
};
