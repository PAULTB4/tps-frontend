import type React from 'react';

export type Estado = 'ACTIVO' | 'INACTIVO' | 'OBSERVADO' | 'PENDIENTE' | string;
export type Option = { label: string; value: string };

export type Zona = {
  id: number | string;
  nombreZona?: string;
  codigoZona?: string;
};

export type Suministro = {
  id?: number | string;
  codigoSuministro: string;
  tipoCliente: string;
  direccionReferencial: string;
  zonaId: number | string;
  zona?: Zona;
  estado: Estado;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items?: T[];
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  meta?: PaginationMeta;
};

export type Lectura = {
  id?: number | string;
  medidorId: number | string;
  numeroMedidor?: string;
  periodoId: number | string;
  periodoLabel?: string;
  anio?: number;
  mes?: number;
  suministroId?: number | string;
  codigoSuministro?: string;
  zonaId?: number | string;
  zona?: string;
  distrito?: string;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoKwh?: number;
  fechaLectura?: string;
  observacion?: string;
  estadoLectura?: string;
  estado?: Estado;
};

export type LecturaResponse = {
  id: number;
  medidorId: number;
  numeroMedidor: string;
  suministroId: number;
  codigoSuministro: string;
  periodoId: number;
  periodoLabel: string;
  anio: number;
  mes: number;
  fechaLectura: string;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoKwh: number;
  estadoLectura: 'VALIDA' | 'OBSERVADA' | 'CORREGIDA' | 'ANULADA';
  observacion?: string;
};

export type LecturasParametros = {
  medidores?: Array<{ id: number | string; codigoMedidor?: string; codigo?: string; nombre?: string; suministroId?: number | string; suministro?: string }>;
  periodos?: Array<{ id: number | string; nombre?: string; anio?: number; mes?: number }>;
  suministros?: Array<{ id: number | string; codigoSuministro?: string; codigo?: string }>;
  estadosLectura?: string[];
  estadosMedidor?: string[];
  tiposIncidencia?: string[];
  paginacion?: { pageDefault: number; limitDefault: number; limitMax: number };
  reglas?: { consumoAltoDesdeKwh: number; consumoAltoCriticoDesdeKwh: number; consumoBajoHastaKwh: number };
};

export type LecturaPreviewPayload = {
  medidorId: number | string;
  periodoId: number | string;
  lecturaActual: number;
  fechaLectura?: string;
  observacion?: string;
};

export type LecturaPreview = {
  lecturaAnterior: number;
  lecturaActual: number;
  consumoKwh: number;
  valido?: boolean;
  observacion?: string;
  advertencias?: string[];
};

export type DashboardResumen = {
  consumoTotalAnual: number;
  promedioMensual: number;
  zonaMayorConsumo: string;
  totalSuministrosActivos: number;
  lecturasObservadas: number;
};

export type TableColumn<T> = { header: string; accessor: keyof T | ((row: T) => React.ReactNode); className?: string };
