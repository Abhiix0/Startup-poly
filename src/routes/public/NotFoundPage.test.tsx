import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage Component', () => {
  it('renders LEVEL NOT FOUND card and links back to start', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/LEVEL NOT FOUND/i)).toBeInTheDocument();
    expect(screen.getByText(/404 ERROR/i)).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /BACK TO START/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');

    const topLink = screen.getByRole('link', { name: /STARTUPOLY/i });
    expect(topLink).toBeInTheDocument();
    expect(topLink).toHaveAttribute('href', '/');
  });
});
