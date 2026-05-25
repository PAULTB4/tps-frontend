import { api } from './api';
import { cleanParams, extractMeta, extractRows } from '../utils/pagination';
import type { PaginatedResponse } from '../types';

type Query = Record<string, string | number | undefined>;

export const suministrosService = {
  list: (params?: Query) =>
    api.get<PaginatedResponse<unknown>>('/suministros', { params: cleanParams(params) }).then((r) => ({
      data: extractRows<unknown>(r.data),
      meta: extractMeta(r.data),
    })),
  create: (payload: unknown) => api.post('/suministros', payload).then((r) => r.data),
  get: (id: string | number) => api.get(`/suministros/${id}`).then((r) => r.data),
  update: (id: string | number, payload: unknown) => api.patch(`/suministros/${id}`, payload).then((r) => r.data),
  remove: (id: string | number) => api.delete(`/suministros/${id}`).then((r) => r.data),
};
