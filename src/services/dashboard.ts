import { api } from './api';
import { cleanParams } from '../utils/pagination';
import type { DashboardFilters } from '../types';

export const dashboardService = {
  resumen: (filters?: DashboardFilters) => api.get('/dashboard/resumen', { params: cleanParams(filters) }).then((r) => r.data),
  consumoMensual: (filters?: DashboardFilters) => api.get('/dashboard/consumo-mensual', { params: cleanParams(filters) }).then((r) => r.data),
  comparativoAnual: (filters?: DashboardFilters) => api.get('/dashboard/comparativo-anual', { params: cleanParams(filters) }).then((r) => r.data),
  consumoPorZona: (filters?: DashboardFilters) => api.get('/dashboard/consumo-por-zona', { params: cleanParams(filters) }).then((r) => r.data),
  consumoPorTipoCliente: (filters?: DashboardFilters) => api.get('/dashboard/consumo-por-tipo-cliente', { params: cleanParams(filters) }).then((r) => r.data),
  incidenciasPorTipo: (filters?: DashboardFilters) => api.get('/dashboard/incidencias-por-tipo', { params: cleanParams(filters) }).then((r) => r.data),
  topSuministros: (filters?: DashboardFilters) => api.get('/dashboard/top-suministros', { params: cleanParams(filters) }).then((r) => r.data),
};
