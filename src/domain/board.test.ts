import { describe, expect, it } from 'vitest';
import { BOARD_SPACES, calculateMovement, getBoardSpace } from './board';

describe('physical board order', () => {
  it('matches the spaces clockwise from START, including their business keys', () => {
    expect(BOARD_SPACES.map((space) => space.businessKey ?? space.type)).toEqual([
      'START', 'ai_deeptech', 'BONUS', 'saas', 'CRISIS', 'fintech',
      'ACTION_B', 'healthtech', 'BONUS', 'WILDCARD', 'edtech', 'CRISIS',
      'ACTION_C', 'devtools', 'BONUS', 'cybersecurity', 'CRISIS', 'cleantech',
      'ACTION_D', 'robotics', 'BONUS', 'WILDCARD', 'CRISIS', 'ecommerce',
    ]);
    expect(BOARD_SPACES.map((space) => space.index)).toEqual(Array.from({ length: 24 }, (_, index) => index));
    expect(getBoardSpace(calculateMovement(23, 2).newPos).businessKey).toBe('ai_deeptech');
    expect(calculateMovement(23, 2).passedStart).toBe(true);
  });

  it('has 24 spaces with the approved type counts and corner layout', () => {
    const count = (t: string) => BOARD_SPACES.filter((x) => x.type === t).length;
    expect(BOARD_SPACES).toHaveLength(24);
    expect([count('START'), count('BUSINESS'), count('BONUS'), count('CRISIS'), count('WILDCARD')]).toEqual([1, 10, 4, 4, 2]);
    expect(['ACTION_B', 'ACTION_C', 'ACTION_D'].map(count)).toEqual([1, 1, 1]);
    const corners = BOARD_SPACES.filter((x) => ['START', 'ACTION_B', 'ACTION_C', 'ACTION_D'].includes(x.type)).map((x) => x.index);
    expect(corners).toEqual([0, 6, 12, 18]);
  });
});
