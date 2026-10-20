import { describe, it, expect, beforeEach } from 'vitest';
import { sounds } from './sound';

describe('SoundEngine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles sound on and off', () => {
    const initial = sounds.isEnabled();
    const next = sounds.toggle();
    expect(next).toBe(!initial);
    expect(sounds.isEnabled()).toBe(next);
  });

  it('persists preference to localStorage', () => {
    sounds.setEnabled(false);
    expect(localStorage.getItem('startupoly:sound')).toBe('false');
    sounds.setEnabled(true);
    expect(localStorage.getItem('startupoly:sound')).toBe('true');
  });

  it('handles sound methods safely in node/mock environment without throwing', () => {
    expect(() => sounds.playCoin()).not.toThrow();
    expect(() => sounds.playUpgrade()).not.toThrow();
    expect(() => sounds.playDamage()).not.toThrow();
    expect(() => sounds.playWhistle()).not.toThrow();
    expect(() => sounds.playBuzzer()).not.toThrow();
    expect(() => sounds.playGong()).not.toThrow();
    expect(() => sounds.playVictory()).not.toThrow();
  });
});
