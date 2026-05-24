import { api } from './api';

export const dashboardService = {
  resumen: (anio?: number) => api.get('/dashboard/resumen', { params: { anio } }).then((r) => r.data),
  consumoMensual: (anio?: number) => api.get('/dashboard/consumo-mensual', { params: { anio } }).then((r) => r.data),
  comparativoAnual: () => api.get('/dashboard/comparativo-anual').then((r) => r.data),
  consumoPorZona: (anio?: number) => api.get('/dashboard/consumo-por-zona', { params: { anio } }).then((r) => r.data),
  consumoPorTipoCliente: (anio?: number) => api.get('/dashboard/consumo-por-tipo-cliente', { params: { anio } }).then((r) => r.data),
  incidenciasPorTipo: (anio?: number) => api.get('/dashboard/incidencias-por-tipo', { params: { anio } }).then((r) => r.data),
  topSuministros: (anio?: number) => api.get('/dashboard/top-suministros', { params: { anio } }).then((r) => r.data),
};
