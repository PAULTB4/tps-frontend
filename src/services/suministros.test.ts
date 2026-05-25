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

import { suministrosService } from './suministros';

describe('suministrosService integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('list should GET /suministros with cleaned params', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } },
    });

    const result = await suministrosService.list({ zonaId: '5', q: '', page: '1' });

    expect(mockApi.get).toHaveBeenCalledWith('/suministros', { params: { zonaId: '5', page: '1' } });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toBeDefined();
  });

  it('create should POST /suministros', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 2 } });

    const result = await suministrosService.create({ codigoSuministro: 'S001' });

    expect(mockApi.post).toHaveBeenCalledWith('/suministros', { codigoSuministro: 'S001' });
    expect(result).toEqual({ id: 2 });
  });

  it('get should call GET /suministros/:id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 3 } });

    const result = await suministrosService.get(3);

    expect(mockApi.get).toHaveBeenCalledWith('/suministros/3');
    expect(result).toEqual({ id: 3 });
  });

  it('update should PATCH /suministros/:id', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { id: 4 } });

    const result = await suministrosService.update(4, { estado: 'INACTIVO' });

    expect(mockApi.patch).toHaveBeenCalledWith('/suministros/4', { estado: 'INACTIVO' });
    expect(result).toEqual({ id: 4 });
  });

  it('remove should DELETE /suministros/:id', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { id: 5 } });

    const result = await suministrosService.remove(5);

    expect(mockApi.delete).toHaveBeenCalledWith('/suministros/5');
    expect(result).toEqual({ id: 5 });
  });
});
