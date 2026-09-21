import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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
      started_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 3000 * 1000).toISOString(),
      server_now: new Date().toISOString(),
    },
    team: {
      slot: 1,
      name: 'Alpha Rockets',
      color: '#E52521',
      cash: 1450,
      cv: 1850,
      is_bankrupt: false,
    },
    businesses: [
      {
        business_key: 'b1',
        name: 'HyperDrive Labs',
        level: 1,
        cost: 250,
        initial_cv: 250,
        cv_contribution: 750,
      },
    ],
    leaderboard: null,
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
      state: null,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdatedAt: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: false,
    });

    renderWithRouter();

    expect(screen.getByText('JOIN PAGE REDIRECT')).toBeInTheDocument();
  });

  it('redirects to /join with notice if claim was revoked/released by admin', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      state: null,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdatedAt: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: true,
    });

    renderWithRouter();

    expect(screen.getByText('JOIN PAGE REDIRECT')).toBeInTheDocument();
  });

  it('renders loading skeleton when state is loading on start', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      state: null,
      status: 'loading',
      error: null,
      refetch: vi.fn(),
      connection: 'CONNECTING',
      lastUpdatedAt: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: false,
    });

    renderWithRouter();

    expect(screen.getByText(/SYNCING TEAM DATA\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByText('JOIN PAGE REDIRECT')).not.toBeInTheDocument();
  });

  it('renders ActiveDashboardView with cash, CV, and business list when ACTIVE', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      state: baseState as any,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdatedAt: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: false,
    });

    renderWithRouter();

    expect(screen.getByText('Alpha Rockets')).toBeInTheDocument();
    expect(screen.getByText('GAME TIME LEFT')).toBeInTheDocument();
    expect(screen.getByText('₹1,450')).toBeInTheDocument();
    expect(screen.getByText(/1,850/)).toBeInTheDocument();
    expect(screen.getByText('HyperDrive Labs')).toBeInTheDocument();
    expect(screen.getByText(/CV contribution: ₹750/i)).toBeInTheDocument();
  });

  it('renders ELIMINATED banner when team is bankrupt', () => {
    const bankruptState = {
      ...baseState,
      team: { ...baseState.team, is_bankrupt: true },
    };

    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      state: bankruptState as any,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdatedAt: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: false,
    });

    renderWithRouter();

    expect(screen.getByText(/ELIMINATED • TEAM IS BANKRUPT/i)).toBeInTheDocument();
  });

  it('renders GameOverView with Final scores pending when TIME_EXPIRED', () => {
    const expiredState = {
      ...baseState,
      room: { ...baseState.room, status: 'TIME_EXPIRED' },
    };

    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      state: expiredState as any,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdatedAt: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: false,
    });

    renderWithRouter();

    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    expect(screen.getByText(/FINAL SCORES PENDING/i)).toBeInTheDocument();
  });

  it('renders FinalBoardView with podium standings when FINALIZED', () => {
    const finalizedState = {
      ...baseState,
      room: { ...baseState.room, status: 'FINALIZED' },
      leaderboard: [
        {
          rank: 1,
          name: 'Alpha Rockets',
          color: '#E52521',
          cv: 1850,
          cash: 1450,
          business_count: 1,
          is_bankrupt: false,
        },
        {
          rank: 2,
          name: 'Beta Builders',
          color: '#0099FF',
          cv: 1200,
          cash: 900,
          business_count: 1,
          is_bankrupt: false,
        },
      ],
    };

    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      state: finalizedState as any,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'LIVE',
      lastUpdatedAt: 'Just now',
      isStale: false,
      staleAgeSeconds: 0,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: false,
    });

    renderWithRouter();

    expect(screen.getByText(/TOURNAMENT CHAMPIONS!/i)).toBeInTheDocument();
    expect(screen.getByText('OFFICIAL TOURNAMENT STANDINGS')).toBeInTheDocument();
    expect(screen.getByText(/Alpha Rockets \(YOU\)/i)).toBeInTheDocument();
  });

  it('renders reconnecting warning bar when connection is stale (> 20s)', () => {
    vi.mocked(teamHookModule.useMyTeam).mockReturnValue({
      state: baseState as any,
      status: 'ready',
      error: null,
      refetch: vi.fn(),
      connection: 'RECONNECTING',
      lastUpdatedAt: '24s ago',
      isStale: true,
      staleAgeSeconds: 24,
      cashFlash: null,
      cvFlash: null,
      wasClaimReleased: false,
    });

    renderWithRouter();

    expect(screen.getByText(/Reconnecting… last update 24s ago/i)).toBeInTheDocument();
    // Values must still be present!
    expect(screen.getByText('₹1,450')).toBeInTheDocument();
  });
});
