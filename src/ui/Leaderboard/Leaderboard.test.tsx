import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LeaderboardView } from './LeaderboardView';
import { formatStandingsAsText, exportStandingsToCsv, LeaderboardEntry } from './exportHelpers';

const mockStandings: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Alpha Rockets',
    color: '#E52521',
    cash: 500,
    business_count: 3,
    is_bankrupt: false,
  },
  {
    rank: 2,
    name: 'Beta Builders',
    color: '#22B14C',
    cash: 300,
    business_count: 2,
    is_bankrupt: false,
  },
  {
    rank: 3,
    name: 'Gamma Guild',
    color: '#FFCC00',
    cash: 300,
    business_count: 2,
    is_bankrupt: false,
  },
  {
    rank: 4,
    name: 'Delta Dynamics',
    color: '#00C0F0',
    cash: 200,
    business_count: 1,
    is_bankrupt: false,
  },
  {
    rank: 5,
    name: 'Epsilon Enterprises',
    color: '#9933FF',
    cash: 0,
    business_count: 0,
    is_bankrupt: true,
  },
];

describe('LeaderboardView', () => {
  it('renders winner banner, podium top 3, and full table for all teams', () => {
    render(
      <LeaderboardView
        standings={mockStandings}
        roomCode="WIN888"
        finalizedAt="2026-09-21T11:00:00Z"
      />
    );

    // Winner banner
    expect(screen.getByText(/STARTUPOLY CHAMPION/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Alpha Rockets' })).toBeInTheDocument();

    // Podium
    expect(screen.getByText('CHAMPION')).toBeInTheDocument();
    expect(screen.getByText('SILVER')).toBeInTheDocument();
    expect(screen.getByText('BRONZE')).toBeInTheDocument();

    // Table rows
    expect(screen.getByText('Alpha Rockets', { selector: 'td span' })).toBeInTheDocument();
    expect(screen.getByText('Beta Builders', { selector: 'td span' })).toBeInTheDocument();
    expect(screen.getByText('Gamma Guild', { selector: 'td span' })).toBeInTheDocument();
    expect(screen.getByText('Delta Dynamics', { selector: 'td span' })).toBeInTheDocument();
    expect(screen.getByText('Epsilon Enterprises', { selector: 'td span' })).toBeInTheDocument();

    // Bankrupt team has ELIMINATED tag
    expect(screen.getByText('ELIMINATED')).toBeInTheDocument();

    expect(screen.queryByText(/won on pitch/i)).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'CASH' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /TOTAL VALUE/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'CV' })).not.toBeInTheDocument();
  });

  it('highlights viewer team when highlightTeamName is provided', () => {
    render(
      <LeaderboardView
        standings={mockStandings}
        highlightTeamName="Beta Builders"
        roomCode="WIN888"
      />
    );

    expect(screen.getByText('YOU')).toBeInTheDocument();
  });

  it('toggles presentation mode on button click and exits on Escape', () => {
    render(
      <LeaderboardView
        standings={mockStandings}
        roomCode="WIN888"
        allowPresentationMode={true}
      />
    );

    // Click presentation mode
    fireEvent.click(screen.getByText(/PRESENTATION MODE/i));
    expect(screen.getByText(/STARTUPOLY SCOREBOARD/i)).toBeInTheDocument();
    expect(screen.getByText(/EXIT \(Esc\)/i)).toBeInTheDocument();

    // Press Escape to exit
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByText(/EXIT \(Esc\)/i)).not.toBeInTheDocument();
  });
});

describe('exportHelpers', () => {
  it('formats standings as clean copyable plain text', () => {
    const text = formatStandingsAsText('ROOM42', mockStandings, '2026-09-21T12:00:00Z');
    expect(text).toContain('★ STARTUPOLY TOURNAMENT RESULTS ★');
    expect(text).toContain('Room Code: ROOM42');
    expect(text).toContain('#1 Alpha Rockets — ₹500 Cash | 3/3 Businesses');
    expect(text).toContain('#5 Epsilon Enterprises — ₹0 Cash | 0/3 Businesses [ELIMINATED]');
  });

  it('exports standings to CSV', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    exportStandingsToCsv('ROOM42', mockStandings);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
