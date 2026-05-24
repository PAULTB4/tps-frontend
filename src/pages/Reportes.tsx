import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { reportesService } from '../services/reportes';
import { thisYear } from '../utils/format';

export function Reportes() {
  const [filters, setFilters] = useState({ anio: String(thisYear), mes: '', zona: '' });
  const exportFile = (type: 'csv' | 'excel') => type === 'csv' ? reportesService.lecturasCsv(filters) : reportesService.consumoExcel(filters);
  return <div className="space-y-5"><div><p className="text-sm font-bold text-copper">Análisis operativo</p><h2 className="serif text-4xl font-bold text-enosa-950">Reportes</h2></div><div className="grid gap-4 rounded-3xl bg-white p-6 shadow-panel md:grid-cols-3"><Input label="Año" value={filters.anio} onChange={(e) => setFilters({ ...filters, anio: e.target.value })} /><Input label="Mes" value={filters.mes} onChange={(e) => setFilters({ ...filters, mes: e.target.value })} /><Input label="Zona" value={filters.zona} onChange={(e) => setFilters({ ...filters, zona: e.target.value })} /></div><div className="flex gap-3"><Button onClick={() => exportFile('csv')}>Exportar CSV</Button><Button variant="secondary" onClick={() => exportFile('excel')}>Exportar Excel</Button></div></div>;
}
