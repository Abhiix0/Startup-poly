import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePointerParallax } from './usePointerParallax';

describe('usePointerParallax', () => {
  let mockContainer: HTMLDivElement;
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
    vi.restoreAllMocks();
  });

  it('attaches pointermove listener on fine-pointer devices without reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query.includes('pointer: fine')) {
        return { matches: true } as any;
      }
      if (query.includes('prefers-reduced-motion')) {
        return { matches: false } as any;
      }
      return { matches: false } as any;
    });

    const ref = { current: mockContainer };
    const { unmount } = renderHook(() => usePointerParallax(ref));

    expect(addEventListenerSpy).toHaveBeenCalledWith('pointermove', expect.any(Function), { passive: true });

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
  });

  it('skips attaching listener when prefers-reduced-motion is true', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query.includes('pointer: fine')) {
        return { matches: true } as any;
      }
      if (query.includes('prefers-reduced-motion')) {
        return { matches: true } as any; // Reduced motion active
      }
      return { matches: false } as any;
    });

    const ref = { current: mockContainer };
    renderHook(() => usePointerParallax(ref));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('pointermove', expect.any(Function), { passive: true });
    expect(mockContainer.style.getPropertyValue('--px')).toBe('0');
  });

  it('skips attaching listener on touch/coarse devices', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query.includes('pointer: fine')) {
        return { matches: false } as any; // Coarse touch screen
      }
      return { matches: false } as any;
    });

    const ref = { current: mockContainer };
    renderHook(() => usePointerParallax(ref));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('pointermove', expect.any(Function), { passive: true });
    expect(mockContainer.style.getPropertyValue('--px')).toBe('0');
  });
});
