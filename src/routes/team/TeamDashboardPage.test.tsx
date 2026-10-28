import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TeamDashboardPage } from './TeamDashboardPage';
import * as teamHookModule from '../../data/useMyTeam';
import { ToastProvider } from '../../ui';

vi.mock('../../data/useMyTeam', () => ({
  useMyTeam: vi.fn(),
}));

describe('TeamDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseState = {
    room: {
      status: 'ACTIVE',
      started_at: '2026-09-20T10:00:00Z',
      ends_at: '2026-09-20T10:50:00Z',
      server_now: '2026-09-20T10:05:00Z',
    },
    team: {
      slot: 1,
      name: 'Alpha Rockets',
      color: '#E52521',
      cash: 1450,
      is_bankrupt: false,
    },
    businesses: [
      {
        business_key: 'hyperdrive',
        name: 'HyperDrive Labs',
        level: 1,
        cost: 500,
      },
    ],
    final_result: null,
  };

  const defaultMockResult: teamHookModule.UseMyTeamResult = {
    state: null,
    status: 'ready',
    error: null,
    refetch: vi.fn(),
    connection: 'LIVE',
    lastUpdatedAt: 'Just now',
    isStale: false,
    staleAgeSeconds: 0,
    cashFlash: null,
    wasClaimReleased: false,
    isSessionLost: false,
  };

  const renderWithRouter = (initialEntry = '/team') =>
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/team" element={<TeamDashboardPage />} />
            <Route path="/join" element={<div>JOIN PAGE REDIRECT</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );

  it('redirects to /join if no team claim exists', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: null,
      status: 'ready',
    });

    renderWithRouter();

    expect(screen.getByText('JOIN PAGE REDIRECT')).toBeInTheDocument();
  });

  it('redirects to /join with notice if claim was revoked/released by admin', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: null,
      status: 'ready',
      wasClaimReleased: true,
    });

    renderWithRouter();

    expect(screen.getByText('JOIN PAGE REDIRECT')).toBeInTheDocument();
  });

  it('redirects to /join if anonymous session was lost', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: null,
      status: 'error',
      isSessionLost: true,
    });

    renderWithRouter();

    expect(screen.getByText('JOIN PAGE REDIRECT')).toBeInTheDocument();
  });

  it('renders loading skeleton when state is loading on start', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: null,
      status: 'loading',
      connection: 'CONNECTING',
    });

    renderWithRouter();

    expect(screen.getByText(/SYNCING TEAM DATA\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByText('JOIN PAGE REDIRECT')).not.toBeInTheDocument();
  });

  it('renders ActiveDashboardView with cash and business list when ACTIVE', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: baseState as any,
    });

    renderWithRouter();

    expect(screen.getByText('Alpha Rockets')).toBeInTheDocument();
    expect(screen.getByText('GAME TIME LEFT')).toBeInTheDocument();
    expect(screen.getByText('₹1,450')).toBeInTheDocument();
    expect(screen.getByText('HyperDrive Labs')).toBeInTheDocument();
    expect(screen.getByText('1/3 businesses')).toBeInTheDocument();
    expect(screen.queryByText(/TOTAL COMPANY VALUE/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Company value \(CV\)/i)).not.toBeInTheDocument();
  });

  it('renders ELIMINATED banner when team is bankrupt', () => {
    const bankruptState = {
      ...baseState,
      team: { ...baseState.team, is_bankrupt: true },
    };

    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: bankruptState as any,
    });

    renderWithRouter();

    expect(screen.getByText(/ELIMINATED • TEAM IS BANKRUPT/i)).toBeInTheDocument();
  });

  it('shows only the initial cash allocation while waiting in the lobby', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: { ...baseState, room: { ...baseState.room, status: 'LOBBY' } } as any,
    });

    renderWithRouter();

    expect(screen.getByText(/INITIAL CASH/i)).toBeInTheDocument();
    expect(screen.queryByText(/INITIAL COMPANY VALUE/i)).not.toBeInTheDocument();
  });

  it('renders GameOverView with Final scores pending when TIME_EXPIRED', () => {
    const expiredState = {
      ...baseState,
      room: { ...baseState.room, status: 'TIME_EXPIRED' },
    };

    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: expiredState as any,
    });

    renderWithRouter();

    expect(screen.getByText("Time's up")).toBeInTheDocument();
    expect(screen.getByText(/FINAL SCORES PENDING/i)).toBeInTheDocument();
  });

  it('renders FinalBoardView with team final result when FINALIZED', () => {
    const finalizedState = {
      ...baseState,
      room: { ...baseState.room, status: 'FINALIZED' },
      final_result: {
        rank: 1,
        cash: 1450,
        business_count: 1,
        is_bankrupt: false,
      },
    };

    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: finalizedState as any,
    });

    renderWithRouter();

    expect(screen.getByText(/STARTUPOLY CHAMPION/i)).toBeInTheDocument();
    expect(screen.getByText('OFFICIAL FINAL RESULT')).toBeInTheDocument();
    expect(screen.getByText('YOU')).toBeInTheDocument();
    expect(screen.getByText(/FINAL CASH/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /BACK TO HOME/i })).toHaveAttribute('href', '/');
  });

  it('does not invent a rank when FINALIZED but final_result is missing', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: { ...baseState, room: { ...baseState.room, status: 'FINALIZED' } } as any,
    });

    renderWithRouter();

    expect(screen.getByText('MATCH COMPLETE')).toBeInTheDocument();
    expect(screen.queryByText(/RANK #/)).not.toBeInTheDocument();
    expect(screen.queryByText(/CHAMPION/)).not.toBeInTheDocument();
  });

  it('renders reconnecting warning bar when connection is stale (> 20s)', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      ...defaultMockResult,
      state: baseState as any,
      connection: 'RECONNECTING',
      lastUpdatedAt: '24s ago',
      isStale: true,
      staleAgeSeconds: 24,
    });

    renderWithRouter();

    expect(screen.getByText(/Reconnecting… last update 24s ago/i)).toBeInTheDocument();
    // Values must still be present!
    expect(screen.getByText('₹1,450')).toBeInTheDocument();
  });
});
