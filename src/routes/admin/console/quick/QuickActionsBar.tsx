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
    <div className="bg-[#102040] border-3 border-[#102040] p-2.5 shadow-[3px_3px_0px_#102040] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[11px] text-[#FFCC00] uppercase tracking-wider">
          ⚡ QUICK ACTIONS (CALCULATOR)
        </span>
        <span className="hidden sm:inline font-mono text-[10px] text-[#94A3B8]">
          Hotkeys: [R] Rent • [S] Start • [B] Buy • [U] Upgrade
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenRent}
          className="
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#FFCC00] text-[#102040]
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#FFE066]
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#22B14C] text-white
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#1C8D3D]
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#FAF8F5] text-[#102040]
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-white
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#FAF8F5] text-[#102040]
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-white
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#EAE5D9] text-[#102040]
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#FFCC00]
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#EAE5D9] text-[#102040]
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#FFCC00]
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#5C94FC] text-white
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#407BEE]
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#D32F2F] text-white
            border border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#B71C1C]
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
            font-pixel text-[10px] uppercase px-2.5 py-1.5 bg-[#1E293B] text-[#94A3B8]
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
