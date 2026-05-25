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

import { crudService } from './crud';

describe('crudService integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('list should call api.get with resource path and params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [{ id: 1 }] });

    const service = crudService('zonas');
    const result = await service.list({ q: 'norte' });

    expect(mockApi.get).toHaveBeenCalledWith('/zonas', { params: { q: 'norte' } });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('list should call api.get without params when undefined', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    const service = crudService('medidores');
    await service.list();

    expect(mockApi.get).toHaveBeenCalledWith('/medidores', { params: undefined });
  });

  it('create should call api.post with payload', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 2 } });

    const service = crudService('suministros');
    const result = await service.create({ codigo: 'S001' });

    expect(mockApi.post).toHaveBeenCalledWith('/suministros', { codigo: 'S001' });
    expect(result).toEqual({ id: 2 });
  });

  it('update should call api.patch with id and payload', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { id: 3 } });

    const service = crudService('lecturas');
    const result = await service.update(42, { observacion: 'OK' });

    expect(mockApi.patch).toHaveBeenCalledWith('/lecturas/42', { observacion: 'OK' });
    expect(result).toEqual({ id: 3 });
  });

  it('remove should call api.delete with id', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { id: 4 } });

    const service = crudService('incidencias');
    const result = await service.remove(99);

    expect(mockApi.delete).toHaveBeenCalledWith('/incidencias/99');
    expect(result).toEqual({ id: 4 });
  });
});
