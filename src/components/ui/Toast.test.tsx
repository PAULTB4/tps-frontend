import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('should render success toast', () => {
    render(<Toast message="Guardado" />);
    expect(screen.getByText('Guardado')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('toast-success');
  });

  it('should render error toast', () => {
    render(<Toast message="Error" type="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('toast-error');
  });

  it('should return null when message is empty', () => {
    const { container } = render(<Toast message="" />);
    expect(container.firstChild).toBeNull();
  });
});
