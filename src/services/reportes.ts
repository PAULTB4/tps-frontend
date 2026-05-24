import { api } from './api';

type ReportFilters = Record<string, string | number | undefined>;

function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const reportesService = {
  async lecturasCsv(filters?: ReportFilters) {
    const { data } = await api.get('/reportes/lecturas/csv', { params: filters, responseType: 'blob' });
    downloadBlob(data, 'lecturas-siscon-enosa.csv');
  },
  async consumoExcel(filters?: ReportFilters) {
    const { data } = await api.get('/reportes/consumo/excel', { params: filters, responseType: 'blob' });
    downloadBlob(data, 'consumo-siscon-enosa.xlsx');
  },
};
