import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = true;

const ProblemChild: React.FC = () => {
  if (shouldThrow) {
    throw new Error('Explosive runtime error with sensitive internal stack info');
  }
  return <div>APPLICATION RUNNING NORMALLY</div>;
};

describe('ErrorBoundary Component', () => {
  let originalError: typeof console.error;

  beforeEach(() => {
    shouldThrow = true;
    originalError = console.error;
    console.error = vi.fn(); // Suppress react error boundary error logs in test output
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('shows GAME ERROR card, never shows raw error message or stack trace, and resets on TRY AGAIN', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // Shows GAME ERROR card
    expect(screen.getByText(/★ GAME ERROR ★/i)).toBeInTheDocument();
    expect(screen.getByText(/SOMETHING WENT WRONG/i)).toBeInTheDocument();

    // Security: never render raw error text
    expect(screen.queryByText(/Explosive runtime error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sensitive internal stack info/i)).not.toBeInTheDocument();

    // Fix condition
    shouldThrow = false;

    // Click TRY AGAIN to reset boundary
    const tryAgainBtn = screen.getByRole('button', { name: /TRY AGAIN/i });
    fireEvent.click(tryAgainBtn);

    // After reset, children render
    expect(screen.getByText('APPLICATION RUNNING NORMALLY')).toBeInTheDocument();
    expect(screen.queryByText(/★ GAME ERROR ★/i)).not.toBeInTheDocument();
  });
});
