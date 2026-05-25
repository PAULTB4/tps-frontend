import { vi, describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

const mockService = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock('../services/lecturas', () => ({
  lecturasService: mockService,
}));

import { lecturasService } from '../services/lecturas';

describe('useAsync + service integration', () => {
  it('should load paginated data through service', async () => {
    mockService.list.mockResolvedValueOnce({
      data: [{ id: 1, medidorId: 10 }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });

    const { result } = renderHook(() => useAsync(() => lecturasService.list({ page: '1' }), ['page1']));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({
      data: [{ id: 1, medidorId: 10 }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    expect(result.current.error).toBe('');
    expect(mockService.list).toHaveBeenCalledWith({ page: '1' });
  });

  it('should propagate service error to error state', async () => {
    mockService.list.mockRejectedValueOnce(new Error('Backend timeout'));

    const { result } = renderHook(() => useAsync(() => lecturasService.list({}), []));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Backend timeout');
  });

  it('should refetch when deps change', async () => {
    mockService.list
      .mockResolvedValueOnce({ data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } })
      .mockResolvedValueOnce({ data: [{ id: 2 }], meta: { total: 1, page: 2, limit: 20, totalPages: 1 } });

    const { result, rerender } = renderHook(
      ({ page }) => useAsync(() => lecturasService.list({ page: String(page) }), [page]),
      { initialProps: { page: 1 } }
    );

    await waitFor(() => expect(result.current.data?.data[0].id).toBe(1));

    rerender({ page: 2 });

    await waitFor(() => expect(result.current.data?.data[0].id).toBe(2));
    expect(mockService.list).toHaveBeenLastCalledWith({ page: '2' });
  });
});
