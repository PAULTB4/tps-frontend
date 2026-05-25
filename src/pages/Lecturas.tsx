import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toast } from '../components/ui/Toast';
import { DataTable } from '../components/tables/DataTable';
import { lecturasService } from '../services/lecturas';
import { crudService } from '../services/crud';
import { useAsync } from '../hooks/useAsync';
import { formatKwh } from '../utils/format';
import { extractRows } from '../utils/pagination';
import type { Lectura, PaginationMeta } from '../types';

const mesesOptions = [
  { label: 'Enero', value: '1' }, { label: 'Febrero', value: '2' }, { label: 'Marzo', value: '3' },
  { label: 'Abril', value: '4' }, { label: 'Mayo', value: '5' }, { label: 'Junio', value: '6' },
  { label: 'Julio', value: '7' }, { label: 'Agosto', value: '8' }, { label: 'Septiembre', value: '9' },
  { label: 'Octubre', value: '10' }, { label: 'Noviembre', value: '11' }, { label: 'Diciembre', value: '12' },
];

export function Lecturas() {
  const [draft, setDraft] = useState({
    page: 1,
    limit: 20,
    anio: '',
    mes: '',
    zonaId: '',
    estadoLectura: '',
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
    () => lecturasService.list({
      page: String(active.page),
      limit: String(active.limit),
      anio: active.anio,
      mes: active.mes,
      zonaId: active.zonaId,
      estadoLectura: active.estadoLectura,
      search: active.q,
    }),
    [active]
  );

  const rows = (listResponse?.data ?? []) as Lectura[];
  const meta = listResponse?.meta;

  const { data: catalogs } = useAsync(async () => {
    const [zonasRes, periodosRes, paramsRes] = await Promise.all([
      crudService('zonas').list() as Promise<unknown>,
      crudService('periodos').list() as Promise<unknown>,
      lecturasService.parametros(),
    ]);
    return {
      zonas: extractRows(zonasRes),
      periodos: extractRows(periodosRes),
      params: paramsRes,
    };
  }, []);

  const zonasOptions = (catalogs?.zonas ?? []).map((z: any) => ({
    label: z.nombreZona || z.codigoZona || `Zona ${z.id}`,
    value: String(z.id),
  }));

  const aniosOptions = [...new Set((catalogs?.periodos ?? []).map((p: any) => p.anio))].sort((a, b) => b - a).map((a: number) => ({
    label: String(a),
    value: String(a),
  }));

  const estadosOptions = (catalogs?.params?.estadosLectura ?? []).map((e: string) => ({
    label: e,
    value: e,
  }));

  function renderEstadoBadge(estado: string) {
    const classMap: Record<string, string> = {
      VALIDA: 'is-valida',
      OBSERVADA: 'is-observada',
      CORREGIDA: 'is-corregida',
      ANULADA: 'is-anulada',
    };
    const cls = classMap[estado] || 'is-valida';
    return (
      <span className={`lecturas-statusBadge ${cls}`}>
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

  function renderActions(row: Lectura) {
    return (
      <div className="lecturas-actionsCell">
        <button type="button" className="lecturas-actionBtn is-view" title="Ver detalle" onClick={() => handleView(row)}>
          <span className="material-symbols-outlined text-sm">visibility</span>
          Ver
        </button>
        <button type="button" className="lecturas-actionBtn is-edit" title="Corregir lectura" onClick={() => handleCorrect(row)}>
          <span className="material-symbols-outlined text-sm">edit</span>
          Corregir
        </button>
        {row.estadoLectura !== 'ANULADA' && (
          <button type="button" className="lecturas-actionBtn is-delete" title="Anular lectura" onClick={() => handleAnular(row)}>
            <span className="material-symbols-outlined text-sm">cancel</span>
            Anular
          </button>
        )}
      </div>
    );
  }

  function handleView(row: Lectura) {
    // TODO: open detail modal or navigate to detail page
    console.log('Ver lectura:', row);
  }

  function handleCorrect(row: Lectura) {
    // TODO: open correction modal
    console.log('Corregir lectura:', row);
  }

  function handleAnular(row: Lectura) {
    // TODO: open anular confirmation modal
    console.log('Anular lectura:', row);
  }

  function applyFilters() {
    setActive({ ...draft, page: 1 });
  }

  function clearFilters() {
    const reset = { page: 1, limit: 20, anio: '', mes: '', zonaId: '', estadoLectura: '', q: '' };
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
    <div className="lecturas-page">
      <div className="lecturas-header">
        <div>
          <h2>Lecturas eléctricas</h2>
          <p>Registro mensual y control de consumos por medidor.</p>
        </div>
        <Link to="/lecturas/nueva"><Button icon="add" className="lecturas-primaryAction">Nueva lectura</Button></Link>
      </div>

      <div className="lecturas-filterPanel">
        <div className="lecturas-filtersGrid">
          <div className="lecturas-searchField">
            <Input
              label="Buscar lectura"
              placeholder="Medidor o suministro..."
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
              icon="search"
            />
          </div>
          <Select label="Año" value={draft.anio} options={aniosOptions} onChange={(e) => setDraft({ ...draft, anio: e.target.value })} />
          <Select label="Mes" value={draft.mes} options={[{ label: 'Todos', value: '' }, ...mesesOptions]} onChange={(e) => setDraft({ ...draft, mes: e.target.value })} />
          <Select label="Zona" value={draft.zonaId} options={[{ label: 'Todas', value: '' }, ...zonasOptions]} onChange={(e) => setDraft({ ...draft, zonaId: e.target.value })} />
          <Select label="Estado" value={draft.estadoLectura} options={[{ label: 'Todos', value: '' }, ...estadosOptions]} onChange={(e) => setDraft({ ...draft, estadoLectura: e.target.value })} />
          <div className="lecturas-filterActions">
            <Button onClick={applyFilters} className="lecturas-applyButton">Aplicar filtros</Button>
            <Button variant="secondary" onClick={clearFilters} className="lecturas-clearButton">Limpiar filtros</Button>
          </div>
        </div>
      </div>

      {error && <Toast type="error" message={error} />}

      <div className="lecturas-tableCard">
        <DataTable
          loading={loading}
          data={rows}
          meta={meta}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          entityLabel="lecturas"
          empty="No se encontraron lecturas con los filtros aplicados."
          columns={[
            { header: 'Zona', accessor: (r: Lectura) => r.zona ?? '-', className: 'lecturas-zoneCell' },
            { header: 'Suministro', accessor: (r: Lectura) => r.codigoSuministro ?? '-', className: 'lecturas-codeCell' },
            { header: 'Medidor', accessor: (r: Lectura) => r.numeroMedidor ?? r.medidorId, className: 'lecturas-codeCell' },
            { header: 'Periodo', accessor: (r: Lectura) => r.periodoLabel ?? `${r.anio}-${r.mes}` },
            { header: 'Actual', accessor: 'lecturaActual' },
            { header: 'Consumo', accessor: (r: Lectura) => formatKwh(r.consumoKwh ?? r.lecturaActual - r.lecturaAnterior), className: 'lecturas-consumptionCell' },
            { header: 'Estado', accessor: (r: Lectura) => renderEstadoBadge(r.estadoLectura ?? 'VALIDA') },
          ]}
          actions={renderActions}
        />
      </div>
    </div>
  );
}

export function LecturaForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    medidorId: '',
    periodoId: '',
    lecturaAnterior: '',
    lecturaActual: '',
    fechaLectura: '',
    observacion: '',
    suministroId: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: catalogs } = useAsync(async () => {
    const [medidoresRes, periodosRes] = await Promise.all([
      crudService('medidores').list() as Promise<unknown>,
      crudService('periodos').list() as Promise<unknown>,
    ]);
    return {
      medidores: extractRows(medidoresRes),
      periodos: extractRows(periodosRes),
    };
  }, []);

  const { data: ultimaLectura } = useAsync(
    () => (form.medidorId ? lecturasService.ultima(form.medidorId) : Promise.resolve(null)),
    [form.medidorId]
  );

  useEffect(() => {
    if (ultimaLectura) {
      setForm((prev) => ({
        ...prev,
        lecturaAnterior: String(ultimaLectura.lecturaActual ?? ''),
        suministroId: String(ultimaLectura.suministroId ?? ''),
      }));
    } else if (form.medidorId) {
      setForm((prev) => ({ ...prev, lecturaAnterior: '0', suministroId: '' }));
    } else {
      setForm((prev) => ({ ...prev, lecturaAnterior: '', suministroId: '' }));
    }
  }, [ultimaLectura, form.medidorId]);

  const consumo = useMemo(() => Number(form.lecturaActual || 0) - Number(form.lecturaAnterior || 0), [form]);
  const lecturaActualNumber = Number(form.lecturaActual);
  const lecturaActualInvalid = !form.lecturaActual || Number.isNaN(lecturaActualNumber);
  const primeraLectura = !!form.medidorId && form.lecturaAnterior === '0';
  const invalid = lecturaActualInvalid || consumo < 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (lecturaActualInvalid) return setMessage('Ingresá una lectura actual válida.');
    if (invalid) return setMessage('La lectura actual debe ser mayor o igual a la lectura anterior.');
    setLoading(true);
    setMessage('');
    try {
      await lecturasService.create({
        medidorId: Number(form.medidorId),
        periodoId: Number(form.periodoId),
        lecturaAnterior: Number(form.lecturaAnterior || 0),
        lecturaActual: Number(form.lecturaActual),
        fechaLectura: form.fechaLectura,
        observacion: form.observacion,
      });
      setMessage('Lectura registrada correctamente.');
      setTimeout(() => navigate('/lecturas'), 500);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      if (apiMessage) {
        setMessage(Array.isArray(apiMessage) ? apiMessage[0] : apiMessage);
      } else {
        setMessage('No se pudo guardar la lectura. Revisá los datos e intentá nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  const medidoresOptions = (catalogs?.medidores ?? []).map((m: any) => ({
    label: m.numeroMedidor || m.codigo || `MED-${m.id}`,
    value: String(m.id),
  }));

  const periodosOptions = (catalogs?.periodos ?? []).map((p: any) => {
    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return {
      label: `${meses[p.mes] ?? p.mes} ${p.anio}`,
      value: String(p.id),
    };
  });

  const medidorSeleccionado = (catalogs?.medidores ?? []).find((m: any) => String(m.id) === form.medidorId) as any;
  const suministroCodigo = medidorSeleccionado?.suministro?.codigoSuministro || (form.suministroId ? `SUM-${form.suministroId}` : '');

  return (
    <form onSubmit={onSubmit} className="zonas-formPage">
      <div className="zonas-formHeader">
        <div>
          <p>Registro mensual de consumo</p>
          <h2>Nueva lectura</h2>
          <span>Seleccioná el medidor, registrá la lectura actual y validá el consumo calculado.</span>
        </div>
      </div>

      <div className="zonas-formCard">
        <Select
          label="Medidor"
          required
          value={form.medidorId}
          options={medidoresOptions}
          onChange={(e) => setForm({ ...form, medidorId: e.target.value })}
        />
        <Select
          label="Periodo"
          required
          value={form.periodoId}
          options={periodosOptions}
          onChange={(e) => setForm({ ...form, periodoId: e.target.value })}
        />
        <p className="zonas-helperText">La lectura anterior se completa automáticamente desde el último registro del medidor.</p>
        {primeraLectura && <p className="zonas-helperText">No existe lectura previa. Se usará lectura anterior 0.</p>}
        <Input label="Suministro" readOnly value={suministroCodigo} />
        <Input label="Lectura anterior" type="number" readOnly value={form.lecturaAnterior} />
        <Input
          label="Lectura actual"
          type="number"
          required
          value={form.lecturaActual}
          onChange={(e) => setForm({ ...form, lecturaActual: e.target.value })}
          error={invalid ? 'Debe ser >= lectura anterior' : ''}
        />
        <Input
          label="Fecha lectura"
          type="date"
          required
          value={form.fechaLectura}
          onChange={(e) => setForm({ ...form, fechaLectura: e.target.value })}
        />
        <div className="md:col-span-2">
          <label className="lecturas-observationField">
            Observación
            <textarea
              className="lecturas-observationInput"
              rows={2}
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              placeholder="Opcional..."
            />
          </label>
        </div>
      </div>

      <div className="lecturas-consumptionPreview">
        <Card title="Consumo calculado antes de guardar" value={formatKwh(Math.max(consumo, 0))} subtitle="consumoKwh = lecturaActual - lecturaAnterior" accent />
      </div>

      {message && <Toast type={message.includes('correctamente') ? 'success' : 'error'} message={message} />}

      <div className="zonas-formActions">
        <Button disabled={loading || invalid} className="lecturas-applyButton">{loading ? 'Guardando...' : 'Guardar lectura'}</Button>
        <Button type="button" variant="secondary" className="lecturas-clearButton" onClick={() => navigate(-1)}>Cancelar</Button>
      </div>
    </form>
  );
}
