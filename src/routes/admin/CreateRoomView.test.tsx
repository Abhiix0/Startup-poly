import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreateRoomView } from './CreateRoomView';
import * as rpcModule from '../../data/rpc';
import { ToastProvider } from '../../ui';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../data/rpc', () => ({
  rpcAdminCreateRoom: vi.fn(),
}));

describe('CreateRoomView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <ToastProvider>
        <MemoryRouter>
          <CreateRoomView />
        </MemoryRouter>
      </ToastProvider>
    );

  it('renders default 5 teams with segmented control', () => {
    renderComponent();

    expect(screen.getByText('5 TEAMS')).toBeInTheDocument();
    expect(screen.getByText('6 TEAMS')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Team 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Team 5')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Team 6')).not.toBeInTheDocument();
  });

  it('toggles to 6 teams and adds Team 6', () => {
    renderComponent();

    fireEvent.click(screen.getByText('6 TEAMS'));

    expect(screen.getByDisplayValue('Team 6')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Team [1-6]/i)).toHaveLength(6);
  });

  it('blocks duplicate team names and disables submit button', async () => {
    renderComponent();

    const team2Input = screen.getByDisplayValue('Team 2');
    fireEvent.change(team2Input, { target: { value: 'Team 1' } });

    expect(await screen.findByText(/Name already taken by Team 1/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /CREATE TOURNAMENT ROOM/i });
    expect(submitBtn).toBeDisabled();
  });

  it('submits valid team configuration and navigates to room page', async () => {
    vi.mocked(rpcModule.rpcAdminCreateRoom).mockResolvedValue({
      id: 'room-123',
      code: 'ABCDEF',
      status: 'CREATED',
      team_count: 5,
    } as any);

    renderComponent();

    const submitBtn = screen.getByRole('button', { name: /CREATE TOURNAMENT ROOM/i });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(rpcModule.rpcAdminCreateRoom).toHaveBeenCalledTimes(1);
      expect(rpcModule.rpcAdminCreateRoom).toHaveBeenCalledWith(
        5,
        expect.arrayContaining([
          expect.objectContaining({ name: 'Team 1' }),
          expect.objectContaining({ name: 'Team 5' }),
        ])
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin/room/room-123');
    });
  });
});
