import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('should return loading=true initially and data=null', () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(42), []));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should resolve with data', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve({ ok: true }), []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ ok: true });
    expect(result.current.error).toBe('');
  });

  it('should catch and expose error message', async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.reject(new Error('Network failed')), [])
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network failed');
    expect(result.current.data).toBeNull();
  });

  it('should use fallback message for non-Error rejections', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject('boom'), []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No se pudo cargar la información.');
  });

  it('should cancel stale results on deps change', async () => {
    const factory = vi.fn();
    factory.mockResolvedValueOnce('A').mockResolvedValueOnce('B');

    const { result, rerender } = renderHook(
      ({ id }) => useAsync(() => factory(id), [id]),
      { initialProps: { id: 1 } }
    );

    await waitFor(() => expect(result.current.data).toBe('A'));
    rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toBe('B'));
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
