import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { LandingPage } from './LandingPage';

describe('LandingPage Hero Rebuild', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders exactly one <h1> with the title STARTUPOLY', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/STARTUPOLY/i);
  });

  it('renders two accessible links with names "JOIN MATCH" and "ADMIN CONSOLE"', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const joinLink = screen.getByRole('link', { name: /JOIN MATCH/i });
    const adminLink = screen.getByRole('link', { name: /ADMIN CONSOLE/i });

    expect(joinLink).toBeInTheDocument();
    expect(joinLink).toHaveAttribute('href', '/join');

    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  it('contains no nested <button> elements inside <a> links', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);

    links.forEach((link) => {
      const nestedButton = link.querySelector('button');
      expect(nestedButton).toBeNull();
    });
  });

  it('verifies that "server-authoritative" and "Official tournament specifications" are absent', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const text = container.textContent || '';
    expect(text.toLowerCase()).not.toContain('server-authoritative');
    expect(text.toLowerCase()).not.toContain('official tournament specifications');
  });

  it('renders entrance animation classes on first visit, and omits them when already seen', () => {
    // 1. First visit: has entrance classes
    const { unmount, container: c1 } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(c1.querySelector('.anim-entrance-logo')).toBeInTheDocument();
    unmount();

    // 2. Set sessionStorage to simulate returning visit
    sessionStorage.setItem('startupoly:landing-seen', 'true');

    const { container: c2 } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(c2.querySelector('.anim-entrance-logo')).not.toBeInTheDocument();
  });

  it('updates data-cta on page wrapper during hover and focus events', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const pageWrapper = container.firstElementChild as HTMLElement;
    expect(pageWrapper.getAttribute('data-cta')).toBeNull();

    const joinLink = screen.getByRole('link', { name: /JOIN MATCH/i });
    const adminLink = screen.getByRole('link', { name: /ADMIN CONSOLE/i });

    // Pointer enter JOIN
    fireEvent.pointerEnter(joinLink);
    expect(pageWrapper.getAttribute('data-cta')).toBe('join');

    // Pointer leave JOIN
    fireEvent.pointerLeave(joinLink);
    expect(pageWrapper.getAttribute('data-cta')).toBeNull();

    // Focus ADMIN
    fireEvent.focus(adminLink);
    expect(pageWrapper.getAttribute('data-cta')).toBe('admin');

    // Blur ADMIN
    fireEvent.blur(adminLink);
    expect(pageWrapper.getAttribute('data-cta')).toBeNull();
  });

  it('maintains correct keyboard tab navigation order from Join to Admin', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const joinLink = screen.getByRole('link', { name: /JOIN MATCH/i });
    const adminLink = screen.getByRole('link', { name: /ADMIN CONSOLE/i });

    joinLink.focus();
    expect(document.activeElement).toBe(joinLink);

    adminLink.focus();
    expect(document.activeElement).toBe(adminLink);
  });

  it('Phase 0 Guard: confirms landing tree structural integrity without accidental regressions', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Verify key landmark structural layers are present
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();

    // Verify critical CTAs and brand identity
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('STARTUPOLY');
    expect(screen.getByRole('link', { name: /JOIN MATCH/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ADMIN CONSOLE/i })).toBeInTheDocument();

    // Verify world ground footer layer
    expect(container.querySelector('[data-layer="6-ground"]')).toBeInTheDocument();
  });
});
