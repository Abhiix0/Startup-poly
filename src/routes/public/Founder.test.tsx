import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { Founder } from './Founder';

describe('Founder Mascot Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders data-phase="enter" on first visit and transitions to "idle" on animationEnd', () => {
    const { container } = render(<Founder size={40} />);

    const wrapper = container.querySelector('.founder-wrapper');
    expect(wrapper).toHaveAttribute('data-phase', 'enter');

    const motionTrack = container.querySelector('.founder-motion-track');
    expect(motionTrack).toHaveClass('anim-founder-walk-in');

    // Simulate animationEnd
    act(() => {
      if (motionTrack) {
        fireEvent.animationEnd(motionTrack);
      }
    });

    expect(wrapper).toHaveAttribute('data-phase', 'idle');
    expect(motionTrack).toHaveClass('anim-founder-idle-bob');
  });

  it('renders data-phase="idle" immediately on repeat visit', () => {
    sessionStorage.setItem('startupoly:landing-seen', 'true');

    const { container } = render(<Founder size={40} />);
    const wrapper = container.querySelector('.founder-wrapper');

    expect(wrapper).toHaveAttribute('data-phase', 'idle');
    expect(container.querySelector('.founder-motion-track')).toHaveClass('anim-founder-idle-bob');
  });

  it('switches from enter to idle via fallback timeout if animationend does not fire', () => {
    const { container } = render(<Founder size={40} />);
    const wrapper = container.querySelector('.founder-wrapper');

    expect(wrapper).toHaveAttribute('data-phase', 'enter');

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(wrapper).toHaveAttribute('data-phase', 'idle');
  });

  it('verifies that speech bubble container has aria-hidden and contains copy', () => {
    const { container } = render(<Founder size={40} />);

    expect(container.querySelector('.founder-wrapper')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.founder-bubble-intro')).toHaveTextContent(/Let's build!/i);
    expect(container.querySelector('.founder-bubble-join')).toHaveTextContent(/Let's go!/i);
    expect(container.querySelector('.founder-bubble-admin')).toHaveTextContent(/Control room/i);
  });

  it('verifies absence of setInterval in Founder.tsx (CSS-only animations)', () => {
    const founderFile = path.resolve(__dirname, './Founder.tsx');
    const content = fs.readFileSync(founderFile, 'utf-8');

    expect(content.includes('setInterval')).toBe(false);
  });
});
