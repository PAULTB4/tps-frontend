import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';

type Row = { id: number; name: string; age: number };

const columns = [
  { header: 'Nombre', accessor: 'name' as const },
  { header: 'Edad', accessor: 'age' as const },
];

const data: Row[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
];

const meta = { page: 2, limit: 20, total: 45, totalPages: 3 };

describe('DataTable', () => {
  it('should render column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Edad')).toBeInTheDocument();
  });

  it('should render rows', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<DataTable columns={columns} data={[]} loading />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should show empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} empty="Nada por aquí" />);
    expect(screen.getByText('Nada por aquí')).toBeInTheDocument();
  });

  it('should call onPageChange when clicking a page button', async () => {
    const onPageChange = vi.fn();
    render(<DataTable columns={columns} data={data} meta={meta} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onLimitChange when selecting a new limit', async () => {
    const onLimitChange = vi.fn();
    render(<DataTable columns={columns} data={data} meta={meta} onLimitChange={onLimitChange} />);
    const select = screen.getByDisplayValue('20');
    await userEvent.selectOptions(select, '50');
    expect(onLimitChange).toHaveBeenCalledWith(50);
  });

  it('should disable previous button on first page', () => {
    render(<DataTable columns={columns} data={data} meta={{ ...meta, page: 1 }} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText(/página anterior/i)).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(<DataTable columns={columns} data={data} meta={{ ...meta, page: 3, totalPages: 3 }} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText(/página siguiente/i)).toBeDisabled();
  });

  it('should render pagination info', () => {
    render(<DataTable columns={columns} data={data} meta={meta} />);
    expect(screen.getByText(/mostrando/i)).toHaveTextContent('21 a 40 de 45 registros');
  });

  it('should render actions column when actions prop is provided', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        actions={(row) => <button>Editar {row.name}</button>}
      />
    );
    expect(screen.getByText('Editar Alice')).toBeInTheDocument();
    expect(screen.getByText('Editar Bob')).toBeInTheDocument();
  });

  it('should use accessor function when provided', () => {
    const fnColumns = [
      { header: 'Nombre', accessor: (row: Row) => `Sr./Sra. ${row.name}` },
    ];
    render(<DataTable columns={fnColumns} data={data} />);
    expect(screen.getByText('Sr./Sra. Alice')).toBeInTheDocument();
  });

  it('should show fallback "-" for missing values', () => {
    const sparse = [{ id: 1, name: 'Alice' }] as any[];
    render(<DataTable columns={columns} data={sparse} />);
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
