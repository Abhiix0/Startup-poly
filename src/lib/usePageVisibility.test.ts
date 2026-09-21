import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePageVisibility } from './usePageVisibility';

describe('usePageVisibility', () => {
  let hiddenGetter: any;

  beforeEach(() => {
    document.documentElement.dataset.paused = 'false';
    hiddenGetter = vi.spyOn(document, 'hidden', 'get');
  });

  afterEach(() => {
    hiddenGetter.mockRestore();
    delete document.documentElement.dataset.paused;
  });

  it('sets dataset.paused to false when tab is visible', () => {
    hiddenGetter.mockReturnValue(false);
    const { result } = renderHook(() => usePageVisibility());

    expect(result.current).toBe(true);
    expect(document.documentElement.dataset.paused).toBe('false');
  });

  it('sets dataset.paused to true when tab becomes hidden', () => {
    hiddenGetter.mockReturnValue(false);
    const { result } = renderHook(() => usePageVisibility());

    expect(result.current).toBe(true);
    expect(document.documentElement.dataset.paused).toBe('false');

    // Simulate tab going hidden
    act(() => {
      hiddenGetter.mockReturnValue(true);
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe(false);
    expect(document.documentElement.dataset.paused).toBe('true');

    // Simulate tab returning to visible
    act(() => {
      hiddenGetter.mockReturnValue(false);
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe(true);
    expect(document.documentElement.dataset.paused).toBe('false');
  });
});
