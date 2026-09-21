import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TeamJoinPage } from './TeamJoinPage';
import * as rpcModule from '../../data/rpc';
import * as clientModule from '../../data/client';
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
  rpcGetLobby: vi.fn(),
  rpcJoinTeam: vi.fn(),
}));

vi.mock('../../data/client', () => ({
  ensureAnonymousSession: vi.fn(),
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

describe('TeamJoinPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLobby = {
    status: 'LOBBY',
    team_count: 5,
    teams: [
      { slot: 1, name: 'Alpha Rockets', color: '#E52521', claimed: false },
      { slot: 2, name: 'Beta Builders', color: '#0099FF', claimed: true },
    ],
  };

  const renderComponent = () =>
    render(
      <ToastProvider>
        <MemoryRouter>
          <TeamJoinPage />
        </MemoryRouter>
      </ToastProvider>
    );

  it('filters safe-alphabet characters and triggers rpcGetLobby on 6 characters', async () => {
    vi.mocked(rpcModule.rpcGetLobby).mockResolvedValue(mockLobby as any);
    renderComponent();

    const codeInput = screen.getByLabelText(/1\. Room Code/i) as HTMLInputElement;
    // Type lowercase and unsafe characters (0 is unsafe in safe-alphabet) -> stripped to 'ABC89' (length 5)
    fireEvent.change(codeInput, { target: { value: 'abc890' } });
    expect(codeInput.value).toBe('ABC89');
    expect(rpcModule.rpcGetLobby).not.toHaveBeenCalled();

    // Enter full 6 valid characters
    fireEvent.change(codeInput, { target: { value: 'ABC892' } });

    await waitFor(() => {
      expect(rpcModule.rpcGetLobby).toHaveBeenCalledWith('ABC892');
      expect(screen.getByText('Alpha Rockets')).toBeInTheDocument();
      expect(screen.getByText('Beta Builders')).toBeInTheDocument();
    });
  });

  it('selects team and connects with 4-digit PIN', async () => {
    vi.mocked(rpcModule.rpcGetLobby).mockResolvedValue(mockLobby as any);
    vi.mocked(rpcModule.rpcJoinTeam).mockResolvedValue({ team_id: 't-1', room_id: 'r-1' } as any);
    vi.mocked(clientModule.ensureAnonymousSession).mockResolvedValue({} as any);

    renderComponent();

    // 1. Enter room code
    const codeInput = screen.getByLabelText(/1\. Room Code/i);
    fireEvent.change(codeInput, { target: { value: 'ABC892' } });

    await waitFor(() => {
      expect(screen.getByText('Beta Builders')).toBeInTheDocument();
    });

    // 2. Select Beta Builders (Slot 2)
    fireEvent.click(screen.getByText('Beta Builders'));

    // 3. Enter PIN
    const pinInput = screen.getByLabelText(/3\. 4-Digit Secret PIN/i);
    fireEvent.change(pinInput, { target: { value: '9876' } });

    // 4. Submit
    const connectBtn = screen.getByRole('button', { name: /ENTER WORLD|CONNECT PHONE/i });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      expect(clientModule.ensureAnonymousSession).toHaveBeenCalledTimes(1);
      expect(rpcModule.rpcJoinTeam).toHaveBeenCalledWith('ABC892', 2, '9876');
      expect(mockNavigate).toHaveBeenCalledWith('/team');
    });
  });

  it('displays neutral error message on wrong PIN or mismatch', async () => {
    vi.mocked(rpcModule.rpcGetLobby).mockResolvedValue(mockLobby as any);
    vi.mocked(clientModule.ensureAnonymousSession).mockResolvedValue({} as any);
    vi.mocked(rpcModule.rpcJoinTeam).mockRejectedValue(new Error('BAD_CODE_OR_PIN'));

    renderComponent();

    const codeInput = screen.getByLabelText(/1\. Room Code/i);
    fireEvent.change(codeInput, { target: { value: 'ABC892' } });

    await waitFor(() => {
      expect(screen.getByText('Alpha Rockets')).toBeInTheDocument();
    });

    const pinInput = screen.getByLabelText(/3\. 4-Digit Secret PIN/i);
    fireEvent.change(pinInput, { target: { value: '0000' } });

    const connectBtn = screen.getByRole('button', { name: /ENTER WORLD|CONNECT PHONE/i });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      const errorElements = screen.getAllByText(/Code, team or PIN didn't match/i);
      expect(errorElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays rate limit error message when TOO_MANY_ATTEMPTS is returned', async () => {
    vi.mocked(rpcModule.rpcGetLobby).mockResolvedValue(mockLobby as any);
    vi.mocked(clientModule.ensureAnonymousSession).mockResolvedValue({} as any);
    const rateLimitError = new Error('Too many requests');
    (rateLimitError as any).code = 'TOO_MANY_ATTEMPTS';
    vi.mocked(rpcModule.rpcJoinTeam).mockRejectedValue(rateLimitError);

    renderComponent();

    const codeInput = screen.getByLabelText(/1\. Room Code/i);
    fireEvent.change(codeInput, { target: { value: 'ABC892' } });

    await waitFor(() => {
      expect(screen.getByText('Alpha Rockets')).toBeInTheDocument();
    });

    const pinInput = screen.getByLabelText(/3\. 4-Digit Secret PIN/i);
    fireEvent.change(pinInput, { target: { value: '1111' } });

    const connectBtn = screen.getByRole('button', { name: /ENTER WORLD|CONNECT PHONE/i });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      const rateLimitElements = screen.getAllByText(/Too many tries — wait a minute/i);
      expect(rateLimitElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
