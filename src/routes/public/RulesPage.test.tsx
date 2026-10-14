import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RulesPage } from './RulesPage';
import { BOARD_SPACES_24, BUSINESS_CATALOG_FULL, BONUS_CARDS_FULL, CRISIS_CARDS_FULL } from './RulesSection';

describe('RulesPage & Authoritative Field Guide', () => {
  const renderRules = () =>
    render(
      <MemoryRouter>
        <RulesPage />
      </MemoryRouter>
    );

  it('renders RulesPage with id="top" anchor for back-to-top scrolling', () => {
    const { container } = renderRules();
    const topElement = container.querySelector('#top');
    expect(topElement).toBeInTheDocument();

    const backToTopLink = screen.getByRole('link', { name: /BACK TO TOP/i });
    expect(backToTopLink).toHaveAttribute('href', '#top');
  });

  it('renders exactly 24 board spaces in the interactive board circuit', () => {
    renderRules();
    expect(BOARD_SPACES_24).toHaveLength(24);

    // Verify 1 START space
    const startSpaces = BOARD_SPACES_24.filter((s) => s.category === 'START');
    expect(startSpaces).toHaveLength(1);
    expect(startSpaces[0].num).toBe(1);

    // Verify 3 Action spaces (B, C, D)
    const actionSpaces = BOARD_SPACES_24.filter((s) => s.category === 'ACTION');
    expect(actionSpaces).toHaveLength(3);
    expect(actionSpaces.map((s) => s.name)).toEqual(['ACTION B', 'ACTION C', 'ACTION D']);

    // Verify 10 Business spaces
    const businessSpaces = BOARD_SPACES_24.filter((s) => s.category === 'BUSINESS');
    expect(businessSpaces).toHaveLength(10);

    // Verify 4 Bonus spaces
    const bonusSpaces = BOARD_SPACES_24.filter((s) => s.category === 'BONUS');
    expect(bonusSpaces).toHaveLength(4);

    // Verify 4 Crisis spaces
    const crisisSpaces = BOARD_SPACES_24.filter((s) => s.category === 'CRISIS');
    expect(crisisSpaces).toHaveLength(4);

    // Verify 2 Wildcard spaces
    const wildcardSpaces = BOARD_SPACES_24.filter((s) => s.category === 'WILDCARD');
    expect(wildcardSpaces).toHaveLength(2);
  });

  it('displays the physical board artwork pending placeholder notice', () => {
    renderRules();
    expect(screen.getByText(/FINAL BOARD ARTWORK WILL REPLACE THIS PLACEHOLDER/i)).toBeInTheDocument();
    expect(screen.getByText(/24-SPACE PHYSICAL BOARD CIRCUIT/i)).toBeInTheDocument();
  });

  it('renders the complete 10-business catalog with provisional labels', () => {
    renderRules();
    expect(BUSINESS_CATALOG_FULL).toHaveLength(10);

    // Official businesses
    expect(screen.getAllByText('EdTech').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SaaS').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('E-Commerce').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('FinTech').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('HealthTech').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('AI / DeepTech').length).toBeGreaterThanOrEqual(1);

    // Provisional businesses
    expect(screen.getAllByText('DevTools / Infrastructure').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cybersecurity').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CleanTech / Energy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Robotics & IoT').length).toBeGreaterThanOrEqual(1);

    // Provisional tags exist
    const provisionalTags = screen.getAllByText(/PROVISIONAL/i);
    expect(provisionalTags.length).toBeGreaterThanOrEqual(4);
  });

  it('renders all 6 Bonus Cards and all 6 Crisis Cards with full effects', () => {
    renderRules();
    expect(BONUS_CARDS_FULL).toHaveLength(6);
    expect(CRISIS_CARDS_FULL).toHaveLength(6);

    expect(screen.getByText('Startup Grant')).toBeInTheDocument();
    expect(screen.getByText('Viral Growth')).toBeInTheDocument();
    expect(screen.getByText('Government Incentive')).toBeInTheDocument();
    expect(screen.getByText('Premium Deal')).toBeInTheDocument();
    expect(screen.getByText('Founder Bonus')).toBeInTheDocument();
    expect(screen.getByText('Lucky Break')).toBeInTheDocument();

    expect(screen.getByText('Tax Raid')).toBeInTheDocument();
    expect(screen.getByText('Market Crash')).toBeInTheDocument();
    expect(screen.getByText('Legal Trouble')).toBeInTheDocument();
    expect(screen.getByText('Burn Rate Spike')).toBeInTheDocument();
    expect(screen.getByText('Bad PR')).toBeInTheDocument();
    expect(screen.getByText('Investor Pullout')).toBeInTheDocument();
  });

  it('allows clicking rules tabs to switch active rule sections', () => {
    renderRules();

    // Default tab is Objective
    expect(screen.getByRole('heading', { name: /Objective & Match Timing/i })).toBeInTheDocument();

    // Click Turn System tab
    const turnTab = screen.getByRole('button', { name: /Turn System & Dice Movement/i });
    fireEvent.click(turnTab);

    expect(screen.getByRole('heading', { name: /Turn System & Dice Movement/i })).toBeInTheDocument();
    expect(screen.getByText(/Extra Roll on Six/i)).toBeInTheDocument();
    expect(screen.getByText(/Three Sixes Rule/i)).toBeInTheDocument();

    // Click Action Spaces tab
    const actionTab = screen.getByRole('button', { name: /Action Spaces/i });
    fireEvent.click(actionTab);

    expect(screen.getByText(/Pitch to Investors/i)).toBeInTheDocument();
    expect(screen.getByText(/Lose the Feature/i)).toBeInTheDocument();
    expect(screen.getByText(/Steal Talent/i)).toBeInTheDocument();
  });

  it('clicking a tile in the board circuit inspects that space', () => {
    renderRules();

    // Click on Space #07 (ACTION B)
    const actionSpaceButton = screen.getByRole('button', { name: /#07/i });
    fireEvent.click(actionSpaceButton);

    expect(screen.getByText('SPACE 7 OF 24')).toBeInTheDocument();
    expect(screen.getByText(/Pitch to Investors/i)).toBeInTheDocument();
  });
});
