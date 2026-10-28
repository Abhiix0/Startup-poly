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
  onOpenPitchTimer?: () => void;
  onOpenWildcard?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  lastUndoLabel?: string;
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
  onOpenPitchTimer,
  onOpenWildcard,
  onUndo,
  canUndo = false,
  lastUndoLabel,
  disabled = false,
}) => {
  return (
    <div className="bg-brand-navy border-4 border-brand-navy p-3 sm:p-4 shadow-pixel flex flex-col gap-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b-2 border-white/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <span className="font-pixel text-[11px] text-brand-gold uppercase tracking-wider font-bold">
            RAPID ACTIONS
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[10px] text-neutral-300">
          Keyboard shortcuts shown in brackets
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-2.5 [&>button]:min-h-11 [&>button]:justify-center [&>button]:text-center [&>button]:leading-tight">
        {/* BOARD OPERATIONS */}
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenRent}
          title="Calculate rent on visiting another team's business (Hotkey: R)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-3 py-2 bg-brand-gold text-brand-navy font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>🏠</span> RENT (R)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenStartLap}
          title="Pass or land on START: +₹200 cash (Hotkey: S)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-3 py-2 bg-brand-green text-white font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>🏁</span> START LAP (S)
        </button>

        {/* BUSINESS OPERATIONS */}
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenBuy}
          title="Acquire an unowned business from catalog (Hotkey: B)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-white text-brand-navy font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>🛒</span> BUY (B)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenUpgrade}
          title="Upgrade owned business level (Hotkey: U)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-white text-brand-navy font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>⭐</span> UPGRADE (U)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenForcedSale}
          title="Liquidate owned business for 100% original purchase cost to pay debt"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-neutral-200 text-brand-navy font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>🔨</span> FORCED SALE
        </button>

        {/* SPECIAL INTERACTIONS & CHITS */}
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenSteal}
          title="Action D: Take ₹100 from target team (Hotkey: T)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-neutral-200 text-brand-navy font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>🥷</span> STEAL TALENT (T)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenBonusCard}
          title="Bonus card 1–6 quick resolver (Hotkey: C)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-sky-600 text-white font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>🎁</span> BONUS CARD (C)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenCrisisCard}
          title="Crisis card 1–6 penalty resolver (Hotkey: X)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-brand-red text-white font-bold
            border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>💥</span> CRISIS CARD (X)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenLoseFeature}
          title="Action C: Pay ₹200 cash to the Bank (Hotkey: L)"
          className="
            font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-neutral-800 text-neutral-200 font-bold
            border-2 border-neutral-600 shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
            hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-1
          "
        >
          <span>📉</span> LOSE FEATURE (L)
        </button>

        {onOpenPitchTimer && (
          <button
            type="button"
            onClick={onOpenPitchTimer}
            title="Action B / Tiebreak 30-second presentation clock (Hotkey: P)"
            className="
              font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-sky-500 text-brand-navy font-bold
              border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
              hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all flex items-center gap-1
            "
          >
            <span>🎤</span> PITCH (P)
          </button>
        )}

        {onOpenWildcard && (
          <button
            type="button"
            onClick={onOpenWildcard}
            title="Draw random physical task for Wildcard space (Hotkey: W)"
            className="
              font-pixel text-[10px] sm:text-xs uppercase px-2.5 py-2 bg-purple-600 text-white font-bold
              border-2 border-brand-navy shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
              hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all flex items-center gap-1
            "
          >
            <span>🎲</span> WILDCARD (W)
          </button>
        )}

        {canUndo && onUndo && (
          <button
            type="button"
            onClick={onUndo}
            title={`Undo: ${lastUndoLabel || 'last action'} (Hotkey: Ctrl+Z)`}
            className="
              font-pixel text-[10px] sm:text-xs uppercase px-3.5 py-2 bg-brand-red text-white font-bold
              border-2 border-brand-gold shadow-[0_3px_0_var(--color-brand-navy)] hover:shadow-[0_4px_0_var(--color-brand-navy)]
              hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all
              flex items-center gap-1.5 animate-pulse
            "
          >
            <span>↩️</span> UNDO ({lastUndoLabel || 'LAST'}) [Ctrl+Z]
          </button>
        )}
      </div>
    </div>
  );
};
