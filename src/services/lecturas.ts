import { api } from './api';
import type { Lectura, LecturaPreview, LecturaPreviewPayload, LecturasParametros, PaginatedResponse } from '../types';

type LecturasQuery = Record<string, string | number | undefined>;

function cleanParams(params?: LecturasQuery): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const cleaned: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}

export const lecturasService = {
  parametros: () => api.get<LecturasParametros>('/lecturas/parametros').then((r) => r.data),
  ultima: (medidorId: string | number) => api.get<Lectura>('/lecturas/ultima', { params: { medidorId } }).then((r) => r.data),
  previsualizar: (payload: LecturaPreviewPayload) => api.post<LecturaPreview>('/lecturas/previsualizar', payload).then((r) => r.data),
  list: (params?: LecturasQuery) => api.get<Lectura[] | PaginatedResponse<Lectura>>('/lecturas', { params: cleanParams(params) }).then((r) => r.data),
  create: (payload: unknown) => api.post<Lectura>('/lecturas', payload).then((r) => r.data),
  get: (id: string | number) => api.get<Lectura>(`/lecturas/${id}`).then((r) => r.data),
  update: (id: string | number, payload: unknown) => api.patch<Lectura>(`/lecturas/${id}`, payload).then((r) => r.data),
  remove: (id: string | number) => api.delete(`/lecturas/${id}`).then((r) => r.data),
};
