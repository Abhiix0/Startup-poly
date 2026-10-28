import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LiveBoardPanel } from './LiveBoardPanel';

const teams = [
  {
    id: 'team-1', slot: 1, name: 'Alpha Rockets', color: '#E52521', cash: 1200, cv: 0,
    board_position: 3, is_bankrupt: false, version: 4, tiebreak_order: null, claimed: true, businesses: [],
  },
  {
    id: 'team-2', slot: 2, name: 'Beta Builders', color: '#22B14C', cash: 1000, cv: 0,
    board_position: 0, is_bankrupt: false, version: 2, tiebreak_order: null, claimed: true, businesses: [],
  },
];

describe('LiveBoardPanel', () => {
  it('moves the selected team by the entered dice roll', async () => {
    const onMoveTeam = vi.fn().mockResolvedValue(undefined);

    render(
      <LiveBoardPanel
        teams={teams}
        events={[]}
        selectedTeamId="team-1"
        onSelectTeam={vi.fn()}
        onMoveTeam={onMoveTeam}
        onResolveSpace={vi.fn()}
      />
    );

    expect(screen.getByText(/ON #3: SaaS/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Dice roll/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /MOVE TOKEN/i }));

    expect(onMoveTeam).toHaveBeenCalledWith(teams[0], 5);
  });

  it('hands the current landing space to the existing resolver', () => {
    const onResolveSpace = vi.fn();

    render(
      <LiveBoardPanel
        teams={teams}
        events={[]}
        selectedTeamId="team-1"
        onSelectTeam={vi.fn()}
        onMoveTeam={vi.fn().mockResolvedValue(undefined)}
        onResolveSpace={onResolveSpace}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /RESOLVE THIS SPACE/i }));
    expect(onResolveSpace).toHaveBeenCalledWith(expect.objectContaining({ index: 3, name: 'SaaS', type: 'BUSINESS' }));
  });
});
