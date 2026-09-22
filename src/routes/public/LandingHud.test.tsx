import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LandingHud } from './LandingHud';
import { LiveIndicator } from './LiveIndicator';

describe('LandingHud Component', () => {
  it('renders four items with the exact labels and values in semantic list', () => {
    render(<LandingHud />);

    const list = screen.getByRole('list', { name: /match facts/i });
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);

    // Item 1: 50 MIN
    expect(items[0]).toHaveTextContent(/50/);
    expect(items[0]).toHaveTextContent(/MIN/);
    expect(items[0]).toHaveAttribute('aria-label', '50 MIN');

    // Item 2: 5–6 TEAMS
    expect(items[1]).toHaveTextContent(/5–6/);
    expect(items[1]).toHaveTextContent(/TEAMS/);
    expect(items[1]).toHaveAttribute('aria-label', '5–6 TEAMS');

    // Item 3: ₹1,000 START
    expect(items[2]).toHaveTextContent(/₹1,000/);
    expect(items[2]).toHaveTextContent(/START/);
    expect(items[2]).toHaveAttribute('aria-label', '₹1,000 START');

    // Item 4: MAX 3 BUSINESSES
    expect(items[3]).toHaveTextContent(/MAX 3/);
    expect(items[3]).toHaveTextContent(/BUSINESSES/);
    expect(items[3]).toHaveAttribute('aria-label', 'MAX 3 BUSINESSES');
  });

  it('LiveIndicator has no aria-live and does not render the words "LIVE GAME"', () => {
    const { container } = render(<LiveIndicator />);

    // Must NOT have aria-live (no announcer spam)
    expect(container.querySelector('[aria-live]')).toBeNull();

    // Must render LIVE and NEVER LIVE GAME
    const text = container.textContent || '';
    expect(text).toContain('LIVE');
    expect(text.toLowerCase()).not.toContain('live game');
  });
});
