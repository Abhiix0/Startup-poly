import React, { useState, useMemo } from 'react';
import { ActivityRow } from './ActivityRow';
import { AdminRoomSnapshot } from '../../../data/rpc';

export interface ActivityLogProps {
  events: AdminRoomSnapshot['events'];
  teams: AdminRoomSnapshot['teams'];
}

type FilterCategory = 'ALL' | 'MONEY' | 'BUSINESS' | 'SYSTEM' | string;

export const ActivityLog: React.FC<ActivityLogProps> = ({ events, teams }) => {
  const [filter, setFilter] = useState<FilterCategory>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Team filter
      if (teamFilter !== 'ALL' && ev.team_id !== teamFilter) {
        return false;
      }

      // 2. Category filter
      if (filter === 'ALL') return true;
      if (filter === 'MONEY') {
        return ['CASH_SET', 'CV_SET', 'ADJUSTMENT', 'BANKRUPTCY_SET'].includes(ev.type);
      }
      if (filter === 'BUSINESS') {
        return ['BUSINESS_ADDED', 'BUSINESS_LEVEL_SET', 'BUSINESS_REMOVED'].includes(ev.type);
      }
      if (filter === 'SYSTEM') {
        return [
          'ROOM_CREATED',
          'LOBBY_OPENED',
          'GAME_STARTED',
          'GAME_EXPIRED',
          'GAME_ABORTED',
          'TEAM_JOINED',
          'TEAM_RELEASED',
          'TIEBREAK_SET',
        ].includes(ev.type);
      }
      return true;
    });
  }, [events, filter, teamFilter]);

  return (
    <div className="bg-brand-cream border-4 border-brand-navy shadow-pixel flex flex-col h-full overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="bg-brand-navy text-white p-3 border-b-4 border-brand-navy flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-pixel text-xs uppercase tracking-wider text-brand-gold">
              LIVE ACTIVITY LOG
            </h2>
            <span className="font-mono text-[10px] bg-neutral-800 text-white px-1.5 py-0.5 border border-white/20">
              {filteredEvents.length}
            </span>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex flex-wrap items-center gap-1 font-pixel text-[9px]">
          {(['ALL', 'MONEY', 'BUSINESS', 'SYSTEM'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`
                px-2 py-1 border transition-colors cursor-pointer
                ${
                  filter === cat
                    ? 'bg-brand-gold text-brand-navy border-brand-gold font-bold'
                    : 'bg-neutral-800 text-neutral-400 border-white/20 hover:text-white'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Team Sub-Filter Dropdown */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] pt-0.5">
          <span className="text-neutral-400 text-[10px] uppercase font-pixel">TEAM:</span>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="
              flex-1 bg-neutral-800 text-white text-xs px-2 py-1 border border-white/20
              focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer
            "
          >
            <option value="ALL">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                Slot #{t.slot}: {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Event List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-300 min-h-[300px] max-h-[calc(100vh-280px)]">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-center font-mono text-xs text-neutral-500">
            No activity events match selected filters.
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const isGrouped = Boolean(
              ev.group_id &&
                idx > 0 &&
                filteredEvents[idx - 1].group_id === ev.group_id
            );

            return (
              <ActivityRow
                key={ev.id}
                event={ev}
                teams={teams}
                isGroupedWithPrevious={isGrouped}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
