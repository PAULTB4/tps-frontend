import { api } from './api';
import { cleanParams, extractMeta, extractRows } from '../utils/pagination';
import type { PaginatedResponse } from '../types';

type Query = Record<string, string | number | undefined>;

export const medidoresService = {
  list: (params?: Query) =>
    api.get<PaginatedResponse<unknown>>('/medidores', { params: cleanParams(params) }).then((r) => ({
      data: extractRows<unknown>(r.data),
      meta: extractMeta(r.data),
    })),
  search: (q: string) => api.get('/medidores/search', { params: { q } }).then((r) => r.data),
  create: (payload: unknown) => api.post('/medidores', payload).then((r) => r.data),
  get: (id: string | number) => api.get(`/medidores/${id}`).then((r) => r.data),
  update: (id: string | number, payload: unknown) => api.patch(`/medidores/${id}`, payload).then((r) => r.data),
  remove: (id: string | number) => api.delete(`/medidores/${id}`).then((r) => r.data),
};
