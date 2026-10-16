import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RulesPage, SECTIONS, BUSINESSES, BONUS_CARDS, CRISIS_CARDS, SPACE_COUNTS } from './RulesPage';

const renderRules = () =>
  render(
    <MemoryRouter>
      <RulesPage />
    </MemoryRouter>
  );

describe('RulesPage', () => {
  it('has 10 sections in order, each present in the document', () => {
    const { container } = renderRules();
    expect(SECTIONS).toHaveLength(10);
    SECTIONS.forEach((s) => expect(container.querySelector(`section#${s.id}`)).toBeInTheDocument());
    const ids = Array.from(container.querySelectorAll('main > section')).map((e) => e.id);
    expect(ids).toEqual(SECTIONS.map((s) => s.id));
  });

  it('section nav links point at section ids', () => {
    renderRules();
    const nav = screen.getByRole('navigation', { name: 'Rulebook sections' });
    expect(within(nav).getAllByRole('link')).toHaveLength(10);
    expect(within(nav).getByRole('link', { name: /The Board/ })).toHaveAttribute('href', '#board');
  });

  it('board spaces sum to 24', () => {
    expect(SPACE_COUNTS.reduce((n, s) => n + s.count, 0)).toBe(24);
  });

  it('lists 10 businesses and 6 bonus + 6 crisis cards', () => {
    renderRules();
    expect(BUSINESSES).toHaveLength(10);
    expect(BONUS_CARDS).toHaveLength(6);
    expect(CRISIS_CARDS).toHaveLength(6);
    expect(screen.getByText('Physics Wallah')).toBeInTheDocument();
    expect(screen.getByText('Lucky Break')).toBeInTheDocument();
    expect(screen.getByText('Investor Pullout')).toBeInTheDocument();
  });

  it('uses final START growth bonus and unconfirmed upgrade costs', () => {
    renderRules();
    const table = screen.getByRole('table', { name: 'START Growth Bonus' });
    expect(within(table).getByRole('row', { name: /^0 No additional CV$/ })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /^1 \+200 CV$/ })).toBeInTheDocument();
    expect(within(table).getByRole('row', { name: /^2 \+500 CV$/ })).toBeInTheDocument();
    expect(screen.getAllByText('To be confirmed')).toHaveLength(2);
    expect(screen.getAllByText(/exactly 50 minutes/i).length).toBeGreaterThan(0);
  });

  it('shows placeholder when board image fails to load', () => {
    renderRules();
    fireEvent.error(screen.getByRole('img', { name: /physical STARTUPOLY board/i }));
    expect(screen.getByText(/Physical board image coming soon/i)).toBeInTheDocument();
    expect(screen.getByText('public/board.png')).toBeInTheDocument();
  });

  it('links back home and to top', () => {
    renderRules();
    expect(screen.getByRole('link', { name: /← STARTUPOLY/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /BACK TO TOP/i })).toHaveAttribute('href', '#top');
  });
});
