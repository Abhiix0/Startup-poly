import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { PixelLoader } from './PixelLoader';

describe('PixelLoader Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('appears only after 250 ms delay and does not render for fast resolves', () => {
    const { unmount } = render(<PixelLoader label="LOADING GAME WORLD…" delayMs={250} />);

    // Immediate check: should not be mounted yet (prevents flashing)
    expect(screen.queryByText(/LOADING GAME WORLD…/i)).not.toBeInTheDocument();

    // After 100ms: still not visible
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByText(/LOADING GAME WORLD…/i)).not.toBeInTheDocument();

    // If fast resolve happens before 250ms, unmounting leaves no visible trace
    // Now advance past 250ms:
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText(/LOADING GAME WORLD…/i)).toBeInTheDocument();
    expect(screen.getByText(/STARTUPOLY/i)).toBeInTheDocument();
    unmount();
  });

  it('renders custom labels when provided', () => {
    render(<PixelLoader label="VERIFYING CREDENTIALS…" delayMs={0} />);
    expect(screen.getByText(/VERIFYING CREDENTIALS…/i)).toBeInTheDocument();
  });
});
