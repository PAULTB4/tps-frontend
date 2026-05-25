import { api } from './api';
import { cleanParams, extractMeta, extractRows } from '../utils/pagination';
import type { PaginatedResponse } from '../types';

type Query = Record<string, string | number | undefined>;

export const incidenciasService = {
  list: (params?: Query) =>
    api.get<PaginatedResponse<unknown>>('/incidencias', { params: cleanParams(params) }).then((r) => ({
      data: extractRows<unknown>(r.data),
      meta: extractMeta(r.data),
    })),
  create: (payload: unknown) => api.post('/incidencias', payload).then((r) => r.data),
  get: (id: string | number) => api.get(`/incidencias/${id}`).then((r) => r.data),
  update: (id: string | number, payload: unknown) => api.patch(`/incidencias/${id}`, payload).then((r) => r.data),
  remove: (id: string | number) => api.delete(`/incidencias/${id}`).then((r) => r.data),
};
