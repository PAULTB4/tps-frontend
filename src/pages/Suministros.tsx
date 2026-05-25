import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toast } from '../components/ui/Toast';
import { DataTable } from '../components/tables/DataTable';
import { suministrosService } from '../services/suministros';
import { crudService } from '../services/crud';
import { useAsync } from '../hooks/useAsync';
import { extractRows } from '../utils/pagination';

const tipoClienteOptions = [
  { label: 'Residencial', value: 'RESIDENCIAL' },
  { label: 'Comercial', value: 'COMERCIAL' },
  { label: 'Industrial', value: 'INDUSTRIAL' },
  { label: 'Público / Estatal', value: 'PUBLICO' },
];

export function Suministros() {
  const [draft, setDraft] = useState({
    page: 1,
    limit: 20,
    zonaId: '',
    tipoCliente: '',
    estado: '',
    q: '',
  });

  const [active, setActive] = useState(draft);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setActive((prev) => (prev.q === draft.q ? prev : { ...prev, q: draft.q, page: 1 }));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [draft.q]);

  const { data: listResponse, loading, error } = useAsync(
    () => suministrosService.list({
      page: String(active.page),
      limit: String(active.limit),
      zonaId: active.zonaId,
      tipoCliente: active.tipoCliente,
      estado: active.estado,
      search: active.q,
    }),
    [active]
  );

  const rows = (listResponse?.data ?? []) as any[];
  const meta = listResponse?.meta;

  const { data: zonasRes } = useAsync(() => crudService('zonas').list() as Promise<unknown>, []);
  const zonas = extractRows(zonasRes ?? []);
  const zonasOptions = zonas.map((z: any) => ({ label: z.nombreZona || z.codigoZona || `Zona ${z.id}`, value: String(z.id) }));

  function applyFilters() {
    setActive({ ...draft, page: 1 });
  }

  function clearFilters() {
    const reset = { page: 1, limit: 20, zonaId: '', tipoCliente: '', estado: '', q: '' };
    setDraft(reset);
    setActive(reset);
  }

  function handlePageChange(page: number) {
    setActive((prev) => ({ ...prev, page }));
  }

  function handleLimitChange(limit: number) {
    setActive((prev) => ({ ...prev, limit, page: 1 }));
  }

  const columns = useMemo(() => [
    { header: 'Código Suministro', accessor: 'codigoSuministro' as keyof any, className: 'suministros-codeCell' },
    { header: 'Tipo Cliente', accessor: 'tipoCliente' as keyof any },
    { header: 'Dirección Referencial', accessor: 'direccionReferencial' as keyof any, className: 'suministros-addressCell' },
    { header: 'Zona', accessor: (row: any) => row.zona?.nombreZona ?? row.zona?.codigoZona ?? row.zonaId ?? '-' },
    {
      header: 'Estado',
      accessor: (row: any) => {
        const estado = row.estado;

        if (estado === 'ACTIVO') {
          return <span className="suministros-statusBadge is-active"><span aria-hidden="true" />Activo</span>;
        }

        if (estado === 'OBSERVADO' || estado === 'PENDIENTE') {
          return <span className="suministros-statusBadge is-observed"><span aria-hidden="true" />Observado</span>;
        }

        return <span className="suministros-statusBadge is-inactive"><span aria-hidden="true" />Inactivo</span>;
      },
    },
  ], []);

  return (
    <div className="suministros-page">
      <div className="suministros-header">
        <div>
          <h2>Catálogo de Suministros Eléctricos</h2>
          <p>Gestión y registro de puntos de suministro en la red operativa.</p>
        </div>
        <Link to="/suministros/nuevo"><Button icon="add" className="suministros-primaryAction">Nuevo Suministro</Button></Link>
      </div>

      <div className="suministros-filterPanel">
        <div className="suministros-filtersGrid">
          <div className="suministros-searchField">
            <Input
              label="Buscar suministro"
              placeholder="Código de suministro..."
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
              icon="search"
            />
          </div>
          <Select label="Zona" value={draft.zonaId} options={[{ label: 'Todas', value: '' }, ...zonasOptions]} onChange={(e) => setDraft({ ...draft, zonaId: e.target.value })} />
          <Select label="Tipo cliente" value={draft.tipoCliente} options={[{ label: 'Todos', value: '' }, ...tipoClienteOptions]} onChange={(e) => setDraft({ ...draft, tipoCliente: e.target.value })} />
          <Select label="Estado" value={draft.estado} options={[{ label: 'Todos', value: '' }, { label: 'Activo', value: 'ACTIVO' }, { label: 'Inactivo', value: 'INACTIVO' }]} onChange={(e) => setDraft({ ...draft, estado: e.target.value })} />
          <div className="suministros-filterActions">
            <Button onClick={applyFilters} className="suministros-applyButton">Aplicar filtros</Button>
            <Button variant="secondary" onClick={clearFilters} className="suministros-clearButton">Limpiar filtros</Button>
          </div>
        </div>
      </div>

      {error && <Toast type="error" message={error} />}

      <div className="suministros-tableCard">
        <DataTable
          loading={loading}
          data={rows}
          meta={meta}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          columns={columns}
        />
      </div>
    </div>
  );
}

export function SuministroForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    codigoSuministro: '',
    tipoCliente: 'RESIDENCIAL',
    direccionReferencial: '',
    zonaId: '',
    estado: 'ACTIVO',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { data: zonasRes } = useAsync(() => crudService('zonas').list() as Promise<unknown>, []);
  const zonas = extractRows(zonasRes ?? []);
  const zonasOptions = zonas.map((z: any) => ({ label: z.nombreZona || z.codigoZona || `Zona ${z.id}`, value: String(z.id) }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await crudService('suministros').create(form);
      setMessage('Registro guardado correctamente.');
      setTimeout(() => navigate('/suministros'), 500);
    } catch {
      setMessage('No se pudo guardar. Revisá los datos o la API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-sm font-bold text-copper">Nuevo registro</p>
        <h2 className="serif text-4xl font-bold text-enosa-950">Nuevo suministro</h2>
      </div>
      <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-panel md:grid-cols-2">
        <Input label="Código suministro" required value={form.codigoSuministro} onChange={(e) => setForm({ ...form, codigoSuministro: e.target.value })} />
        <Select label="Tipo cliente" required options={tipoClienteOptions} value={form.tipoCliente} onChange={(e) => setForm({ ...form, tipoCliente: e.target.value })} />
        <Input label="Dirección referencial" required value={form.direccionReferencial} onChange={(e) => setForm({ ...form, direccionReferencial: e.target.value })} />
        <Select label="Zona" required options={zonasOptions} value={form.zonaId} onChange={(e) => setForm({ ...form, zonaId: e.target.value })} />
        <Select label="Estado" required options={[{ label: 'Activo', value: 'ACTIVO' }, { label: 'Inactivo', value: 'INACTIVO' }]} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
      </div>
      {message && <Toast type={message.startsWith('No') ? 'error' : 'success'} message={message} />}
      <div className="flex gap-3">
        <Button disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
      </div>
    </form>
  );
}
