import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRoomPage } from './AdminRoomPage';
import { AppError } from '../../lib/errors';

vi.mock('../../data/useAdminRoom', () => ({
  useAdminRoom: () => ({
    snapshot: null,
    status: 'error',
    error: new AppError('SCHEMA_OUTDATED'),
    refetch: vi.fn(),
    connection: 'LIVE',
    lastUpdated: '',
    isStale: false,
    staleAgeSeconds: 0,
  }),
}));

describe('AdminRoomPage', () => {
  it('shows the out-of-date banner instead of crashing', () => {
    render(
      <MemoryRouter initialEntries={['/admin/room/r1']}>
        <Routes>
          <Route path="/admin/room/:roomId" element={<AdminRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Database is out of date. Apply the latest migrations.')).toBeInTheDocument();
  });
});
