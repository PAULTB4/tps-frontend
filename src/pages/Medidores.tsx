import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toast } from '../components/ui/Toast';
import { DataTable } from '../components/tables/DataTable';
import { medidoresService } from '../services/medidores';
import { crudService } from '../services/crud';
import { useAsync } from '../hooks/useAsync';
import { extractRows } from '../utils/pagination';

export function Medidores() {
  const [draft, setDraft] = useState({
    page: 1,
    limit: 20,
    suministroId: '',
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
    () => medidoresService.list({
      page: String(active.page),
      limit: String(active.limit),
      suministroId: active.suministroId,
      estado: active.estado,
      search: active.q,
    }),
    [active]
  );

  const rows = (listResponse?.data ?? []) as any[];
  const meta = listResponse?.meta;

  const { data: suministrosRes } = useAsync(() => crudService('suministros').list() as Promise<unknown>, []);
  const suministros = extractRows(suministrosRes ?? []);
  const suministroOptions = suministros.map((s: any) => ({ label: s.codigoSuministro || `SUM-${s.id}`, value: String(s.id) }));

  function applyFilters() {
    setActive({ ...draft, page: 1 });
  }

  function clearFilters() {
    const reset = { page: 1, limit: 20, suministroId: '', estado: '', q: '' };
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
    { header: 'Número Medidor', accessor: 'numeroMedidor' as keyof any, className: 'medidores-codeCell' },
    { header: 'Código Suministro', accessor: (row: any) => row.suministro?.codigoSuministro ?? row.suministroId ?? '-' },
    { header: 'Marca', accessor: 'marca' as keyof any },
    { header: 'Modelo', accessor: 'modelo' as keyof any, className: 'medidores-modelCell' },
    {
      header: 'Fecha Instalación',
      accessor: (row: any) => row.fechaInstalacion ? new Date(row.fechaInstalacion).toLocaleDateString('es-PE') : '-',
    },
    {
      header: 'Estado',
      accessor: (row: any) => {
        const estado = row.estado;

        if (estado === 'ACTIVO') {
          return <span className="medidores-statusBadge is-active"><span aria-hidden="true" />Activo</span>;
        }

        if (estado === 'EN_REVISION') {
          return <span className="medidores-statusBadge is-observed"><span aria-hidden="true" />En revisión</span>;
        }

        return <span className="medidores-statusBadge is-inactive"><span aria-hidden="true" />Retirado</span>;
      },
    },
  ], []);

  return (
    <div className="medidores-page">
      <div className="medidores-header">
        <div>
          <h2>Inventario de Medidores</h2>
          <p>Gestión y control del parque de medición instalado.</p>
        </div>
        <Link to="/medidores/nuevo"><Button icon="add" className="medidores-primaryAction">Nuevo Medidor</Button></Link>
      </div>

      <div className="medidores-filterPanel">
        <div className="medidores-filtersGrid">
          <div className="medidores-searchField">
            <Input
              label="Buscar medidor"
              placeholder="Número de medidor..."
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
              icon="search"
            />
          </div>
          <Select label="Suministro" value={draft.suministroId} options={[{ label: 'Todos', value: '' }, ...suministroOptions]} onChange={(e) => setDraft({ ...draft, suministroId: e.target.value })} />
          <Select label="Estado" value={draft.estado} options={[{ label: 'Todos', value: '' }, { label: 'Activo', value: 'ACTIVO' }, { label: 'En revisión', value: 'EN_REVISION' }, { label: 'Retirado', value: 'RETIRADO' }]} onChange={(e) => setDraft({ ...draft, estado: e.target.value })} />
          <div className="medidores-filterActions">
            <Button onClick={applyFilters} className="medidores-applyButton">Aplicar filtros</Button>
            <Button variant="secondary" onClick={clearFilters} className="medidores-clearButton">Limpiar filtros</Button>
          </div>
        </div>
      </div>

      {error && <Toast type="error" message={error} />}

      <div className="medidores-tableCard">
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

export function MedidorForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    numeroMedidor: '',
    suministroId: '',
    marca: '',
    modelo: '',
    fechaInstalacion: '',
    estado: 'ACTIVO',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { data: suministrosRes } = useAsync(() => crudService('suministros').list() as Promise<unknown>, []);
  const suministros = extractRows(suministrosRes ?? []);
  const suministroOptions = suministros.map((s: any) => ({ label: s.codigoSuministro || `SUM-${s.id}`, value: String(s.id) }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await crudService('medidores').create(form);
      setMessage('Registro guardado correctamente.');
      setTimeout(() => navigate('/medidores'), 500);
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
        <h2 className="serif text-4xl font-bold text-enosa-950">Nuevo medidor</h2>
      </div>
      <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-panel md:grid-cols-2">
        <Input label="Número de medidor" required value={form.numeroMedidor} onChange={(e) => setForm({ ...form, numeroMedidor: e.target.value })} />
        <Select label="Suministro ID" required options={suministroOptions} value={form.suministroId} onChange={(e) => setForm({ ...form, suministroId: e.target.value })} />
        <Input label="Marca" required value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
        <Input label="Modelo" required value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
        <Input label="Fecha instalación" type="date" required value={form.fechaInstalacion} onChange={(e) => setForm({ ...form, fechaInstalacion: e.target.value })} />
        <Select label="Estado" required options={[{ label: 'Activo', value: 'ACTIVO' }, { label: 'En revisión', value: 'EN_REVISION' }, { label: 'Retirado', value: 'RETIRADO' }]} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
      </div>
      {message && <Toast type={message.startsWith('No') ? 'error' : 'success'} message={message} />}
      <div className="flex gap-3">
        <Button disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
      </div>
    </form>
  );
}
