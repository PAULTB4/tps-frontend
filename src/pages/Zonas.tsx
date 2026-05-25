import { useEffect, useState, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toast } from '../components/ui/Toast';
import { DataTable } from '../components/tables/DataTable';
import { crudService } from '../services/crud';
import { useAsync } from '../hooks/useAsync';
import { extractRows, extractMeta } from '../utils/pagination';
import { estadoOptions } from '../utils/format';
import { publishEventAlert } from '../utils/eventAlert';

type ZonaOperativa = {
  departamento: string;
  provincia: string;
  distrito: string;
  nombreZona: string;
  codigoZona: string;
  estado: string;
};

const zonaEstadoOptions = estadoOptions.filter(option => ['ACTIVO', 'INACTIVO'].includes(option.value));

export function Zonas() {
  const [draft, setDraft] = useState({
    page: 1,
    limit: 10,
    departamento: '',
    provincia: '',
    distrito: '',
    estado: '',
    q: '',
  });

  const [active, setActive] = useState(draft);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setActive(prev => (prev.q === draft.q ? prev : { ...prev, q: draft.q, page: 1 }));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [draft.q]);

  // Fetch paginado y filtrado activo de zonas
  const { data: listResponse, loading, error } = useAsync(
    () => crudService('zonas').list({
      page: String(active.page),
      limit: String(active.limit),
      departamento: active.departamento,
      provincia: active.provincia,
      distrito: active.distrito,
      estado: active.estado,
      q: active.q,
    }),
    [active]
  );

  const rows = extractRows<any>(listResponse ?? []);
  const meta = extractMeta(listResponse);

  // Fetch completo para poblar los filtros encadenados dinámicos
  const { data: allZonasRes } = useAsync(() => crudService('zonas').list({ limit: '100' }) as Promise<any>, []);
  const allZonas = extractRows<ZonaOperativa>(allZonasRes ?? []);

  // Extraer listas únicas de ubicación para los filtros
  const departamentosOptions = useMemo(() => {
    const list = [...new Set(allZonas.map((z: any) => z.departamento).filter(Boolean))].sort();
    return list.map(d => ({ label: d, value: d }));
  }, [allZonas]);

  const provinciasOptions = useMemo(() => {
    if (!draft.departamento) return [];
    const list = [...new Set(allZonas
      .filter((z: any) => z.departamento === draft.departamento)
      .map((z: any) => z.provincia)
      .filter(Boolean))].sort();
    return list.map(p => ({ label: p, value: p }));
  }, [allZonas, draft.departamento]);

  const distritosOptions = useMemo(() => {
    if (!draft.provincia) return [];
    const list = [...new Set(allZonas
      .filter((z: any) => z.departamento === draft.departamento && z.provincia === draft.provincia)
      .map((z: any) => z.distrito)
      .filter(Boolean))].sort();
    return list.map(d => ({ label: d, value: d }));
  }, [allZonas, draft.departamento, draft.provincia]);

  const handleDepartamentoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDraft(prev => ({ ...prev, departamento: e.target.value, provincia: '', distrito: '' }));
  };

  const handleProvinciaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDraft(prev => ({ ...prev, provincia: e.target.value, distrito: '' }));
  };

  const applyFilters = () => {
    setActive({ ...draft, page: 1 });
  };

  const clearFilters = () => {
    const reset = { page: 1, limit: 10, departamento: '', provincia: '', distrito: '', estado: '', q: '' };
    setDraft(reset);
    setActive(reset);
  };

  const handlePageChange = (page: number) => {
    setActive(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setActive(prev => ({ ...prev, limit, page: 1 }));
  };

  const columns = useMemo(() => [
    { header: 'Código Zona', accessor: 'codigoZona' as keyof any, className: 'zonas-codeCell' },
    { header: 'Departamento', accessor: 'departamento' as keyof any },
    { header: 'Provincia', accessor: 'provincia' as keyof any },
    { header: 'Distrito', accessor: 'distrito' as keyof any },
    { header: 'Nombre de Zona', accessor: 'nombreZona' as keyof any, className: 'zonas-nameCell' },
    {
      header: 'Estado',
      accessor: (row: any) => {
        const isActivo = row.estado === 'ACTIVO';
        const isObservado = row.estado === 'OBSERVADO';

        if (isActivo) {
          return (
            <span className="zonas-statusBadge is-active">
              <span aria-hidden="true" />
              Activo
            </span>
          );
        }

        if (isObservado) {
          return (
            <span className="zonas-statusBadge is-observed">
              <span aria-hidden="true" />
              Observado
            </span>
          );
        }

        return (
          <span className="zonas-statusBadge is-inactive">
            <span aria-hidden="true" />
            Inactivo
          </span>
        );
      }
    }
  ], []);

  return (
    <div className="zonas-page">
      <div className="zonas-header">
        <div>
          <h2>Gestión de Zonas Operativas</h2>
          <p>Administre la estructura territorial para la distribución eléctrica.</p>
        </div>
        <Link to="/zonas/nueva">
          <Button icon="add" className="zonas-primaryAction">Nueva Zona</Button>
        </Link>
      </div>

      <div className="zonas-filterPanel">
        <div className="zonas-filtersGrid">
          <div className="zonas-searchField">
            <Input
              label="Buscar Zona"
              placeholder="Código, nombre o ubicación..."
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
              icon="search"
            />
          </div>
          <Select
            label="Estado"
            value={draft.estado}
            options={[{ label: 'Todos', value: '' }, ...zonaEstadoOptions]}
            onChange={(e) => setDraft({ ...draft, estado: e.target.value })}
          />
          <Select
            label="Departamento"
            value={draft.departamento}
            options={[{ label: 'Todos', value: '' }, ...departamentosOptions]}
            onChange={handleDepartamentoChange}
          />
          <Select
            label="Provincia"
            value={draft.provincia}
            options={[{ label: 'Todas', value: '' }, ...provinciasOptions]}
            onChange={handleProvinciaChange}
            disabled={!draft.departamento}
          />
          <Select
            label="Distrito"
            value={draft.distrito}
            options={[{ label: 'Todos', value: '' }, ...distritosOptions]}
            onChange={(e) => setDraft({ ...draft, distrito: e.target.value })}
            disabled={!draft.provincia}
          />
          <div className="zonas-filterActions">
            <Button onClick={applyFilters} className="zonas-applyButton">Aplicar filtros</Button>
            <Button variant="secondary" onClick={clearFilters} className="zonas-clearButton">Limpiar</Button>
          </div>
        </div>
      </div>

      {error && <Toast type="error" message={error} />}

      <div className="zonas-tableCard">
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

export function ZonaForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    departamento: '',
    provincia: '',
    distrito: '',
    nombreZona: '',
    codigoZona: '',
    estado: 'ACTIVO',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { data: allZonasRes } = useAsync(() => crudService('zonas').list({ limit: '100' }) as Promise<any>, []);
  const allZonas = extractRows<ZonaOperativa>(allZonasRes ?? []);

  const departamentosOptions = useMemo(() => {
    const list = [...new Set(allZonas.map(z => z.departamento).filter(Boolean))].sort();
    return list.map(d => ({ label: d, value: d }));
  }, [allZonas]);

  const provinciasOptions = useMemo(() => {
    if (!form.departamento) return [];
    const list = [...new Set(allZonas
      .filter(z => z.departamento === form.departamento)
      .map(z => z.provincia)
      .filter(Boolean))].sort();
    return list.map(p => ({ label: p, value: p }));
  }, [allZonas, form.departamento]);

  const distritosOptions = useMemo(() => {
    if (!form.provincia) return [];
    const list = [...new Set(allZonas
      .filter(z => z.departamento === form.departamento && z.provincia === form.provincia)
      .map(z => z.distrito)
      .filter(Boolean))].sort();
    return list.map(d => ({ label: d, value: d }));
  }, [allZonas, form.departamento, form.provincia]);

  const suggestCodigoZona = (departamento: string, provincia: string) => {
    const zonasProvincia = allZonas.filter(z => z.departamento === departamento && z.provincia === provincia);
    const sampleCode = zonasProvincia[0]?.codigoZona;
    const [, depCode, provCode] = sampleCode?.split('-') ?? [];
    if (!depCode || !provCode) return '';

    const nextNumber = zonasProvincia.reduce((max, zona) => {
      const number = Number(zona.codigoZona.split('-')[3]);
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0) + 1;

    return `ZON-${depCode}-${provCode}-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleDepartamentoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, departamento: e.target.value, provincia: '', distrito: '', nombreZona: '', codigoZona: '' }));
  };

  const handleProvinciaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, provincia: e.target.value, distrito: '', nombreZona: '', codigoZona: '' }));
  };

  const handleDistritoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const distrito = e.target.value;
    setForm(prev => ({
      ...prev,
      distrito,
      nombreZona: distrito && prev.provincia ? `${distrito} - ${prev.provincia}` : '',
      codigoZona: distrito ? suggestCodigoZona(prev.departamento, prev.provincia) : '',
    }));
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await crudService('zonas').create(form);
      publishEventAlert({
        type: 'success',
        message: `Zona operativa ${form.nombreZona} registrada correctamente.`,
      });
      navigate('/zonas');
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 409 && data?.message) {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        setMessage(msg);
      } else {
        setMessage('No se pudo guardar. Revisá los datos e intentá nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="zonas-formPage">
      <div className="zonas-formHeader">
        <div>
          <p>Nuevo registro territorial</p>
          <h2>Nueva zona operativa</h2>
          <span>Seleccione la ubicación desde el catálogo territorial del MVP.</span>
        </div>
      </div>

      <div className="zonas-formCard">
        <Select label="Departamento" required value={form.departamento} options={departamentosOptions} onChange={handleDepartamentoChange} />
        <Select label="Provincia" required value={form.provincia} options={provinciasOptions} onChange={handleProvinciaChange} disabled={!form.departamento} />
        <Select label="Distrito" required value={form.distrito} options={distritosOptions} onChange={handleDistritoChange} disabled={!form.provincia} />
        <Input label="Nombre de zona" required value={form.nombreZona} onChange={(e) => setForm({ ...form, nombreZona: e.target.value })} />
        <Input label="Código de zona" required value={form.codigoZona} readOnly />
        <p className="zonas-helperText">Generado automáticamente según la ubicación territorial.</p>
        <Select label="Estado" required value={form.estado} options={zonaEstadoOptions} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
      </div>

      {message && <Toast type={message.startsWith('No') ? 'error' : 'success'} message={message} />}

      <div className="zonas-formActions">
        <Button disabled={loading} className="zonas-applyButton">{loading ? 'Guardando...' : 'Guardar zona'}</Button>
        <Button type="button" variant="secondary" className="zonas-clearButton" onClick={() => navigate(-1)}>Cancelar</Button>
      </div>
    </form>
  );
}
