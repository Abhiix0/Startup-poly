import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LobbyView } from './LobbyView';
import * as rpcModule from '../../data/rpc';
import { ToastProvider } from '../../ui';
import { AdminRoomSnapshot } from '../../data/rpc';

vi.mock('../../data/rpc', () => ({
  rpcAdminReleaseTeam: vi.fn(),
  rpcAdminStartGame: vi.fn(),
}));

describe('LobbyView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSnapshotWithUnjoined: AdminRoomSnapshot = {
    room: {
      id: 'room-lobby-1',
      code: 'ABC890',
      status: 'LOBBY',
      team_count: 5,
      started_at: null,
      ends_at: null,
      created_at: new Date().toISOString(),
      created_by: 'admin-1',
    },
    server_now: new Date().toISOString(),
    teams: [
      {
        id: 'team-1',
        slot: 1,
        name: 'Alpha Rockets',
        color: '#E52521',
        cash: 1000,
        cv: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: true,
        pin: '1111',
        businesses: [],
      },
      {
        id: 'team-2',
        slot: 2,
        name: 'Beta Builders',
        color: '#0099FF',
        cash: 1000,
        cv: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: false,
        pin: '2222',
        businesses: [],
      },
      {
        id: 'team-3',
        slot: 3,
        name: 'Gamma Grow',
        color: '#22B14C',
        cash: 1000,
        cv: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: false,
        pin: '3333',
        businesses: [],
      },
      {
        id: 'team-4',
        slot: 4,
        name: 'Delta Data',
        color: '#FF9900',
        cash: 1000,
        cv: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: false,
        pin: '4444',
        businesses: [],
      },
      {
        id: 'team-5',
        slot: 5,
        name: 'Epsilon Energy',
        color: '#9333EA',
        cash: 1000,
        cv: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: false,
        pin: '5555',
        businesses: [],
      },
    ],
    events: [],
  };

  const renderComponent = (snapshot: AdminRoomSnapshot = mockSnapshotWithUnjoined) => {
    const onRefetch = vi.fn().mockResolvedValue(undefined);
    const utils = render(
      <ToastProvider>
        <LobbyView snapshot={snapshot} onRefetch={onRefetch} />
      </ToastProvider>
    );
    return { ...utils, onRefetch };
  };

  it('renders huge room code and team PINs', () => {
    renderComponent();

    expect(screen.getByText('ABC890')).toBeInTheDocument();
    expect(screen.getByText('1111')).toBeInTheDocument();
    expect(screen.getByText('2222')).toBeInTheDocument();
    expect(screen.getByText('1 / 5 TEAMS CONNECTED')).toBeInTheDocument();
  });

  it('shows release button only on claimed teams and calls rpcAdminReleaseTeam on confirm', async () => {
    vi.mocked(rpcModule.rpcAdminReleaseTeam).mockResolvedValue({ team_id: 'team-1', released: true });
    const { onRefetch } = renderComponent();

    // Slot 1 is claimed, so it has RELEASE button
    const releaseButtons = screen.getAllByRole('button', { name: /RELEASE/i });
    expect(releaseButtons).toHaveLength(1);

    fireEvent.click(releaseButtons[0]);

    // Dialog opens
    expect(screen.getByText(/RELEASE TEAM CONNECTION/i)).toBeInTheDocument();
    expect(screen.getByText(/Slot #1 \(Alpha Rockets\)/i)).toBeInTheDocument();

    const confirmReleaseBtn = screen.getByRole('button', { name: /RELEASE DEVICE/i });
    fireEvent.click(confirmReleaseBtn);

    await waitFor(() => {
      expect(rpcModule.rpcAdminReleaseTeam).toHaveBeenCalledWith('team-1');
      expect(onRefetch).toHaveBeenCalledTimes(1);
    });
  });

  it('opens unjoined teams warning modal when starting with missing teams and supports force start', async () => {
    vi.mocked(rpcModule.rpcAdminStartGame).mockResolvedValue({ id: 'room-lobby-1', status: 'ACTIVE' } as any);
    const { onRefetch } = renderComponent();

    const startBtn = screen.getByRole('button', { name: /START GAME\.\.\./i });
    fireEvent.click(startBtn);

    // Modal opens listing unjoined teams
    expect(screen.getByText(/UNJOINED TEAMS WARNING/i)).toBeInTheDocument();
    expect(screen.getByText(/4 out of 5 teams/i)).toBeInTheDocument();
    expect(screen.getByText(/Slot #2: Beta Builders/i)).toBeInTheDocument();
    expect(screen.getByText(/Slot #3: Gamma Grow/i)).toBeInTheDocument();

    const forceStartBtn = screen.getByRole('button', { name: /START ANYWAY \(FORCE\)/i });
    fireEvent.click(forceStartBtn);

    await waitFor(() => {
      expect(rpcModule.rpcAdminStartGame).toHaveBeenCalledWith('room-lobby-1', true);
      expect(onRefetch).toHaveBeenCalledTimes(1);
    });
  });

  it('handles start game when all teams have joined with single confirmation', async () => {
    vi.mocked(rpcModule.rpcAdminStartGame).mockResolvedValue({ id: 'room-lobby-1', status: 'ACTIVE' } as any);

    const allClaimedSnapshot: AdminRoomSnapshot = {
      ...mockSnapshotWithUnjoined,
      teams: mockSnapshotWithUnjoined.teams.map((t) => ({ ...t, claimed: true })),
    };

    renderComponent(allClaimedSnapshot);

    expect(screen.getByText('5 / 5 TEAMS CONNECTED')).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /START GAME \(50:00\)/i });
    fireEvent.click(startBtn);

    expect(screen.getByText(/CONFIRM START GAME/i)).toBeInTheDocument();
    expect(screen.getByText(/have connected their phones/i)).toBeInTheDocument();

    const confirmStartBtn = screen.getByRole('button', { name: /START 50:00 MATCH/i });
    fireEvent.click(confirmStartBtn);

    await waitFor(() => {
      expect(rpcModule.rpcAdminStartGame).toHaveBeenCalledWith('room-lobby-1', false);
    });
  });
});
