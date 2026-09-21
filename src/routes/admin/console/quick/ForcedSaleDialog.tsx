import React, { useState, useEffect } from 'react';
import { Modal, PixelButton } from '../../../../ui';
import { TeamState } from '../../../../domain/quickActions';

export interface ForcedSaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamState[];
  defaultTeamId?: string;
  shortfallTarget?: number;
  isTimeExpired: boolean;
  onSellBusiness: (params: {
    teamId: string;
    businessKey: string;
    expectedVersion: number;
    note?: string;
  }) => Promise<void>;
  onDeclareBankrupt?: (teamId: string) => void;
}

export const ForcedSaleDialog: React.FC<ForcedSaleDialogProps> = ({
  isOpen,
  onClose,
  teams,
  defaultTeamId,
  shortfallTarget,
  isTimeExpired,
  onSellBusiness,
  onDeclareBankrupt,
}) => {
  const [teamId, setTeamId] = useState<string>(defaultTeamId || teams[0]?.id || '');
  const [sellingKey, setSellingKey] = useState<string | null>(null);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTeamId(defaultTeamId || teams[0]?.id || '');
      setSellingKey(null);
      setNote('');
      setError(null);
    }
  }, [isOpen, defaultTeamId, teams]);

  const team = teams.find((t) => t.id === teamId);

  const handleSell = async (businessKey: string) => {
    if (!team) return;
    if (isTimeExpired && !note.trim()) {
      setError('Note is required for post-game forced sales.');
      return;
    }

    try {
      setSellingKey(businessKey);
      setError(null);
      await onSellBusiness({
        teamId: team.id,
        businessKey,
        expectedVersion: team.version,
        note: note.trim() || undefined,
      });
      setSellingKey(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute forced sale.');
      setSellingKey(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="FORCED SALE / ASSET LIQUIDATION"
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        {/* Team Selector */}
        <div className="flex flex-col gap-1">
          <label className="font-pixel text-[11px] uppercase tracking-wider text-[#102040]">
            Liquidating Team
          </label>
          <select
            value={teamId}
            onChange={(e) => {
              setTeamId(e.target.value);
              setError(null);
            }}
            className="p-2 border-2 border-[#102040] bg-white font-sans text-xs font-bold text-[#102040] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.slot}: {t.name} (Cash: ₹{t.cash.toLocaleString('en-IN')}, {t.businesses.length} businesses)
              </option>
            ))}
          </select>
        </div>

        {/* Shortfall & Rulebook Box */}
        <div className="bg-[#FFFBEB] border-2 border-[#102040] p-3 shadow-[1px_1px_0px_#102040] flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-[#92400E] font-bold">
              RULEBOOK LIQUIDATION:
            </span>
            {shortfallTarget && team && (
              <span className="font-mono text-xs font-bold text-[#D32F2F] bg-[#FEECEB] px-2 py-0.5 border border-[#D32F2F]">
                Shortfall Target: ₹{shortfallTarget.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-[#102040]">
            When a team cannot pay rent, fees, or crisis debts, they must surrender businesses back to the Bank.
            The bank credits the base purchase cost of the business to the team's cash.
          </p>
          {team && (
            <div className="font-mono text-xs pt-1 border-t border-[#CBD5E1] flex items-center justify-between">
              <span>Current Cash: <strong>₹{team.cash.toLocaleString('en-IN')}</strong></span>
              {shortfallTarget !== undefined && (
                <span>
                  {team.cash >= shortfallTarget ? (
                    <span className="text-[#22B14C] font-bold">✓ Shortfall covered!</span>
                  ) : (
                    <span className="text-[#D32F2F] font-bold">
                      Still needs ₹{(shortfallTarget - team.cash).toLocaleString('en-IN')}
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Note input if time expired */}
        {isTimeExpired && (
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] uppercase text-[#D32F2F] font-bold">
              ⚠ Note Required (Post-Game Adjustment) *
            </label>
            <input
              type="text"
              required
              placeholder="Reason for post-game forced sale..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-1.5 font-sans text-xs text-[#102040] bg-white border-2 border-[#102040] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
            />
          </div>
        )}

        {/* Businesses List */}
        {team && (
          <div className="flex flex-col gap-2">
            <label className="font-pixel text-[11px] uppercase tracking-wider text-[#102040]">
              Owned Businesses ({team.businesses.length} / 3)
            </label>

            {team.businesses.length === 0 ? (
              <div className="bg-[#FAF8F5] border-2 border-dashed border-[#CBD5E1] p-4 text-center">
                <p className="font-mono text-xs text-[#64748B]">
                  This team has no businesses to sell.
                </p>
                {onDeclareBankrupt && (
                  <div className="mt-3">
                    <PixelButton
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        onDeclareBankrupt(team.id);
                        onClose();
                      }}
                    >
                      DECLARE BANKRUPTCY
                    </PixelButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {team.businesses.map((biz) => {
                  const isSelling = sellingKey === biz.business_key;
                  return (
                    <div
                      key={biz.business_key}
                      className="border-2 border-[#102040] bg-white p-2.5 flex items-center justify-between shadow-[2px_2px_0px_#102040]"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-xs text-[#102040]">
                            {biz.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#FAF8F5] border border-[#CBD5E1]">
                            L{biz.level}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-[#64748B]">
                          Base cost: ₹{biz.cost.toLocaleString('en-IN')} → Resale payout: +₹{biz.cost.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <PixelButton
                        variant="danger"
                        size="sm"
                        isLoading={isSelling}
                        disabled={sellingKey !== null || (isTimeExpired && !note.trim())}
                        onClick={() => handleSell(biz.business_key)}
                      >
                        SELL (+₹{biz.cost.toLocaleString('en-IN')})
                      </PixelButton>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {error && (
          <span className="font-mono text-xs text-[#D32F2F] font-bold">
            ⚠ {error}
          </span>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-[#102040]">
          <div>
            {onDeclareBankrupt && team && (
              <button
                type="button"
                onClick={() => {
                  onDeclareBankrupt(team.id);
                  onClose();
                }}
                className="font-pixel text-[10px] uppercase text-[#D32F2F] hover:underline cursor-pointer"
              >
                Declare Bankruptcy Instead
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-pixel text-xs uppercase px-4 py-2 bg-white text-[#102040] border-2 border-[#102040] shadow-[1px_1px_0px_#102040] hover:bg-[#EAE5D9] cursor-pointer"
          >
            DONE / CLOSE (Esc)
          </button>
        </div>
      </div>
    </Modal>
  );
};
