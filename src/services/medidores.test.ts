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

import { medidoresService } from './medidores';

describe('medidoresService integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('list should GET /medidores with cleaned params', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } },
    });

    const result = await medidoresService.list({ suministroId: '10', estado: '', page: '1' });

    expect(mockApi.get).toHaveBeenCalledWith('/medidores', { params: { suministroId: '10', page: '1' } });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toBeDefined();
  });

  it('search should GET /medidores/search with q param', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [{ id: 2, numeroMedidor: 'M001' }] });

    const result = await medidoresService.search('M001');

    expect(mockApi.get).toHaveBeenCalledWith('/medidores/search', { params: { q: 'M001' } });
    expect(result).toEqual([{ id: 2, numeroMedidor: 'M001' }]);
  });

  it('create should POST /medidores', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 3 } });

    const result = await medidoresService.create({ numeroMedidor: 'M002' });

    expect(mockApi.post).toHaveBeenCalledWith('/medidores', { numeroMedidor: 'M002' });
    expect(result).toEqual({ id: 3 });
  });

  it('get should call GET /medidores/:id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 4 } });

    const result = await medidoresService.get(4);

    expect(mockApi.get).toHaveBeenCalledWith('/medidores/4');
    expect(result).toEqual({ id: 4 });
  });

  it('update should PATCH /medidores/:id', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { id: 5 } });

    const result = await medidoresService.update(5, { estado: 'INACTIVO' });

    expect(mockApi.patch).toHaveBeenCalledWith('/medidores/5', { estado: 'INACTIVO' });
    expect(result).toEqual({ id: 5 });
  });

  it('remove should DELETE /medidores/:id', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { id: 6 } });

    const result = await medidoresService.remove(6);

    expect(mockApi.delete).toHaveBeenCalledWith('/medidores/6');
    expect(result).toEqual({ id: 6 });
  });
});
