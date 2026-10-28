import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ArenaPage } from './ArenaPage';
import * as adminHookModule from '../../data/useAdminRoom';
import type { AdminRoomSnapshot } from '../../data/rpc';

vi.mock('../../data/useAdminRoom', () => ({
  useAdminRoom: vi.fn(),
}));

describe('ArenaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSnapshot: AdminRoomSnapshot = {
    room: {
      id: 'room-123',
      code: 'START1',
      status: 'ACTIVE',
      team_count: 3,
      started_at: '2026-09-20T10:00:00Z',
      ends_at: '2026-09-20T10:50:00Z',
      created_at: '2026-09-20T09:50:00Z',
      created_by: 'admin-1',
    },
    server_now: '2026-09-20T10:05:00Z',
    teams: [
      {
        id: 'team-1',
        slot: 1,
        name: 'Phoenix Ventures',
        color: '#E52521',
        cash: 1000,
        debt: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: true,
        businesses: [
          { business_key: 'quickbite', name: 'QuickBite Cloud Kitchens', level: 1, cost: 500 },
        ],
      },
      {
        id: 'team-2',
        slot: 2,
        name: 'Quantum Titans',
        color: '#0099FF',
        cash: 1500,
        debt: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: true,
        businesses: [
          { business_key: 'finflow', name: 'FinFlow NeoBank', level: 2, cost: 900 },
        ],
      },
      {
        id: 'team-3',
        slot: 3,
        name: 'Cyber Mavericks',
        color: '#22C55E',
        cash: 0,
        debt: 0,
        is_bankrupt: true,
        version: 1,
        tiebreak_order: null,
        claimed: true,
        businesses: [],
      },
    ],
    events: [],
  };

  it('renders loading state when status is loading', () => {
    vi.mocked(adminHookModule.useAdminRoom).mockReturnValue({
      snapshot: null,
      status: 'loading',
      error: null,
      refetch: vi.fn(),
      connection: 'CONNECTING',
      lastUpdated: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
    });

    render(
      <MemoryRouter initialEntries={['/arena/room-123']}>
        <Routes>
          <Route path="/arena/:roomId" element={<ArenaPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/CONNECTING TO ARENA SCREEN/i)).toBeInTheDocument();
  });

  it('renders stadium scoreboard with ranked teams and total valuations', () => {
    vi.mocked(adminHookModule.useAdminRoom).mockReturnValue({
      snapshot: mockSnapshot,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdated: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
    });

    render(
      <MemoryRouter initialEntries={['/arena/room-123']}>
        <Routes>
          <Route path="/arena/:roomId" element={<ArenaPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Screen title
    expect(screen.getByText(/STARTUPOLY ARENA/i)).toBeInTheDocument();

    // Leader should be Quantum Titans with the highest cash (1,500)
    expect(screen.getAllByText(/QUANTUM TITANS/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('₹1,500')).toBeInTheDocument();

    // 2nd place should be Phoenix Ventures (1,000 Cash)
    expect(screen.getAllByText(/PHOENIX VENTURES/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('₹1,000').length).toBeGreaterThanOrEqual(1);

    // Bankrupt team has badge
    expect(screen.getByText(/ELIMINATED/i)).toBeInTheDocument();
  });

  it('renders celebration banner when match is FINALIZED', () => {
    const finalizedSnapshot: AdminRoomSnapshot = {
      ...mockSnapshot,
      room: {
        ...mockSnapshot.room,
        status: 'FINALIZED',
      },
    };

    vi.mocked(adminHookModule.useAdminRoom).mockReturnValue({
      snapshot: finalizedSnapshot,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdated: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
    });

    render(
      <MemoryRouter initialEntries={['/arena/room-123']}>
        <Routes>
          <Route path="/arena/:roomId" element={<ArenaPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/TOURNAMENT CHAMPION: QUANTUM TITANS/i)).toBeInTheDocument();
  });
});
