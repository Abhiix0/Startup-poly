import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { ArcadeLink } from './ArcadeLink';
import { LandingPage } from '../routes/public/LandingPage';

describe('Phase 5: Physical Button Feedback Pass & ArcadeLink', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('verifies press/active state applies expected transform and shadow compression classes', () => {
    render(
      <MemoryRouter>
        <ArcadeLink to="/test" variant="primary" size="md">
          PLAY GAME
        </ArcadeLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /PLAY GAME/i });
    expect(link.className).toContain('active:translate-y-[2px]');
    expect(link.className).toContain('active:shadow-[2px_2px_0px_#102040]');
  });

  it('verifies hover state is visually distinct from active press state', () => {
    render(
      <MemoryRouter>
        <ArcadeLink to="/test" variant="secondary" size="md">
          JOIN MATCH
        </ArcadeLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /JOIN MATCH/i });
    expect(link.className).toContain('hover:-translate-y-[2px]');
    expect(link.className).toContain('hover:shadow-[6px_6px_0px_#102040]');
    expect(link.className).toContain('active:translate-y-[2px]');
    expect(link.className).toContain('active:shadow-[2px_2px_0px_#102040]');
  });

  it('verifies touch (pointerdown without hover) triggers press feedback for join CTA', () => {
    render(
      <MemoryRouter>
        <ArcadeLink to="/join" ctaType="join" size="md">
          JOIN MATCH
        </ArcadeLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /JOIN MATCH/i });
    expect(screen.queryByTestId('join-press-coins')).toBeNull();

    // Fire pointerDown directly (touch interaction)
    fireEvent.pointerDown(link);
    expect(screen.getByTestId('join-press-coins')).toBeInTheDocument();
  });

  it('verifies focus-visible applies chunky arcade focus ring', () => {
    render(
      <MemoryRouter>
        <ArcadeLink to="/admin" ctaType="admin" size="sm">
          ADMIN CONSOLE
        </ArcadeLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /ADMIN CONSOLE/i });
    expect(link.className).toContain('focus-visible:outline-none');
    expect(link.className).toContain('focus-visible:ring-2');
    expect(link.className).toContain('focus-visible:ring-[#22B14C]');
  });

  it('verifies touch target size styles satisfy accessibility minimums (>=44px height)', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ArcadeLink to="/test" size="sm">
          SMALL
        </ArcadeLink>
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /SMALL/i }).className).toContain('min-h-[44px]');

    rerender(
      <MemoryRouter>
        <ArcadeLink to="/test" size="md">
          MEDIUM
        </ArcadeLink>
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /MEDIUM/i }).className).toContain('min-h-[48px]');

    rerender(
      <MemoryRouter>
        <ArcadeLink to="/test" size="lg">
          LARGE
        </ArcadeLink>
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /LARGE/i }).className).toContain('min-h-[56px]');
  });

  it('verifies reduced-motion classes suppress transform-based movement while preserving shadow/color', () => {
    render(
      <MemoryRouter>
        <ArcadeLink to="/test" size="md">
          ACTION
        </ArcadeLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /ACTION/i });
    expect(link.className).toContain('motion-reduce:transform-none');
    expect(link.className).toContain('motion-reduce:hover:transform-none');
    expect(link.className).toContain('motion-reduce:active:transform-none');
  });

  it('verifies LandingPage CTAs implement shadow compression and motion-reduce classes', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const joinLink = screen.getByRole('link', { name: /JOIN MATCH/i });
    const adminLink = screen.getByRole('link', { name: /ADMIN CONSOLE/i });

    // JOIN MATCH: physical compression down to 1px shadow
    expect(joinLink.className).toContain('active:shadow-[0_0px_0_#B8860B,1px_1px_0_#181512]');
    expect(joinLink.className).toContain('motion-reduce:active:translate-y-0');

    // ADMIN CONSOLE: physical compression down to 1px shadow
    expect(adminLink.className).toContain('active:shadow-[0_1px_0_#0F172A,1px_1px_0_#181E28]');
    expect(adminLink.className).toContain('motion-reduce:active:translate-y-0');
  });
});
