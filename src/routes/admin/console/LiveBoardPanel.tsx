import React, { useMemo, useState } from 'react';
import { BOARD_SPACES, BoardSpace, getBoardSpace } from '../../../domain/board';
import { AdminRoomSnapshot } from '../../../data/rpc';
import { PixelBusinessIcon, PixelCloudFluffy, PixelCoin, PixelHill, PixelPipe, PixelQuestionBlock, PixelStar, StartupolyLogo } from '../../../ui/pixel';
import './LiveBoardPanel.css';

type Team = AdminRoomSnapshot['teams'][number];

const spaceColors: Record<BoardSpace['type'], string> = {
  START: '#08b858', BUSINESS: '#078bea', BONUS: '#ffc400', CRISIS: '#e72c38',
  WILDCARD: '#9b42e8', ACTION_B: '#f77a0a', ACTION_C: '#e72c38', ACTION_D: '#05aaa6',
};

function BoardIcon({ space }: { space: BoardSpace }) {
  if (space.type === 'BUSINESS') return <PixelBusinessIcon businessKey={space.businessKey ?? ''} size={32} />;
  if (space.type === 'BONUS') return <PixelStar size={32} />;
  if (space.type === 'WILDCARD') return <PixelQuestionBlock size={30} />;
  const symbols: Record<string, string> = { START: '⚑', CRISIS: '!', ACTION_B: '♬', ACTION_C: '⚡', ACTION_D: '⇄' };
  return <span className="live-board__symbol">{symbols[space.type]}</span>;
}

function positionInGrid(index: number) {
  if (index <= 6) return { row: 6, column: index };
  if (index <= 12) return { row: 12 - index, column: 6 };
  if (index <= 18) return { row: 0, column: 18 - index };
  return { row: index - 18, column: 0 };
}

export interface LiveBoardPanelProps {
  teams: AdminRoomSnapshot['teams'];
  events: AdminRoomSnapshot['events'];
  selectedTeamId: string;
  disabled?: boolean;
  onSelectTeam: (teamId: string) => void;
  onMoveTeam: (team: Team, steps: number) => Promise<void>;
  onResolveSpace: (space: BoardSpace) => void;
}

/** Organizer-only companion to the physical board: persistent token positions and turn context. */
export const LiveBoardPanel: React.FC<LiveBoardPanelProps> = ({
  teams,
  events,
  selectedTeamId,
  disabled = false,
  onSelectTeam,
  onMoveTeam,
  onResolveSpace,
}) => {
  const [steps, setSteps] = useState(1);
  const [isMoving, setIsMoving] = useState(false);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];
  const selectedSpace = getBoardSpace(selectedTeam?.board_position ?? 0);

  const teamsAtSpace = useMemo(
    () =>
      BOARD_SPACES.reduce<Record<number, Team[]>>((bySpace, space) => {
        bySpace[space.index] = teams.filter((team) => (team.board_position ?? 0) === space.index);
        return bySpace;
      }, {}),
    [teams]
  );

  const recentMoves = events.filter((event) => event.type === 'TEAM_MOVED').slice(0, 4);

  const handleMove = async () => {
    if (!selectedTeam) return;
    try {
      setIsMoving(true);
      await onMoveTeam(selectedTeam, steps);
    } catch {
      // The console owns mutation feedback. Avoid an unhandled event-promise
      // rejection after it has already presented the organiser with the result.
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <section aria-label="Live board tracker" className="border-4 border-brand-navy bg-brand-white shadow-pixel p-3 sm:p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 mb-3">
        <div>
          <h2 className="font-pixel text-sm sm:text-base uppercase text-brand-navy">Live Board Tracker</h2>
          <p className="font-mono text-[11px] text-neutral-600">Admin only · mirrors the physical board · positions persist after refresh</p>
        </div>
        <span className="self-start sm:self-auto font-pixel text-[9px] uppercase bg-brand-navy text-brand-gold px-2 py-1 border border-brand-navy">
          {selectedTeam ? `TURN: ${selectedTeam.name}` : 'SELECT A TEAM'}
        </span>
      </div>

      <div className="grid items-start justify-center gap-5 xl:grid-cols-[minmax(560px,760px)_minmax(320px,360px)] xl:gap-7">
        <div className="live-board relative aspect-square w-full min-w-0 mx-auto overflow-hidden">
          <div className="live-board__scene" aria-hidden="true">
            <PixelCloudFluffy size={70} className="live-board__cloud live-board__cloud--one" />
            <PixelCloudFluffy size={52} className="live-board__cloud live-board__cloud--two" />
            <PixelCloudFluffy size={42} className="live-board__cloud live-board__cloud--three" />
            <PixelHill size={140} className="live-board__hill live-board__hill--one" />
            <PixelHill size={110} className="live-board__hill live-board__hill--two" />
            <PixelPipe size={48} className="live-board__pipe" />
            <PixelCoin size={25} className="live-board__coin" />
            <PixelStar size={20} className="live-board__star" />
            <div className="live-board__logo"><StartupolyLogo size="responsive" glow={false} /></div>
            <span className="live-board__scene-caption">THE GAME IS ON</span>
            <div className="live-board__ground" />
          </div>

          <div className="live-board__grid relative z-10 grid h-full w-full grid-cols-7 grid-rows-7">
            {BOARD_SPACES.map((space) => {
              const position = positionInGrid(space.index);
              const occupants = teamsAtSpace[space.index] ?? [];
              const isSelectedSpace = selectedSpace.index === space.index;
              const cellClass = `live-board__tile relative min-w-0 text-left ${isSelectedSpace ? 'live-board__tile--selected' : ''}`;
              const cellStyle = { gridRowStart: position.row + 1, gridColumnStart: position.column + 1, backgroundColor: spaceColors[space.type] };
              const cellContent = <>
                <span className="live-board__number">{String(space.index).padStart(2, '0')}</span>
                <span aria-hidden="true" className="live-board__icon"><BoardIcon space={space} /></span>
                <span className="live-board__label">{space.name}</span>
                {occupants.length > 0 && (
                  <span className="live-board__tokens">
                    {occupants.map((team) => (
                      <span
                        key={team.id}
                        title={team.name}
                        className={`live-board__token ${team.id === selectedTeamId ? 'live-board__token--selected' : ''}`}
                        style={{ backgroundColor: team.color }}
                      >{team.slot}</span>
                    ))}
                  </span>
                )}
              </>;

              return (
                occupants.length > 0 ? (
                  <button
                    key={space.index}
                    type="button"
                    title={`#${space.index} ${space.name}: ${space.description}`}
                    aria-label={`Select token on ${space.name}`}
                    onClick={() => onSelectTeam(occupants[0].id)}
                    className={`${cellClass} cursor-pointer`}
                    style={cellStyle}
                  >
                    {cellContent}
                  </button>
                ) : (
                  <div key={space.index} title={`#${space.index} ${space.name}: ${space.description}`} className={cellClass} style={cellStyle}>
                    {cellContent}
                  </div>
                )
              );
            })}
          </div>
        </div>

        <aside className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="border-2 border-brand-navy bg-brand-cream p-3">
            <span className="font-pixel text-[10px] uppercase text-neutral-600">Selected team</span>
            <select
              aria-label="Select team for board move"
              value={selectedTeam?.id ?? ''}
              onChange={(event) => onSelectTeam(event.target.value)}
              className="mt-1 w-full border-2 border-brand-navy bg-white px-2 py-2 font-pixel text-xs text-brand-navy"
            >
              {teams.map((team) => <option key={team.id} value={team.id}>#{team.slot} · {team.name}</option>)}
            </select>
            {selectedTeam && (
              <div className="mt-3 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-brand-navy" style={{ backgroundColor: selectedTeam.color }} />
                <span className="font-pixel text-[11px] text-brand-navy truncate">ON #{selectedSpace.index}: {selectedSpace.name}</span>
              </div>
            )}
          </div>

          <div className="border-2 border-brand-navy bg-brand-navy p-3 text-white">
            <label htmlFor="board-roll" className="font-pixel text-[10px] uppercase text-brand-gold block">Dice roll</label>
            <div className="mt-2 flex gap-2">
              <select
                id="board-roll"
                value={steps}
                onChange={(event) => setSteps(Number(event.target.value))}
                disabled={disabled || isMoving}
                className="w-16 bg-white border-2 border-brand-gold text-brand-navy font-pixel text-sm px-2 py-2"
              >
                {[1, 2, 3, 4, 5, 6].map((roll) => <option key={roll} value={roll}>{roll}</option>)}
              </select>
              <button
                type="button"
                onClick={handleMove}
                disabled={disabled || isMoving || !selectedTeam || selectedTeam.is_bankrupt}
                className="flex-1 font-pixel text-xs uppercase bg-brand-gold text-brand-navy border-2 border-brand-gold px-3 py-2 shadow-pixel-sm hover:bg-brand-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMoving ? 'MOVING…' : 'MOVE TOKEN'}
              </button>
            </div>
          </div>

          <div className="border-2 border-brand-navy bg-white p-3">
            <span className="font-pixel text-[10px] uppercase text-neutral-600">Landing space</span>
            <h3 className="font-pixel text-sm text-brand-navy mt-1">#{selectedSpace.index} · {selectedSpace.name}</h3>
            <p className="font-mono text-[11px] leading-snug text-neutral-700 mt-1">{selectedSpace.description}</p>
            <button
              type="button"
              onClick={() => onResolveSpace(selectedSpace)}
              disabled={disabled || !selectedTeam || selectedTeam.is_bankrupt}
              className="mt-3 w-full font-pixel text-[10px] uppercase bg-brand-green text-white border-2 border-brand-navy px-2 py-2 shadow-pixel-sm hover:bg-interactive-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              RESOLVE THIS SPACE →
            </button>
          </div>

          <div className="border-2 border-brand-navy bg-brand-cream p-3">
            <span className="font-pixel text-[10px] uppercase text-neutral-600">Recent movement</span>
            <ol className="mt-2 flex flex-col gap-1.5">
              {recentMoves.length === 0 ? (
                <li className="font-mono text-[11px] text-neutral-500">No tokens moved yet.</li>
              ) : recentMoves.map((event) => {
                const team = teams.find((entry) => entry.id === event.team_id);
                const destination = getBoardSpace(event.new?.board_position ?? 0);
                return (
                  <li key={event.id} className="font-mono text-[11px] text-brand-navy flex gap-1.5">
                    <span className="mt-0.5 w-2.5 h-2.5 rounded-full border border-brand-navy shrink-0" style={{ backgroundColor: team?.color ?? '#94a3b8' }} />
                    <span><strong>{team?.name ?? 'Team'}</strong> → #{destination.index} {destination.name}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
    </section>
  );
};
