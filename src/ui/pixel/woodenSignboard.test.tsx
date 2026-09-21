import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WoodenSignboard } from './WoodenSignboard';
import { PixelInputSlots } from './PixelInputSlots';
import { WoodenActionButton } from './WoodenActionButton';

describe('WoodenSignboard Component', () => {
  it('renders title, subtitle and instruction within wooden container', () => {
    render(
      <WoodenSignboard
        title="🍄 JOIN THE MATCH"
        subtitle="ENTER YOUR ROOM CODE"
        instruction="LOOK AT THE BIG SCREEN FOR YOUR CODE"
      >
        <div data-testid="signboard-child">Content</div>
      </WoodenSignboard>
    );

    expect(screen.getByText('🍄 JOIN THE MATCH')).toBeInTheDocument();
    expect(screen.getByText('ENTER YOUR ROOM CODE')).toBeInTheDocument();
    expect(screen.getByText('LOOK AT THE BIG SCREEN FOR YOUR CODE')).toBeInTheDocument();
    expect(screen.getByTestId('signboard-child')).toBeInTheDocument();
  });
});

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

describe('WoodenActionButton Component', () => {
  it('renders interactive action plank with click handling', () => {
    const handleClick = vi.fn();
    render(
      <WoodenActionButton onClick={handleClick} variant="gold">
        ENTER WORLD →
      </WoodenActionButton>
    );

    const btn = screen.getByRole('button', { name: /ENTER WORLD/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <WoodenActionButton isLoading={true}>
        ENTER WORLD →
      </WoodenActionButton>
    );

    expect(screen.getByText(/CONNECTING.../i)).toBeInTheDocument();
  });
});
