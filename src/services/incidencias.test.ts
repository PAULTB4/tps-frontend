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

import { incidenciasService } from './incidencias';

describe('incidenciasService integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('list should GET /incidencias with cleaned params', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } },
    });

    const result = await incidenciasService.list({ tipo: 'FUGA', nivel: '', page: '1' });

    expect(mockApi.get).toHaveBeenCalledWith('/incidencias', { params: { tipo: 'FUGA', page: '1' } });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toBeDefined();
  });

  it('create should POST /incidencias', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 2 } });

    const result = await incidenciasService.create({ tipo: 'ANOMALIA', descripcion: 'Test' });

    expect(mockApi.post).toHaveBeenCalledWith('/incidencias', { tipo: 'ANOMALIA', descripcion: 'Test' });
    expect(result).toEqual({ id: 2 });
  });

  it('get should call GET /incidencias/:id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 3 } });

    const result = await incidenciasService.get(3);

    expect(mockApi.get).toHaveBeenCalledWith('/incidencias/3');
    expect(result).toEqual({ id: 3 });
  });

  it('update should PATCH /incidencias/:id', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { id: 4 } });

    const result = await incidenciasService.update(4, { estado: 'RESUELTO' });

    expect(mockApi.patch).toHaveBeenCalledWith('/incidencias/4', { estado: 'RESUELTO' });
    expect(result).toEqual({ id: 4 });
  });

  it('remove should DELETE /incidencias/:id', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { id: 5 } });

    const result = await incidenciasService.remove(5);

    expect(mockApi.delete).toHaveBeenCalledWith('/incidencias/5');
    expect(result).toEqual({ id: 5 });
  });
});
