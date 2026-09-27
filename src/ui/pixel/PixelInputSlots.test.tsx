import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelInputSlots } from './PixelInputSlots';

describe('PixelInputSlots Component', () => {
  it('renders 6 chunky slots and formats safe characters', () => {
    const handleChange = vi.fn();
    render(
      <PixelInputSlots
        value="ABC"
        onChange={handleChange}
        length={6}
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();

    const input = screen.getByLabelText('1. Room Code');
    fireEvent.change(input, { target: { value: 'abc890' } });

    // '0' is filtered out in safe alphabet -> 'ABC89'
    expect(handleChange).toHaveBeenCalledWith('ABC89');
  });
});
