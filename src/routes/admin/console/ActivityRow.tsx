import React from 'react';
import { formatActivityEvent } from '../../../domain/activityText';
import { AdminRoomSnapshot } from '../../../data/rpc';

export interface ActivityRowProps {
  event: AdminRoomSnapshot['events'][0];
  teams: AdminRoomSnapshot['teams'];
  isGroupedWithPrevious?: boolean;
}

export const ActivityRow: React.FC<ActivityRowProps> = ({
  event,
  teams,
  isGroupedWithPrevious = false,
}) => {
  const human = formatActivityEvent(event, teams);

  // Format local HH:MM:SS timestamp
  let timeFormatted = '--:--:--';
  try {
    if (event.created_at) {
      const date = new Date(event.created_at);
      timeFormatted = date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
  } catch {
    // fallback
  }

  return (
    <div
      className={`
        p-2 bg-brand-cream border-b border-neutral-300 text-xs flex flex-col gap-1 transition-colors hover:bg-brand-white
        ${isGroupedWithPrevious ? 'border-l-4 border-l-interactive-blue' : ''}
      `}
    >
      {/* Top line: timestamp, team chip, badges */}
      <div className="flex items-center justify-between gap-1.5 font-mono text-[10px] text-neutral-500">
        <div className="flex items-center gap-1.5 truncate">
          <span title={event.created_at} className="cursor-help text-neutral-500">
            {timeFormatted}
          </span>

          {human.teamName && (
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 border border-brand-navy flex-shrink-0"
                style={{ backgroundColor: human.teamColor || 'var(--color-brand-navy)' }}
              />
              <span className="font-pixel text-[9px] text-brand-navy truncate max-w-[100px]">
                {human.teamName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {human.isCorrection && (
            <span className="font-pixel text-[8px] bg-brand-red text-brand-white px-1 py-0.5 border border-brand-navy">
              CORRECTION
            </span>
          )}
          {event.group_id && (
            <span className="font-mono text-[8px] bg-neutral-200 text-brand-navy px-1 py-0.5 border border-brand-navy">
              MULTI
            </span>
          )}
        </div>
      </div>

      {/* Main sentence and delta */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-sans text-xs text-brand-navy font-medium leading-snug">
          {human.sentence}
        </span>

        {human.deltaText && (
          <span
            className={`font-mono text-xs font-bold px-1 py-0.5 border flex-shrink-0 ${
              human.isPositive
                ? 'bg-status-success-bg text-brand-green border-brand-green'
                : human.isNegative
                ? 'bg-status-danger-bg text-brand-red border-brand-red'
                : 'bg-brand-cream text-brand-navy border-brand-navy'
            }`}
          >
            {human.deltaText}
          </span>
        )}
      </div>

      {/* Optional Note pill */}
      {human.note && (
        <div className="bg-brand-cream-light border border-amber-200 p-1 font-mono text-[10px] text-amber-800 italic">
          "{human.note}"
        </div>
      )}
    </div>
  );
};
