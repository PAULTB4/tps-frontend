import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Toast } from '../components/ui/Toast';
import { DataTable } from '../components/tables/DataTable';
import { incidenciasService } from '../services/incidencias';
import { lecturasService } from '../services/lecturas';
import { useAsync } from '../hooks/useAsync';
import { extractRows } from '../utils/pagination';

type Incidencia = {
  id?: number | string;
  tipo: string;
  descripcion: string;
  nivel: string;
  estado: string;
  fecha: string;
};

const estadoOptions = [
  { label: 'Todos', value: '' },
  { label: 'PENDIENTE', value: 'PENDIENTE' },
  { label: 'RESUELTO', value: 'RESUELTO' },
  { label: 'ESCALADO', value: 'ESCALADO' },
];

export function Incidencias() {
  const [draft, setDraft] = useState({
    page: 1,
    limit: 20,
    tipo: '',
    nivel: '',
    estado: '',
  });

  const [active, setActive] = useState(draft);

  const { data: listResponse, loading, error } = useAsync(
    () => incidenciasService.list({
      page: String(active.page),
      limit: String(active.limit),
      tipo: active.tipo,
      nivel: active.nivel,
      estado: active.estado,
    }),
    [active]
  );

  const rows = (listResponse?.data ?? []) as Incidencia[];
  const meta = listResponse?.meta;

  const { data: params } = useAsync(() => lecturasService.parametros(), []);

  const tiposOptions = (params?.tiposIncidencia ?? []).map((t: string) => ({ label: t, value: t }));
  const nivelesOptions = [
    { label: 'Todos', value: '' },
    { label: 'BAJO', value: 'BAJO' },
    { label: 'MEDIO', value: 'MEDIO' },
    { label: 'ALTO', value: 'ALTO' },
    { label: 'CRITICO', value: 'CRITICO' },
  ];

  function renderNivelBadge(nivel: string) {
    const classMap: Record<string, string> = {
      BAJO: 'is-bajo',
      MEDIO: 'is-medio',
      ALTO: 'is-alto',
      CRITICO: 'is-critico',
    };
    const cls = classMap[nivel] || 'is-bajo';
    return (
      <span className={`incidencias-nivelBadge ${cls}`}>
        <span aria-hidden="true" />
        {nivel}
      </span>
    );
  }

  function renderEstadoBadge(estado: string) {
    const classMap: Record<string, string> = {
      PENDIENTE: 'is-pendiente',
      RESUELTO: 'is-resuelto',
      ESCALADO: 'is-escalado',
    };
    const cls = classMap[estado] || 'is-pendiente';
    return (
      <span className={`incidencias-estadoBadge ${cls}`}>
        <span aria-hidden="true" />
        {estado}
      </span>
    );
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function applyFilters() {
    setActive({ ...draft, page: 1 });
  }

  function clearFilters() {
    const reset = { page: 1, limit: 20, tipo: '', nivel: '', estado: '' };
    setDraft(reset);
    setActive(reset);
  }

  function handlePageChange(page: number) {
    setActive((prev) => ({ ...prev, page }));
  }

  function handleLimitChange(limit: number) {
    setActive((prev) => ({ ...prev, limit, page: 1 }));
  }

  return (
    <div className="incidencias-page">
      <div className="incidencias-header">
        <div>
          <h2>Incidencias</h2>
          <p>Control de calidad y seguimiento de anomalías.</p>
        </div>
      </div>

      <div className="incidencias-filterPanel">
        <div className="incidencias-filtersGrid">
          <Select
            label="Tipo"
            value={draft.tipo}
            options={[{ label: 'Todos', value: '' }, ...tiposOptions]}
            onChange={(e) => setDraft({ ...draft, tipo: e.target.value })}
          />
          <Select
            label="Nivel"
            value={draft.nivel}
            options={nivelesOptions}
            onChange={(e) => setDraft({ ...draft, nivel: e.target.value })}
          />
          <Select
            label="Estado"
            value={draft.estado}
            options={estadoOptions}
            onChange={(e) => setDraft({ ...draft, estado: e.target.value })}
          />
          <div className="incidencias-filterActions">
            <Button onClick={applyFilters} className="incidencias-applyButton">Aplicar filtros</Button>
            <Button variant="secondary" onClick={clearFilters} className="incidencias-clearButton">Limpiar filtros</Button>
          </div>
        </div>
      </div>

      {error && <Toast type="error" message={error} />}

      <div className="incidencias-tableCard">
        <DataTable
          loading={loading}
          data={rows}
          meta={meta}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          entityLabel="incidencias"
          empty="No se encontraron incidencias con los filtros aplicados."
          columns={[
            { header: 'Tipo', accessor: 'tipo', className: 'incidencias-codeCell' },
            { header: 'Descripción', accessor: 'descripcion' },
            { header: 'Nivel', accessor: (r: Incidencia) => renderNivelBadge(r.nivel) },
            { header: 'Estado', accessor: (r: Incidencia) => renderEstadoBadge(r.estado) },
            { header: 'Fecha', accessor: (r: Incidencia) => formatDate(r.fecha) },
          ]}
        />
      </div>
    </div>
  );
}
