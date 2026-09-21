import React, { useState, useEffect } from 'react';
import { StandingsRow } from '../../../data/rpc';
import { PixelButton } from '../../../ui';

export interface TieBreakOrderProps {
  tiedTeams: StandingsRow[];
  onSubmit: (orderedTeamIds: string[], note: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const TieBreakOrder: React.FC<TieBreakOrderProps> = ({
  tiedTeams,
  onSubmit,
  isSubmitting = false,
}) => {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrderedIds(tiedTeams.map((t) => t.team_id));
  }, [tiedTeams]);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setOrderedIds((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= orderedIds.length - 1) return;
    setOrderedIds((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('A judge pitch note is required explaining the tie-break decision.');
      return;
    }

    try {
      setError(null);
      await onSubmit(orderedIds, note.trim());
    } catch (err: any) {
      setError(err?.message || 'Failed to record tie-break order.');
    }
  };

  const tiedTeamMap = new Map(tiedTeams.map((t) => [t.team_id, t]));

  return (
    <div className="bg-[#FFFBEB] border-4 border-[#B45309] p-4 shadow-[4px_4px_0px_#B45309] flex flex-col gap-3">
      {/* Alert Header */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 bg-[#B45309] text-white flex items-center justify-center font-pixel text-xs">
          !
        </span>
        <div>
          <h3 className="font-pixel text-xs text-[#92400E] uppercase">
            Tied on CV, cash and businesses — record pitch result
          </h3>
          <p className="font-mono text-xs text-[#102040]">
            Rulebook §17: Conduct a 30-second physical pitch judged by the Game Master. Arrange the teams in winner order below.
          </p>
        </div>
      </div>

      {/* Reorder List */}
      <div className="flex flex-col gap-2">
        {orderedIds.map((id, index) => {
          const team = tiedTeamMap.get(id);
          if (!team) return null;

          return (
            <div
              key={id}
              className="bg-white border-2 border-[#102040] p-2.5 flex items-center justify-between shadow-[2px_2px_0px_#102040]"
            >
              <div className="flex items-center gap-3">
                <span className="font-pixel text-xs text-[#B45309] w-8">
                  #{index + 1}
                </span>
                <span
                  className="w-3.5 h-3.5 border border-[#102040]"
                  style={{ backgroundColor: team.is_bankrupt ? '#94A3B8' : '#22B14C' }}
                />
                <span className="font-sans font-bold text-xs text-[#102040]">
                  {team.name}
                </span>
                <span className="font-mono text-[11px] text-[#64748B]">
                  (₹{team.cv.toLocaleString('en-IN')} CV, ₹{team.cash.toLocaleString('en-IN')} Cash)
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || isSubmitting}
                  className="font-pixel text-xs px-2 py-1 bg-[#FAF8F5] border border-[#102040] hover:bg-[#EAE5D9] disabled:opacity-40 cursor-pointer"
                  title="Move higher in tiebreak order"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === orderedIds.length - 1 || isSubmitting}
                  className="font-pixel text-xs px-2 py-1 bg-[#FAF8F5] border border-[#102040] hover:bg-[#EAE5D9] disabled:opacity-40 cursor-pointer"
                  title="Move lower in tiebreak order"
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2 border-t border-[#B45309]/30">
        <div className="flex flex-col gap-1">
          <label className="font-pixel text-[10px] uppercase text-[#92400E] font-bold">
            Judge Pitch Decision Note *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Winner decided by stronger customer acquisition pitch"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-2.5 py-1.5 font-sans text-xs text-[#102040] bg-white border-2 border-[#102040] focus:outline-none focus:ring-2 focus:ring-[#B45309]"
          />
        </div>

        {error && (
          <span className="font-mono text-xs text-[#D32F2F] font-bold">
            ⚠ {error}
          </span>
        )}

        <div className="flex justify-end pt-1">
          <PixelButton
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting || !note.trim()}
          >
            RECORD PITCH RESULT
          </PixelButton>
        </div>
      </form>
    </div>
  );
};
