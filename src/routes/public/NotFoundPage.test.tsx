import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage Component', () => {
  it('renders the 404 message and links back home', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Lost in the Kingdom\?/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Error 404/i)).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /BACK TO HOME/i });
    expect(backLink).toHaveAttribute('href', '/');

    const brandLink = screen.getByRole('link', { name: /STARTUPOLY home/i });
    expect(brandLink).toHaveAttribute('href', '/');
  });
});
