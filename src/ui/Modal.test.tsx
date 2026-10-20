import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal } from './Modal';

describe('Modal component', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="TEST MODAL">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('TEST MODAL')).not.toBeInTheDocument();
  });

  it('renders directly into document.body via portal when isOpen is true', () => {
    const { container } = render(
      <div id="nested-app-root">
        <Modal isOpen={true} onClose={vi.fn()} title="TEST MODAL">
          <p>Modal content</p>
        </Modal>
      </div>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // Verify it is portaled to document.body and not trapped inside #nested-app-root
    expect(dialog.parentElement).toBe(document.body);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('calls onClose when close button ✕ is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="TEST MODAL">
        <p>Modal content</p>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="TEST MODAL">
        <p>Modal content</p>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked, but not when modal box is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="TEST MODAL">
        <p>Modal content inside</p>
      </Modal>
    );

    // Clicking content inside does not trigger onClose
    const content = screen.getByText('Modal content inside');
    fireEvent.click(content);
    expect(handleClose).not.toHaveBeenCalled();

    // Clicking the outer backdrop triggers onClose
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="FOOTER TEST"
        footer={<button type="button">SUBMIT</button>}
      >
        <p>Body</p>
      </Modal>
    );

    expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument();
  });
});
