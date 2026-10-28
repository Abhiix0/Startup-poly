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
});
