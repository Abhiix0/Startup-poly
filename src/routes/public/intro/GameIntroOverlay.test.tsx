import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { GameIntroOverlay } from './GameIntroOverlay';
import { PixelMario } from '../../../ui/pixel/PixelMario';
import { LogoShatter } from './LogoShatter';

describe('GameIntroOverlay & Mario Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial blue screen and logo on mount', () => {
    const handleComplete = vi.fn();
    render(<GameIntroOverlay onComplete={handleComplete} />);

    // Initially logo is intact and rendered
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('intro-intact-logo')).toBeInTheDocument();
    expect(screen.getByText('STARTUPOLY')).toBeInTheDocument();
    expect(handleComplete).not.toHaveBeenCalled();
  });

  it('progresses through Mario run, dash, and impact sequence to completion', () => {
    const handleComplete = vi.fn();
    render(<GameIntroOverlay onComplete={handleComplete} />);

    // Fast-forward to impact stage (~1950ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Logo should now be shattered
    expect(screen.getByTestId('intro-shattered-logo')).toBeInTheDocument();

    // Fast-forward to completion (~2550ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('allows user to skip immediately by pressing Escape key', () => {
    const handleComplete = vi.fn();
    render(<GameIntroOverlay onComplete={handleComplete} />);

    expect(handleComplete).not.toHaveBeenCalled();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('allows user to fast-forward immediately by clicking the overlay or pressing Space', () => {
    const handleComplete = vi.fn();
    render(<GameIntroOverlay onComplete={handleComplete} />);

    const overlay = screen.getByRole('dialog', { name: /Game Intro/i });
    fireEvent.click(overlay);

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('renders PixelMario with different poses correctly', () => {
    const { container: c1 } = render(<PixelMario pose="run-1" size={48} />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    expect(c1.querySelector('#mario-run-1')).toBeInTheDocument();

    const { container: c2 } = render(<PixelMario pose="dash" size={72} />);
    expect(c2.querySelector('#mario-dash')).toBeInTheDocument();

    const { container: c3 } = render(<PixelMario pose="run-2" size={48} />);
    expect(c3.querySelector('#mario-run-2')).toBeInTheDocument();

    const { container: c4 } = render(<PixelMario pose="run-3" size={48} />);
    expect(c4.querySelector('#mario-run-3')).toBeInTheDocument();
  });

  it('renders LogoShatter intact and shattered modes', () => {
    const { rerender } = render(<LogoShatter shattered={false} />);
    expect(screen.getByTestId('intro-intact-logo')).toBeInTheDocument();

    rerender(<LogoShatter shattered={true} />);
    expect(screen.getByTestId('intro-shattered-logo')).toBeInTheDocument();
  });
});
