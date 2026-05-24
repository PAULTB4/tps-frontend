import { api } from './api';

export const crudService = (resource: string) => ({
  list: (params?: Record<string, unknown>) => api.get(`/${resource}`, { params }).then((r) => r.data),
  create: (payload: unknown) => api.post(`/${resource}`, payload).then((r) => r.data),
  update: (id: string | number, payload: unknown) => api.patch(`/${resource}/${id}`, payload).then((r) => r.data),
  remove: (id: string | number) => api.delete(`/${resource}/${id}`).then((r) => r.data),
});
