import { api } from './api';
import { cleanParams, extractMeta, extractRows } from '../utils/pagination';
import type { Lectura, LecturaPreview, LecturaPreviewPayload, LecturasParametros, PaginatedResponse } from '../types';

type LecturasQuery = Record<string, string | number | undefined>;

export const lecturasService = {
  parametros: () => api.get<LecturasParametros>('/lecturas/parametros').then((r) => r.data),
  ultima: (medidorId: string | number) => api.get<Lectura>('/lecturas/ultima', { params: { medidorId } }).then((r) => r.data),
  previsualizar: (payload: LecturaPreviewPayload) => api.post<LecturaPreview>('/lecturas/previsualizar', payload).then((r) => r.data),
  list: (params?: LecturasQuery) =>
    api.get<PaginatedResponse<Lectura>>('/lecturas', { params: cleanParams(params) }).then((r) => ({
      data: extractRows<Lectura>(r.data),
      meta: extractMeta(r.data),
    })),
  create: (payload: unknown) => api.post<Lectura>('/lecturas', payload).then((r) => r.data),
  get: (id: string | number) => api.get<Lectura>(`/lecturas/${id}`).then((r) => r.data),
  update: (id: string | number, payload: unknown) => api.patch<Lectura>(`/lecturas/${id}`, payload).then((r) => r.data),
  remove: (id: string | number) => api.delete(`/lecturas/${id}`).then((r) => r.data),
};
