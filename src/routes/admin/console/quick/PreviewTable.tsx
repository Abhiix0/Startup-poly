import React, { useState } from 'react';
import { QuickActionPreview } from '../../../../domain/quickActions';

export interface PreviewTableProps {
  preview: QuickActionPreview;
  isTimeExpired: boolean;
  note: string;
  onNoteChange: (val: string) => void;
  onAdjustAmount?: (teamId: string, cashDelta: number, cvDelta: number) => void;
  onDoForcedSale?: (teamId: string, shortfall: number) => void;
  onDeclareBankrupt?: (teamId: string) => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  preview,
  isTimeExpired,
  note,
  onNoteChange,
  onAdjustAmount,
  onDoForcedSale,
  onDeclareBankrupt,
}) => {
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Rulebook Explanation Box */}
      <div className="bg-[#FFFBEB] border-2 border-[#102040] p-2.5 flex items-center justify-between gap-2 shadow-[1px_1px_0px_#102040]">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px] text-[#92400E] font-bold">
            RULE:
          </span>
          <span className="font-mono text-xs text-[#102040]">
            {preview.ruleExplanation}
          </span>
        </div>

        {onAdjustAmount && (
          <button
            type="button"
            onClick={() => setIsAdjusting(!isAdjusting)}
            className="font-pixel text-[9px] uppercase px-2 py-1 bg-white text-[#102040] border border-[#102040] hover:bg-[#FFCC00] cursor-pointer"
          >
            {isAdjusting ? 'HIDE ADJUST' : 'ADJUST AMOUNTS'}
          </button>
        )}
      </div>

      {/* Before / After Table */}
      <div className="border-2 border-[#102040] overflow-hidden shadow-[2px_2px_0px_#102040]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#102040] text-white font-pixel text-[10px] uppercase">
              <th className="p-2 border-r border-white/20">TEAM</th>
              <th className="p-2 border-r border-white/20">CASH (BEFORE → AFTER)</th>
              <th className="p-2">CV (BEFORE → AFTER)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CBD5E1] bg-white font-mono">
            {preview.changes.map((ch) => {
              const cashPositive = ch.cashDelta >= 0;
              const cvPositive = ch.cvDelta >= 0;

              return (
                <tr key={ch.teamId} className="hover:bg-[#FAF8F5]">
                  {/* Team cell */}
                  <td className="p-2 border-r border-[#CBD5E1]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 border border-[#102040] flex-shrink-0"
                        style={{ backgroundColor: ch.teamColor }}
                      />
                      <span className="font-sans font-bold text-xs text-[#102040] truncate">
                        {ch.teamName}
                      </span>
                    </div>
                  </td>

                  {/* Cash Change cell */}
                  <td className="p-2 border-r border-[#CBD5E1]">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[#64748B]">
                        ₹{ch.cashBefore.toLocaleString('en-IN')} → ₹{ch.cashAfter.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`px-1 py-0.5 border text-[11px] font-bold ${
                          cashPositive
                            ? 'bg-[#E8F8EE] text-[#22B14C] border-[#22B14C]'
                            : 'bg-[#FEECEB] text-[#D32F2F] border-[#D32F2F]'
                        }`}
                      >
                        {cashPositive ? `+₹${ch.cashDelta.toLocaleString('en-IN')}` : `−₹${Math.abs(ch.cashDelta).toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    {/* Manual override input if adjustment toggle open */}
                    {isAdjusting && onAdjustAmount && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[10px] text-[#64748B]">Delta:</span>
                        <input
                          type="number"
                          value={ch.cashDelta}
                          onChange={(e) =>
                            onAdjustAmount(ch.teamId, parseInt(e.target.value, 10) || 0, ch.cvDelta)
                          }
                          className="w-20 px-1 py-0.5 border border-[#102040] text-xs font-bold"
                        />
                      </div>
                    )}
                  </td>

                  {/* CV Change cell */}
                  <td className="p-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[#64748B]">
                        ₹{ch.cvBefore.toLocaleString('en-IN')} → ₹{ch.cvAfter.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`px-1 py-0.5 border text-[11px] font-bold ${
                          cvPositive
                            ? 'bg-[#E8F8EE] text-[#22B14C] border-[#22B14C]'
                            : 'bg-[#FEECEB] text-[#D32F2F] border-[#D32F2F]'
                        }`}
                      >
                        {cvPositive ? `+₹${ch.cvDelta.toLocaleString('en-IN')}` : `−₹${Math.abs(ch.cvDelta).toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    {/* Manual override input if adjustment toggle open */}
                    {isAdjusting && onAdjustAmount && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[10px] text-[#64748B]">Delta:</span>
                        <input
                          type="number"
                          value={ch.cvDelta}
                          onChange={(e) =>
                            onAdjustAmount(ch.teamId, ch.cashDelta, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-20 px-1 py-0.5 border border-[#102040] text-xs font-bold"
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Shortfall Warning & Redirection */}
      {preview.hasShortfall && preview.shortfallTeam && (
        <div className="bg-[#FEECEB] border-2 border-[#D32F2F] p-3 shadow-[2px_2px_0px_#D32F2F] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div>
            <span className="font-pixel text-xs text-[#D32F2F] font-bold block">
              ⚠ PAYMENT SHORTFALL
            </span>
            <p className="font-sans text-xs text-[#102040] mt-0.5">
              <strong>{preview.shortfallTeam.name}</strong> has insufficient cash (short by <strong>₹{preview.shortfallTeam.shortfall.toLocaleString('en-IN')}</strong>).
              Rulebook requires a forced sale before this action can proceed.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onDoForcedSale && (
              <button
                type="button"
                onClick={() =>
                  onDoForcedSale(preview.shortfallTeam!.id, preview.shortfallTeam!.shortfall)
                }
                className="font-pixel text-xs uppercase px-3 py-1.5 bg-[#D32F2F] text-white border-2 border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#B71C1C] cursor-pointer"
              >
                DO FORCED SALE FIRST
              </button>
            )}
            {onDeclareBankrupt && (
              <button
                type="button"
                onClick={() => onDeclareBankrupt(preview.shortfallTeam!.id)}
                className="font-pixel text-xs uppercase px-3 py-1.5 bg-[#FAF8F5] text-[#D32F2F] border-2 border-[#D32F2F] hover:bg-[#FEECEB] cursor-pointer"
              >
                BANKRUPTCY
              </button>
            )}
          </div>
        </div>
      )}

      {/* Note input for post-match adjustments */}
      {isTimeExpired && (
        <div className="flex flex-col gap-1">
          <label className="font-pixel text-[10px] uppercase text-[#D32F2F] font-bold">
            ⚠ NOTE REQUIRED (GAME OVER ADJUSTMENT)
          </label>
          <input
            type="text"
            required
            placeholder="Reason for post-game adjustment..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full px-2.5 py-1.5 font-sans text-xs text-[#102040] bg-white border-2 border-[#102040] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
          />
        </div>
      )}
    </div>
  );
};
