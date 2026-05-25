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
  });

  const [active, setActive] = useState(draft);

  const { data: listResponse, loading, error } = useAsync(
    () => lecturasService.list({
      page: String(active.page),
      limit: String(active.limit),
      anio: active.anio,
      mes: active.mes,
      zonaId: active.zonaId,
      estadoLectura: active.estadoLectura,
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

  function applyFilters() {
    setActive({ ...draft, page: 1 });
  }

  function clearFilters() {
    const reset = { page: 1, limit: 20, anio: '', mes: '', zonaId: '', estadoLectura: '' };
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
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-copper">Registro mensual</p>
          <h2 className="serif text-4xl font-bold text-enosa-950">Lecturas eléctricas</h2>
        </div>
        <Link to="/lecturas/nueva"><Button>Nueva lectura</Button></Link>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-panel space-y-4">
        <div className="grid gap-4 md:grid-cols-6">
          <Select label="Año" value={draft.anio} options={aniosOptions} onChange={(e) => setDraft({ ...draft, anio: e.target.value })} />
          <Select label="Mes" value={draft.mes} options={[{ label: 'Todos', value: '' }, ...mesesOptions]} onChange={(e) => setDraft({ ...draft, mes: e.target.value })} />
          <Select label="Zona" value={draft.zonaId} options={[{ label: 'Todas', value: '' }, ...zonasOptions]} onChange={(e) => setDraft({ ...draft, zonaId: e.target.value })} />
          <Select label="Estado" value={draft.estadoLectura} options={[{ label: 'Todos', value: '' }, ...estadosOptions]} onChange={(e) => setDraft({ ...draft, estadoLectura: e.target.value })} />
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
          { header: 'Medidor', accessor: 'medidorId' },
          { header: 'Periodo', accessor: 'periodoId' },
          { header: 'Anterior', accessor: 'lecturaAnterior' },
          { header: 'Actual', accessor: 'lecturaActual' },
          { header: 'Consumo', accessor: (r: Lectura) => formatKwh(r.consumoKwh ?? r.lecturaActual - r.lecturaAnterior) },
          { header: 'Observación', accessor: 'observacion' },
        ]}
      />
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
    } else if (!form.medidorId) {
      setForm((prev) => ({ ...prev, lecturaAnterior: '', suministroId: '' }));
    }
  }, [ultimaLectura, form.medidorId]);

  const consumo = useMemo(() => Number(form.lecturaActual || 0) - Number(form.lecturaAnterior || 0), [form]);
  const invalid = consumo < 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (invalid) return setMessage('La lectura actual debe ser mayor o igual a la lectura anterior.');
    setLoading(true);
    setMessage('');
    try {
      await lecturasService.create({
        medidorId: form.medidorId,
        periodoId: form.periodoId,
        lecturaActual: Number(form.lecturaActual),
        lecturaAnterior: Number(form.lecturaAnterior),
        consumoKwh: consumo,
        fechaLectura: form.fechaLectura,
        observacion: form.observacion,
      });
      setMessage('Lectura registrada correctamente.');
      setTimeout(() => navigate('/lecturas'), 500);
    } catch {
      setMessage('No se pudo guardar la lectura.');
    } finally {
      setLoading(false);
    }
  }

  const medidoresOptions = (catalogs?.medidores ?? []).map((m: any) => ({
    label: m.numeroMedidor || m.codigo || `MED-${m.id}`,
    value: String(m.id),
  }));

  const periodosOptions = (catalogs?.periodos ?? []).map((p: any) => ({
    label: `${p.anio} - ${p.mes}`,
    value: String(p.id),
  }));

  const medidorSeleccionado = (catalogs?.medidores ?? []).find((m: any) => String(m.id) === form.medidorId) as any;
  const suministroCodigo = medidorSeleccionado?.suministro?.codigoSuministro || (form.suministroId ? `SUM-${form.suministroId}` : '');

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-sm font-bold text-copper">Cálculo automático kWh</p>
        <h2 className="serif text-4xl font-bold text-enosa-950">Nueva lectura</h2>
      </div>

      <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-panel md:grid-cols-2">
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
          <label className="block text-sm font-semibold text-slate-700">
            Observación
            <textarea
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus:border-enosa-500 focus:ring-4 focus:ring-enosa-500/10"
              rows={2}
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              placeholder="Opcional..."
            />
          </label>
        </div>
      </div>

      <Card title="Consumo calculado antes de guardar" value={formatKwh(Math.max(consumo, 0))} subtitle="consumoKwh = lecturaActual - lecturaAnterior" accent />

      {message && <Toast type={message.includes('correctamente') ? 'success' : 'error'} message={message} />}

      <div className="flex gap-3">
        <Button disabled={loading || invalid}>{loading ? 'Guardando...' : 'Guardar lectura'}</Button>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
      </div>
    </form>
  );
}
