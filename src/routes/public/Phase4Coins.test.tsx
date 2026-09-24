import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { LandingPage } from './LandingPage';
import { TapCoinBurst } from './TapCoinBurst';

describe('Phase 4: Coin Micro-interaction Language & Easter Eggs', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. pressing JOIN MATCH spawns the button-press coin effect and cleans up after animation', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const joinLink = screen.getByRole('link', { name: /JOIN MATCH/i });
    expect(screen.queryByTestId('join-press-coins')).toBeNull();

    // Trigger pointerDown on JOIN MATCH
    fireEvent.pointerDown(joinLink);
    const pressCoins = screen.getByTestId('join-press-coins');
    expect(pressCoins).toBeInTheDocument();
    expect(pressCoins).toHaveClass('anim-press-coins');

    // Trigger onAnimationEnd
    fireEvent.animationEnd(pressCoins);
    expect(screen.queryByTestId('join-press-coins')).toBeNull();
  });

  it('2. pressing ADMIN CONSOLE does NOT spawn coins', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const adminLink = screen.getByRole('link', { name: /ADMIN CONSOLE/i });
    fireEvent.pointerDown(adminLink);
    expect(screen.queryByTestId('join-press-coins')).toBeNull();
  });

  it('3. tapping a non-interactive area spawns a burst at approximately the right coordinates', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('tap-burst-overlay')).toBeNull();

    // Fire pointerdown on the empty page container
    const pageWrapper = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(pageWrapper, { clientX: 200, clientY: 350 });

    const burst = screen.getByTestId('tap-coin-burst');
    expect(burst).toBeInTheDocument();
    expect(burst.style.left).toBe('200px');
    expect(burst.style.top).toBe('350px');

    // Self-removes on animationEnd
    fireEvent.animationEnd(burst);
    expect(screen.queryByTestId('tap-coin-burst')).toBeNull();
  });

  it('4. tapping directly on a link/button does NOT spawn a burst (closest guard)', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const joinLink = screen.getByRole('link', { name: /JOIN MATCH/i });
    fireEvent.pointerDown(joinLink, { clientX: 100, clientY: 100 });

    expect(screen.queryByTestId('tap-burst-overlay')).toBeNull();
    expect(screen.queryByTestId('tap-coin-burst')).toBeNull();
  });

  it('5. rapid double/triple tap within the throttle window spawns at most one burst', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const pageWrapper = container.firstElementChild as HTMLElement;

    // First tap
    fireEvent.pointerDown(pageWrapper, { clientX: 150, clientY: 250 });
    expect(screen.getAllByTestId('tap-coin-burst').length).toBe(1);

    // Immediate second & third tap (within 180ms)
    fireEvent.pointerDown(pageWrapper, { clientX: 160, clientY: 260 });
    fireEvent.pointerDown(pageWrapper, { clientX: 170, clientY: 270 });

    // Still only 1 burst
    expect(screen.getAllByTestId('tap-coin-burst').length).toBe(1);
  });

  it('6. reduced-motion mock -> button-press and tap-easter-egg spawn nothing at all (no DOM nodes)', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');

    // Mock matchMedia to match reduced-motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const joinLink = screen.getByRole('link', { name: /JOIN MATCH/i });
    fireEvent.pointerDown(joinLink);
    expect(screen.queryByTestId('join-press-coins')).toBeNull();

    const pageWrapper = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(pageWrapper, { clientX: 200, clientY: 300 });
    expect(screen.queryByTestId('tap-coin-burst')).toBeNull();

    window.matchMedia = originalMatchMedia;
  });

  it('7. listener is added once and removed on unmount (spy on add/removeEventListener)', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<TapCoinBurst isBooting={false} />);

    expect(addSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
  });

  it('8. section-entrance coin accent fires once on first-visit boot sequence and not on repeat visits', () => {
    // First visit: section entrance coin is present
    const { unmount, container: c1 } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(c1.querySelector('[data-testid="section-entrance-coin"]')).toBeInTheDocument();
    expect(c1.querySelector('.anim-section-coin-accent')).toBeInTheDocument();
    unmount();

    // Repeat visit: section entrance coin is absent
    sessionStorage.setItem('startupoly:landing-seen', 'true');
    const { container: c2 } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(c2.querySelector('[data-testid="section-entrance-coin"]')).toBeNull();
  });

  it('verifies rare ambient warp pipe coin peek exists in PixelWorld', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const pipeCoin = container.querySelector('[data-testid="ambient-pipe-coin"]');
    expect(pipeCoin).toBeInTheDocument();
    expect(pipeCoin).toHaveClass('anim-pipe-coin-peek');
  });
});
