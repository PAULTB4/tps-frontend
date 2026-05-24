export const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const formatKwh = (value: number | string | undefined) => `${Number(value ?? 0).toLocaleString('es-PE')} kWh`;
export const thisYear = new Date().getFullYear();
export const estadoOptions = [
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'Inactivo', value: 'INACTIVO' },
  { label: 'Observado', value: 'OBSERVADO' },
];
