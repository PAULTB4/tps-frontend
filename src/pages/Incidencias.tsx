import { useState } from 'react';
import { Toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/tables/DataTable';
import { incidenciasService } from '../services/incidencias';
import { lecturasService } from '../services/lecturas';
import { useAsync } from '../hooks/useAsync';

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

  const rows = (listResponse?.data ?? []) as any[];
  const meta = listResponse?.meta;

  const { data: params } = useAsync(() => lecturasService.parametros(), []);

  const tiposOptions = (params?.tiposIncidencia ?? []).map((t: string) => ({ label: t, value: t }));
  const nivelesOptions = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'].map((n) => ({ label: n, value: n }));

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
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold text-copper">Control de calidad</p>
        <h2 className="serif text-4xl font-bold text-enosa-950">Incidencias</h2>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-panel space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <select
            className="h-10 rounded-md border border-stitch-outline-variant bg-white px-3 text-sm"
            value={draft.tipo}
            onChange={(e) => setDraft({ ...draft, tipo: e.target.value })}
          >
            <option value="">Todos los tipos</option>
            {tiposOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="h-10 rounded-md border border-stitch-outline-variant bg-white px-3 text-sm"
            value={draft.nivel}
            onChange={(e) => setDraft({ ...draft, nivel: e.target.value })}
          >
            <option value="">Todos los niveles</option>
            {nivelesOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="h-10 rounded-md border border-stitch-outline-variant bg-white px-3 text-sm"
            value={draft.estado}
            onChange={(e) => setDraft({ ...draft, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="RESUELTO">RESUELTO</option>
            <option value="ESCADA">ESCALADO</option>
          </select>
        </div>
        <div className="flex gap-3">
          <Button onClick={applyFilters}>Aplicar filtros</Button>
          <Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      </div>

      {error && <Toast type="error" message={error} />}

      <DataTable
        loading={loading}
        data={rows}
        meta={meta}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        columns={[
          { header: 'Tipo', accessor: 'tipo' },
          { header: 'Descripción', accessor: 'descripcion' },
          { header: 'Nivel', accessor: 'nivel' },
          { header: 'Estado', accessor: 'estado' },
          { header: 'Fecha', accessor: 'fecha' },
        ]}
      />
    </div>
  );
}
