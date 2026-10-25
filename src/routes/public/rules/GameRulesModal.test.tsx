import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GameRulesModal } from './GameRulesModal';
import { LandingPage } from '../LandingPage';

describe('GameRulesModal and LandingPage Integration', () => {
  it('does not render when isOpen is false', () => {
    render(<GameRulesModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders correctly when isOpen is true and shows How to Play by default', () => {
    const handleClose = vi.fn();
    render(<GameRulesModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/STARTUPOLY — OFFICIAL RULES/i)).toBeInTheDocument();
    expect(screen.getByText(/MATCH SCHEDULE/i)).toBeInTheDocument();
    expect(screen.getByText(/50 Mins:/i)).toBeInTheDocument();
    expect(screen.getByText(/₹1,000/i)).toBeInTheDocument();
    expect(screen.getByText(/VICTORY CONDITION/i)).toBeInTheDocument();
    expect(screen.getByText(/Three 6s Rule:/i)).toBeInTheDocument();
  });

  it('navigates through all four tabs seamlessly', () => {
    render(<GameRulesModal isOpen={true} onClose={vi.fn()} />);

    // Tab 2: Board Preview
    const boardPreviewTab = screen.getByRole('button', { name: /BOARD PREVIEW/i });
    fireEvent.click(boardPreviewTab);
    expect(
      screen.getByText(/OFFICIAL 24-SPACE PHYSICAL BOARD/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/10 Spaces/i)).toBeInTheDocument();

    // Tab 3: Businesses
    const businessesTab = screen.getByRole('button', { name: /BUSINESSES/i });
    fireEvent.click(businessesTab);
    expect(screen.getByText(/ACQUISITION & UPGRADE RULES/i)).toBeInTheDocument();
    expect(screen.getByText(/10 STARTUP BUSINESSES/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Provisional — Pending Rulebook Confirmation/i).length).toBeGreaterThan(0);

    // Tab 4: Spaces & Cards
    const spacesCardsTab = screen.getByRole('button', { name: /SPACES & CARDS/i });
    fireEvent.click(spacesCardsTab);
    expect(screen.getByText(/CORNER ACTION SPACES/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTION B: PITCH/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTION C: TECH DEBT/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTION D: STEAL TALENT/i)).toBeInTheDocument();
    expect(screen.getByText(/Reward roll is for cash only and does NOT move token/i)).toBeInTheDocument();
    expect(screen.getByText(/WILDCARD CHALLENGES/i)).toBeInTheDocument();
  });

  it('calls onClose when close button or Escape key is triggered', () => {
    const handleClose = vi.fn();
    render(<GameRulesModal isOpen={true} onClose={handleClose} />);

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Close rules/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('opens rules modal from LandingPage GAME RULES corner button', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const rulesBtn = screen.getByTestId('game-rules-button');
    expect(rulesBtn).toBeInTheDocument();
    expect(rulesBtn).toHaveTextContent(/GAME RULES/i);

    // Initially rules modal is not open
    expect(
      screen.queryByRole('dialog', { name: /STARTUPOLY — OFFICIAL RULES/i })
    ).toBeNull();

    // Click GAME RULES button
    fireEvent.click(rulesBtn);
    expect(
      screen.getByRole('dialog', { name: /STARTUPOLY — OFFICIAL RULES/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/STARTUPOLY — OFFICIAL RULES/i)).toBeInTheDocument();
  });
});
