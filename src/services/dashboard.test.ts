import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('./api', () => ({
  api: mockApi,
}));

import { dashboardService } from './dashboard';

describe('dashboardService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('envía filtros limpios al resumen', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { totalLecturas: 1 } });

    const result = await dashboardService.resumen({ anioDesde: '2024', anioHasta: '2026', mes: '', zonaId: '3' });

    expect(mockApi.get).toHaveBeenCalledWith('/dashboard/resumen', { params: { anioDesde: '2024', anioHasta: '2026', zonaId: '3' } });
    expect(result).toEqual({ totalLecturas: 1 });
  });

  it('consume comparativo anual con los mismos filtros', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [{ anio: 2026, consumoKwh: 100 }] });

    await dashboardService.comparativoAnual({ tipoCliente: 'COMERCIAL', estadoLectura: 'VALIDA' });

    expect(mockApi.get).toHaveBeenCalledWith('/dashboard/comparativo-anual', { params: { tipoCliente: 'COMERCIAL', estadoLectura: 'VALIDA' } });
  });
});
