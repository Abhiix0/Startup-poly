import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import { AdminHistoryPage } from './AdminHistoryPage';
import { AdminRoomHistoryPage } from './AdminRoomHistoryPage';
import { ToastProvider } from '../../ui';
import * as rpcModule from '../../data/rpc';

vi.mock('../../data/rpc', async () => {
  const actual = await vi.importActual('../../data/rpc');
  return {
    ...actual,
    rpcListHistory: vi.fn(),
    rpcGetHistoryDetail: vi.fn(),
  };
});

describe('AdminHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no finalized rooms exist', async () => {
    vi.mocked(rpcModule.rpcListHistory).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AdminHistoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/NO FINALIZED MATCHES YET/i)).toBeInTheDocument();
  });

  it('renders list of finalized rooms', async () => {
    vi.mocked(rpcModule.rpcListHistory).mockResolvedValue([
      {
        room_id: 'room-1',
        code: 'FIN101',
        created_at: '2026-09-21T09:00:00Z',
        finalized_at: '2026-09-21T10:00:00Z',
        winner_name: 'Alpha Rockets',
        winner_color: '#E52521',
        team_count: 5,
      },
    ]);

    render(
      <MemoryRouter>
        <AdminHistoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/ROOM FIN101/i)).toBeInTheDocument();
    expect(screen.getByText(/5 Teams/i)).toBeInTheDocument();
    expect(screen.getByText(/Alpha Rockets/i)).toBeInTheDocument();
    expect(screen.getByText(/VIEW ►/i)).toBeInTheDocument();
  });
});

describe('AdminRoomHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders immutable leaderboard, activity log, copy text, and CSV buttons', async () => {
    vi.mocked(rpcModule.rpcGetHistoryDetail).mockResolvedValue({
      room: {
        id: 'room-1',
        code: 'HIS999',
        status: 'FINALIZED',
        team_count: 3,
        started_at: '2026-09-21T09:00:00Z',
        ends_at: '2026-09-21T09:50:00Z',
        created_at: '2026-09-21T08:50:00Z',
        finalized_at: '2026-09-21T10:00:00Z',
        winner_team_id: 'team-1',
      },
      results: [
        {
          team_id: 'team-1',
          rank: 1,
          name: 'Alpha Rockets',
          color: '#E52521',
          cv: 1500,
          cash: 600,
          business_count: 3,
          is_bankrupt: false,
        },
        {
          team_id: 'team-2',
          rank: 2,
          name: 'Beta Builders',
          color: '#22B14C',
          cv: 1000,
          cash: 400,
          business_count: 2,
          is_bankrupt: false,
        },
      ],
      events: [
        {
          id: 1,
          team_id: 'team-1',
          group_id: null,
          type: 'GAME_FINALIZED',
          business_key: null,
          prev: null,
          new: null,
          note: 'Match finalized. Leaderboard permanently snapshotted.',
          is_correction: false,
          created_at: '2026-09-21T10:00:00Z',
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/admin/history/room-1']}>
        <ToastProvider>
          <Routes>
            <Route path="/admin/history/:roomId" element={<AdminRoomHistoryPage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/ROOM HIS999 • IMMUTABLE RECORD/i)).toBeInTheDocument();
    expect(screen.getByText('Alpha Rockets', { selector: 'td span' })).toBeInTheDocument();
    expect(screen.getByText('Beta Builders', { selector: 'td span' })).toBeInTheDocument();
    expect(screen.getByText(/COPY TEXT/i)).toBeInTheDocument();
    expect(screen.getByText(/CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/LIVE ACTIVITY LOG/i)).toBeInTheDocument();
  });
});
