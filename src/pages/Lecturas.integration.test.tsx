import { vi, describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockLecturasService = vi.hoisted(() => ({
  list: vi.fn(),
  parametros: vi.fn(),
  ultima: vi.fn(),
}));

const mockCrudService = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock('../services/lecturas', () => ({
  lecturasService: mockLecturasService,
}));

vi.mock('../services/crud', () => ({
  crudService: () => ({ list: mockCrudService.list }),
}));

import { Lecturas } from '../pages/Lecturas';

describe('Lecturas page integration', () => {
  it('should render loading state then display rows and pagination', async () => {
    mockLecturasService.list.mockResolvedValueOnce({
      data: [{ id: 1, medidorId: 10, periodoId: 5, lecturaAnterior: 999, lecturaActual: 200, consumoKwh: 100 }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    mockLecturasService.parametros.mockResolvedValueOnce({
      estadosLectura: ['NORMAL', 'ANOMALIA'],
      tiposIncidencia: [],
    });
    mockCrudService.list.mockResolvedValueOnce([
      { id: 1, nombreZona: 'Norte' },
    ]);

    render(
      <MemoryRouter>
        <Lecturas />
      </MemoryRouter>
    );

    // Loading state
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // Wait for data — use unique value 999 to avoid clash with limit selector
    await waitFor(() => expect(screen.getByText('999')).toBeInTheDocument());
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('100 kWh')).toBeInTheDocument();
    expect(screen.getByText('Nueva lectura')).toBeInTheDocument();
  });

  it('should apply filters and refetch', async () => {
    mockLecturasService.list
      .mockResolvedValueOnce({
        data: [{ id: 1, medidorId: 10, periodoId: 5, lecturaAnterior: 777, lecturaActual: 200, consumoKwh: 100 }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        data: [{ id: 2, medidorId: 11, periodoId: 5, lecturaAnterior: 555, lecturaActual: 150, consumoKwh: 50 }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
    mockLecturasService.parametros.mockResolvedValueOnce({
      estadosLectura: ['NORMAL', 'ANOMALIA'],
    });
    mockCrudService.list.mockResolvedValueOnce([
      { id: 1, nombreZona: 'Norte' },
      { id: 2, nombreZona: 'Sur' },
    ]);

    render(
      <MemoryRouter>
        <Lecturas />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('777')).toBeInTheDocument());

    const zonaSelect = screen.getByLabelText(/zona/i);
    await userEvent.selectOptions(zonaSelect, '1');
    await userEvent.click(screen.getByRole('button', { name: /aplicar filtros/i }));

    await waitFor(() => expect(screen.getByText('555')).toBeInTheDocument());
    expect(mockLecturasService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ zonaId: '1', page: '1' })
    );
  });
});
