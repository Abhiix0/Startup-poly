import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WoodenActionButton } from './WoodenActionButton';

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

  it('renders green and brick variants without throwing', () => {
    const { rerender } = render(
      <WoodenActionButton variant="green">
        CONFIRM
      </WoodenActionButton>
    );
    expect(screen.getByRole('button', { name: /CONFIRM/i })).toBeInTheDocument();

    rerender(
      <WoodenActionButton variant="brick">
        CANCEL
      </WoodenActionButton>
    );
    expect(screen.getByRole('button', { name: /CANCEL/i })).toBeInTheDocument();
  });

  it('disables button when disabled prop is passed', () => {
    const handleClick = vi.fn();
    render(
      <WoodenActionButton disabled onClick={handleClick}>
        LOCKED
      </WoodenActionButton>
    );

    const btn = screen.getByRole('button', { name: /LOCKED/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
