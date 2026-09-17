import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency, formatNumber } from '../../constants/theme';
import { RotateCcw, X, Activity } from 'lucide-react';

interface AdminActivityLogProps {
  onClose?: () => void;
  isDrawer?: boolean;
}

export const AdminActivityLog: React.FC<AdminActivityLogProps> = ({ onClose, isDrawer = false }) => {
  const { state, undoAction } = useGame();
  const transactions = state.transactions.slice().reverse();
  const canUndo = state.transactions.length > 1;

  const content = (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            ACTIVITY & AUDIT LOG
          </h2>
          <span className="text-xs text-white/50">
            {state.transactions.length} Total Tournament Events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!canUndo}
            onClick={undoAction}
            className="px-3 py-1.5 rounded-xl bg-[#FF5C7A]/15 hover:bg-[#FF5C7A]/25 border border-[#FF5C7A]/30 disabled:opacity-30 text-[#FF5C7A] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Undo last action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>UNDO LAST</span>
          </button>

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#202024] text-white/50 hover:text-white border border-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
        {transactions.map(tx => (
          <div
            key={tx.id}
            className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 flex items-start justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{tx.teamName}</span>
                <span className="font-mono text-[10px] text-white/40">{tx.timeFormatted}</span>
              </div>
              <p className="text-xs text-white/70 leading-snug">
                {tx.description}
              </p>
            </div>

            {(tx.cashDelta !== undefined || tx.cvDelta !== undefined) && (
              <div className="text-right flex-shrink-0 font-mono">
                {tx.cashDelta !== undefined && (
                  <span className={`block text-xs font-bold ${tx.cashDelta >= 0 ? 'text-[#33FF67]' : 'text-[#FF5C7A]'}`}>
                    {tx.cashDelta >= 0 ? '+' : ''}{formatCurrency(tx.cashDelta)}
                  </span>
                )}
                {tx.cvDelta !== undefined && (
                  <span className={`block text-[11px] font-bold ${tx.cvDelta >= 0 ? 'text-[#7484FE]' : 'text-[#FF5C7A]'}`}>
                    {tx.cvDelta >= 0 ? '+' : ''}{formatNumber(tx.cvDelta)} CV
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end select-none">
        <div className="w-full max-w-[420px] bg-[#19191C] border-l border-white/10 h-full overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-right duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
