import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../constants/theme';
import { RotateCcw, X } from 'lucide-react';

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
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#3D3234]">
        <div>
          <h2 className="font-pixel text-sm text-[#FBD000]">
            ACTIVITY & AUDIT LOG
          </h2>
          <span className="font-arcade text-xs text-[#A89F91]">
            {state.transactions.length} Total World Events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!canUndo}
            onClick={undoAction}
            className="px-3 py-1.5 rounded-lg bg-[#E52521]/20 hover:bg-[#E52521]/30 border border-[#E52521] disabled:opacity-30 text-[#E52521] font-pixel text-[9px] flex items-center gap-1.5 transition cursor-pointer shadow-[2px_2px_0px_#000]"
            title="Undo last action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            UNDO
          </button>

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#262022] text-[#A89F91] hover:text-[#FDF6E2] border border-[#3D3234] cursor-pointer"
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
            className="p-3.5 rounded-xl bg-[#101014] border border-[#3D3234] flex items-start justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[9px] text-[#FDF6E2]">{tx.teamName}</span>
                <span className="font-arcade text-[10px] text-[#A89F91]">{tx.timeFormatted}</span>
              </div>
              <p className="font-arcade text-xs text-[#A89F91] leading-snug">
                {tx.description}
              </p>
            </div>

            {(tx.cashDelta !== undefined || tx.cvDelta !== undefined) && (
              <div className="text-right flex-shrink-0 font-pixel">
                {tx.cashDelta !== undefined && (
                  <span className={`block text-[10px] ${tx.cashDelta >= 0 ? 'text-[#43B047]' : 'text-[#E52521]'}`}>
                    {tx.cashDelta >= 0 ? '+' : ''}{formatCurrency(tx.cashDelta)}
                  </span>
                )}
                {tx.cvDelta !== undefined && (
                  <span className={`block text-[9px] ${tx.cvDelta >= 0 ? 'text-[#5C94FC]' : 'text-[#E52521]'}`}>
                    {tx.cvDelta >= 0 ? '+' : ''}{tx.cvDelta} CV
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
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end select-none">
        <div className="w-full max-w-[420px] bg-[#1B1718] border-l-3 border-[#FDF6E2] h-full overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-right duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

