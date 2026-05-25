import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./api', () => ({
  api: mockApi,
}));

import { lecturasService } from './lecturas';

describe('lecturasService integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('parametros should call GET /lecturas/parametros', async () => {
    const mockData = { estadosLectura: ['NORMAL', 'ANOMALIA'] };
    mockApi.get.mockResolvedValueOnce({ data: mockData });

    const result = await lecturasService.parametros();

    expect(mockApi.get).toHaveBeenCalledWith('/lecturas/parametros');
    expect(result).toEqual(mockData);
  });

  it('ultima should call GET /lecturas/ultima with medidorId param', async () => {
    const mockData = { id: 1, lecturaActual: 500 };
    mockApi.get.mockResolvedValueOnce({ data: mockData });

    const result = await lecturasService.ultima(42);

    expect(mockApi.get).toHaveBeenCalledWith('/lecturas/ultima', { params: { medidorId: 42 } });
    expect(result).toEqual(mockData);
  });

  it('previsualizar should POST /lecturas/previsualizar', async () => {
    const payload = { medidorId: 1, lecturaActual: 600 };
    mockApi.post.mockResolvedValueOnce({ data: { consumo: 100 } });

    const result = await lecturasService.previsualizar(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/lecturas/previsualizar', payload);
    expect(result).toEqual({ consumo: 100 });
  });

  it('list should GET /lecturas with cleaned params and extract rows/meta', async () => {
    const responseData = {
      data: [{ id: 1, medidorId: 10 }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    mockApi.get.mockResolvedValueOnce({ data: responseData });

    const result = await lecturasService.list({ anio: '2024', mes: '', page: '1', limit: '20' });

    // cleanParams should strip empty 'mes'
    expect(mockApi.get).toHaveBeenCalledWith('/lecturas', {
      params: { anio: '2024', page: '1', limit: '20' },
    });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('list should return empty arrays when response has no pagination wrapper', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    const result = await lecturasService.list();

    expect(result.data).toEqual([]);
    expect(result.meta).toBeUndefined();
  });

  it('create should POST /lecturas', async () => {
    const payload = { medidorId: 1, lecturaActual: 100 };
    mockApi.post.mockResolvedValueOnce({ data: { id: 5 } });

    const result = await lecturasService.create(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/lecturas', payload);
    expect(result).toEqual({ id: 5 });
  });

  it('get should call GET /lecturas/:id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 7 } });

    const result = await lecturasService.get(7);

    expect(mockApi.get).toHaveBeenCalledWith('/lecturas/7');
    expect(result).toEqual({ id: 7 });
  });

  it('update should PATCH /lecturas/:id', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { id: 8 } });

    const result = await lecturasService.update(8, { observacion: 'OK' });

    expect(mockApi.patch).toHaveBeenCalledWith('/lecturas/8', { observacion: 'OK' });
    expect(result).toEqual({ id: 8 });
  });

  it('remove should DELETE /lecturas/:id', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { id: 9 } });

    const result = await lecturasService.remove(9);

    expect(mockApi.delete).toHaveBeenCalledWith('/lecturas/9');
    expect(result).toEqual({ id: 9 });
  });
});
