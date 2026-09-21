import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { StandingsTable } from './StandingsTable';
import { TieBreakOrder } from './TieBreakOrder';
import { FinalizePanel } from './FinalizePanel';
import { ResultView } from './ResultView';
import { ToastProvider } from '../../../ui';
import * as rpcModule from '../../../data/rpc';

vi.mock('../../../data/rpc', async () => {
  const actual = await vi.importActual('../../../data/rpc');
  return {
    ...actual,
    rpcGetStandings: vi.fn(),
    rpcAdminSetTiebreak: vi.fn(),
    rpcAdminFinalize: vi.fn(),
  };
});

const mockStandings: rpcModule.StandingsRow[] = [
  {
    team_id: 'team-1',
    slot: 1,
    name: 'Alpha Rockets',
    rank: 1,
    is_bankrupt: false,
    cv: 1500,
    cash: 500,
    business_count: 3,
    tiebreak_order: null,
    tie_unresolved: false,
  },
  {
    team_id: 'team-2',
    slot: 2,
    name: 'Beta Builders',
    rank: 2,
    is_bankrupt: false,
    cv: 1200,
    cash: 300,
    business_count: 2,
    tiebreak_order: null,
    tie_unresolved: true,
  },
  {
    team_id: 'team-3',
    slot: 3,
    name: 'Gamma Guild',
    rank: 3,
    is_bankrupt: false,
    cv: 1200,
    cash: 300,
    business_count: 2,
    tiebreak_order: null,
    tie_unresolved: true,
  },
];

const mockSnapshot: rpcModule.AdminRoomSnapshot = {
  room: {
    id: 'room-1',
    code: 'REC123',
    status: 'TIME_EXPIRED',
    team_count: 3,
    started_at: '2026-09-21T10:00:00Z',
    ends_at: '2026-09-21T10:50:00Z',
    created_at: '2026-09-21T09:50:00Z',
    created_by: 'admin-1',
  },
  server_now: new Date().toISOString(),
  teams: [
    {
      id: 'team-1',
      slot: 1,
      name: 'Alpha Rockets',
      color: '#E52521',
      cash: 1500,
      cv: 500,
      is_bankrupt: false,
      version: 1,
      tiebreak_order: null,
      claimed: true,
      businesses: [],
    },
    {
      id: 'team-2',
      slot: 2,
      name: 'Beta Builders',
      color: '#22B14C',
      cash: 1200,
      cv: 300,
      is_bankrupt: false,
      version: 1,
      tiebreak_order: null,
      claimed: true,
      businesses: [],
    },
    {
      id: 'team-3',
      slot: 3,
      name: 'Gamma Guild',
      color: '#FFCC00',
      cash: 1200,
      cv: 300,
      is_bankrupt: false,
      version: 1,
      tiebreak_order: null,
      claimed: true,
      businesses: [],
    },
  ],
  events: [],
};

describe('StandingsTable', () => {
  it('renders ranks, names, metrics, and flags unresolved ties', () => {
    render(<StandingsTable standings={mockStandings} teams={mockSnapshot.teams} />);

    expect(screen.getByText('Alpha Rockets')).toBeInTheDocument();
    expect(screen.getByText('Beta Builders')).toBeInTheDocument();
    expect(screen.getByText('Gamma Guild')).toBeInTheDocument();

    // Two teams have unresolved ties
    const tieBadges = screen.getAllByText(/⚠ UNRESOLVED TIE/i);
    expect(tieBadges).toHaveLength(2);
  });
});

describe('TieBreakOrder', () => {
  it('allows reordering tied teams and submits pitch decision', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TieBreakOrder
        tiedTeams={[mockStandings[1], mockStandings[2]]}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/Tied on CV, cash and businesses/i)).toBeInTheDocument();

    // Move team 2 down
    const downButtons = screen.getAllByTitle(/Move lower in tiebreak order/i);
    fireEvent.click(downButtons[0]);

    // Fill note
    const input = screen.getByPlaceholderText(/Winner decided by/i);
    fireEvent.change(input, { target: { value: 'Beta had better pitch' } });

    fireEvent.click(screen.getByRole('button', { name: /RECORD PITCH RESULT/i }));

    expect(onSubmit).toHaveBeenCalledWith(['team-3', 'team-2'], 'Beta had better pitch');
  });
});

describe('FinalizePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables finalize button when unresolved ties exist', async () => {
    vi.mocked(rpcModule.rpcGetStandings).mockResolvedValue({
      standings: mockStandings,
      has_unresolved_tie: true,
    });

    render(
      <ToastProvider>
        <FinalizePanel
          roomId="room-1"
          snapshot={mockSnapshot}
          onRefetch={vi.fn().mockResolvedValue(undefined)}
        />
      </ToastProvider>
    );

    expect(await screen.findByText(/TIEBREAK REQUIRED BEFORE FINALIZING/i)).toBeInTheDocument();
    const finalizeBtn = screen.getByRole('button', { name: /FINALIZE MATCH/i });
    expect(finalizeBtn).toBeDisabled();
  });

  it('enables finalize button when no unresolved ties and confirms finalization', async () => {
    const resolvedStandings = mockStandings.map((s) => ({ ...s, tie_unresolved: false }));
    vi.mocked(rpcModule.rpcGetStandings).mockResolvedValue({
      standings: resolvedStandings,
      has_unresolved_tie: false,
    });
    vi.mocked(rpcModule.rpcAdminFinalize).mockResolvedValue({
      room_id: 'room-1',
      winner_team_id: 'team-1',
      standings: resolvedStandings,
    });
    const onRefetch = vi.fn().mockResolvedValue(undefined);

    render(
      <ToastProvider>
        <FinalizePanel
          roomId="room-1"
          snapshot={mockSnapshot}
          onRefetch={onRefetch}
        />
      </ToastProvider>
    );

    expect(await screen.findByText(/ALL TIES RESOLVED/i)).toBeInTheDocument();
    const finalizeBtn = screen.getByRole('button', { name: /FINALIZE MATCH/i });
    expect(finalizeBtn).not.toBeDisabled();

    // Click to open confirm modal
    fireEvent.click(finalizeBtn);
    expect(screen.getByText(/PERMANENTLY FINALIZE MATCH/i)).toBeInTheDocument();
    expect(screen.getByText(/IRREVERSIBLE ACTION/i)).toBeInTheDocument();

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: /CONFIRM FINALIZATION/i }));
    expect(rpcModule.rpcAdminFinalize).toHaveBeenCalledWith('room-1');
  });
});

describe('ResultView', () => {
  it('renders final leaderboard, winner, and Start New Match button', async () => {
    vi.mocked(rpcModule.rpcGetStandings).mockResolvedValue({
      standings: mockStandings.map((s) => ({ ...s, tie_unresolved: false })),
      has_unresolved_tie: false,
    });

    const finalizedSnapshot: rpcModule.AdminRoomSnapshot = {
      ...mockSnapshot,
      room: {
        ...mockSnapshot.room,
        status: 'FINALIZED',
        finalized_at: '2026-09-21T11:00:00Z',
      },
    };

    render(
      <MemoryRouter>
        <ToastProvider>
          <ResultView
            snapshot={finalizedSnapshot}
            connection="LIVE"
            lastUpdated="Just now"
            onRefetch={vi.fn().mockResolvedValue(undefined)}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/MATCH FINALIZED/i)).toBeInTheDocument();
    expect(screen.getByText(/START NEW MATCH/i)).toBeInTheDocument();
    expect(screen.getByText(/COPY RESULTS/i)).toBeInTheDocument();
    expect(screen.getByText(/CSV EXPORT/i)).toBeInTheDocument();
  });
});
