import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WoodenSignboard } from './WoodenSignboard';

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

  it('renders castle variant correctly', () => {
    render(
      <WoodenSignboard
        title="🏰 ADMIN LOGIN"
        variant="castle"
      >
        <div>Castle Content</div>
      </WoodenSignboard>
    );

    expect(screen.getByText('🏰 ADMIN LOGIN')).toBeInTheDocument();
  });
});
