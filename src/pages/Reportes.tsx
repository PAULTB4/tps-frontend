import { FormEvent, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { reportesService } from '../services/reportes';
import { thisYear } from '../utils/format';

const mesesOptions = [
  { label: 'Todos', value: '' },
  { label: 'Enero', value: '1' }, { label: 'Febrero', value: '2' }, { label: 'Marzo', value: '3' },
  { label: 'Abril', value: '4' }, { label: 'Mayo', value: '5' }, { label: 'Junio', value: '6' },
  { label: 'Julio', value: '7' }, { label: 'Agosto', value: '8' }, { label: 'Septiembre', value: '9' },
  { label: 'Octubre', value: '10' }, { label: 'Noviembre', value: '11' }, { label: 'Diciembre', value: '12' },
];

export function Reportes() {
  const [filters, setFilters] = useState({
    anio: String(thisYear),
    mes: '',
    zona: '',
  });
  const [exporting, setExporting] = useState('');

  function handleExport(type: 'csv' | 'excel') {
    setExporting(type);
    reportesService[type === 'csv' ? 'lecturasCsv' : 'consumoExcel'](filters)
      .catch(() => {})
      .finally(() => setExporting(''));
  }

  function clearFilters() {
    setFilters({ anio: String(thisYear), mes: '', zona: '' });
  }

  return (
    <div className="reportes-page">
      <div className="reportes-header">
        <div>
          <h2>Reportes</h2>
          <p>Exportación de datos de lecturas y consumos.</p>
        </div>
      </div>

      <div className="reportes-filterPanel">
        <div className="reportes-filtersGrid">
          <Input
            label="Año"
            type="number"
            value={filters.anio}
            onChange={(e) => setFilters({ ...filters, anio: e.target.value })}
          />
          <Select
            label="Mes"
            value={filters.mes}
            options={mesesOptions}
            onChange={(e) => setFilters({ ...filters, mes: e.target.value })}
          />
          <Input
            label="Zona"
            value={filters.zona}
            onChange={(e) => setFilters({ ...filters, zona: e.target.value })}
            placeholder="Filtrar por zona..."
          />
          <div className="reportes-filterActions">
            <Button onClick={clearFilters} className="reportes-clearButton">Limpiar filtros</Button>
          </div>
        </div>
      </div>

      <div className="reportes-exportCard">
        <h3 className="reportes-exportTitle">Exportar datos</h3>
        <div className="reportes-exportActions">
          <Button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="reportes-exportBtn is-csv"
          >
            {exporting === 'csv' ? 'Generando...' : 'Exportar CSV'}
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            variant="secondary"
            className="reportes-exportBtn is-excel"
          >
            {exporting === 'excel' ? 'Generando...' : 'Exportar Excel'}
          </Button>
        </div>
      </div>
    </div>
  );
}
