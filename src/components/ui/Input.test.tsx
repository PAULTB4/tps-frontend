import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('should render label and input', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should forward value and onChange', async () => {
    const handleChange = vi.fn();
    render(<Input label="Name" value="John" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('John');
    await userEvent.clear(input);
    await userEvent.type(input, 'Jane');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    render(<Input label="Field" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('should not render error when omitted', () => {
    const { container } = render(<Input label="Field" />);
    expect(container.querySelector('.text-stitch-error')).toBeNull();
  });

  it('should apply icon padding when icon is provided', () => {
    const { container } = render(<Input label="Search" icon="search" />);
    expect(container.querySelector('input')).toHaveClass('pl-9');
  });
});
