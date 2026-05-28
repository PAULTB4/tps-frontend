import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { ChartCard } from '../components/ui/ChartCard';
import { Table } from '../components/ui/Table';
import { dashboardService } from '../services/dashboard';
import { crudService } from '../services/crud';
import { lecturasService } from '../services/lecturas';
import { reportesService } from '../services/reportes';
import { useAsync } from '../hooks/useAsync';
import { formatKwh, months, thisYear } from '../utils/format';
import { extractRows } from '../utils/pagination';
import type { ComparativoAnual, ConsumoMensual, ConsumoTipoCliente, ConsumoZona, DashboardFilters, DashboardResumen, IncidenciaTipo, LecturasParametros, TopSuministro } from '../types';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const colors = ['#1e3a8a', '#06b6d4', '#334155', '#57dffe', '#64748b', '#94a3b8'];
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { boxWidth: 10, color: '#444651', font: { size: 11, weight: 600 } } } },
  scales: { x: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } }, y: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } } },
} as const;

const formatYTick = (value: number | string): string => {
  const n = Number(value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} M kWh`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString('es-PE', { maximumFractionDigits: 1 })} k kWh`;
  return `${n.toLocaleString('es-PE')} kWh`;
};

const zonaBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { boxWidth: 10, color: '#444651', font: { size: 11, weight: 600 as const } } },
    tooltip: { callbacks: { label: (ctx: { raw: unknown }) => ` ${Number(ctx.raw).toLocaleString('es-PE')} kWh` } },
  },
  scales: {
    x: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } },
    y: {
      grid: { color: '#eef2f7' },
      ticks: { color: '#64748b', callback: formatYTick },
      title: { display: true, text: 'Consumo (kWh)', color: '#64748b', font: { size: 11 } },
    },
  },
};

const incidenciasBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { boxWidth: 10, color: '#444651', font: { size: 11, weight: 600 as const } } },
    tooltip: { callbacks: { label: (ctx: { raw: unknown }) => ` ${Number(ctx.raw).toLocaleString('es-PE', { maximumFractionDigits: 0 })} incidencias` } },
  },
  scales: {
    x: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } },
    y: {
      grid: { color: '#eef2f7' },
      ticks: { color: '#64748b' },
      title: { display: true, text: 'Cantidad', color: '#64748b', font: { size: 11 } },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { boxWidth: 10, color: '#444651', font: { size: 11, weight: 600 as const } } },
    tooltip: { callbacks: { label: (ctx: { raw: unknown }) => ` ${Number(ctx.raw).toLocaleString('es-PE')} kWh` } },
  },
};

const toNumber = (value: unknown) => Number(value ?? 0);
const series = <T extends object>(items: T[], labelKey: string, valueKey = 'consumoKwh') => ({
  labels: items.map((item) => String((item as Record<string, unknown>)[labelKey] ?? '')),
  datasets: [{
    label: 'Consumo kWh',
    data: items.map((item) => toNumber((item as Record<string, unknown>)[valueKey])),
    backgroundColor: colors,
    borderColor: '#1e3a8a',
    borderRadius: 8,
    tension: .35,
  }],
});

const sumValues = (items?: IncidenciaTipo[]) => items?.reduce((acc, item) => acc + item.total, 0) ?? 0;

const monthOptions = [
  { label: 'Todos', value: '' },
  ...months.map((label, index) => ({ label, value: String(index + 1) })),
];

const tipoClienteOptions = [
  { label: 'Todos', value: '' },
  { label: 'Residencial', value: 'RESIDENCIAL' },
  { label: 'Comercial', value: 'COMERCIAL' },
  { label: 'Industrial', value: 'INDUSTRIAL' },
  { label: 'Público', value: 'PUBLICO' },
];

const emptyFilters = {
  anioDesde: String(thisYear),
  anioHasta: String(thisYear),
  mes: '',
  zonaId: '',
  distrito: '',
  tipoCliente: '',
  estadoLectura: '',
  tipoIncidencia: '',
};

type ZonaOptionSource = { id?: string | number; nombreZona?: string; distrito?: string };

const anioOptions = Array.from({ length: thisYear - 2019 }, (_, i) => {
  const y = thisYear - i;
  return { label: String(y), value: String(y) };
});

export function Dashboard() {
  const [range, setRange] = useState('actual');
  const [draft, setDraft] = useState<DashboardFilters>(emptyFilters);
  const [active, setActive] = useState<DashboardFilters>(emptyFilters);
  const [exporting, setExporting] = useState(false);

  const resumen = useAsync<DashboardResumen>(() => dashboardService.resumen(active), [active]);
  const mensual = useAsync<ConsumoMensual[]>(() => dashboardService.consumoMensual(active), [active]);
  const comparativo = useAsync<ComparativoAnual[]>(() => dashboardService.comparativoAnual(active), [active]);
  const zona = useAsync<ConsumoZona[]>(() => dashboardService.consumoPorZona(active), [active]);
  const tipo = useAsync<ConsumoTipoCliente[]>(() => dashboardService.consumoPorTipoCliente(active), [active]);
  const top = useAsync<TopSuministro[]>(() => dashboardService.topSuministros(active), [active]);
  const incidencias = useAsync<IncidenciaTipo[]>(() => dashboardService.incidenciasPorTipo(active), [active]);
  const zonas = useAsync(() => crudService('zonas').list({ limit: 100 }) as Promise<unknown>, []);
  const parametros = useAsync<LecturasParametros>(() => lecturasService.parametros(), []);

  const allZonas = useMemo(() => extractRows<ZonaOptionSource>(zonas.data ?? []), [zonas.data]);
  const zonaOptions = useMemo(() => allZonas.map((z) => ({ label: z.nombreZona ?? `Zona ${z.id}`, value: String(z.id ?? '') })).filter((z) => z.value), [allZonas]);
  const distritoOptions = useMemo(() => {
    const filtered = draft.zonaId ? allZonas.filter((z) => String(z.id) === String(draft.zonaId)) : allZonas;
    return [...new Set(filtered.map((z) => z.distrito).filter(Boolean))].sort().map((d) => ({ label: String(d), value: String(d) }));
  }, [allZonas, draft.zonaId]);
  const estadoLecturaOptions = useMemo(() => (parametros.data?.estadosLectura ?? []).map((value) => ({ label: value, value })), [parametros.data]);
  const tipoIncidenciaOptions = useMemo(() => (parametros.data?.tiposIncidencia ?? []).map((value) => ({ label: value, value })), [parametros.data]);

  const monthlyRows = mensual.data ?? [];
  const isSingleYear = active.anioDesde && active.anioDesde === active.anioHasta;

  const monthlyData = {
    labels: isSingleYear && !active.mes ? months : monthlyRows.map((x) => `${months[(x.mes ?? 1) - 1] ?? x.mes} ${x.anio ?? ''}`.trim()),
    datasets: [{
      label: 'Consumo mensual',
      data: isSingleYear && !active.mes ? months.map((_, i) => toNumber(monthlyRows.find((x) => x.mes === i + 1)?.consumoKwh)) : monthlyRows.map((x) => toNumber(x.consumoKwh)),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, .16)',
      fill: true,
      pointBackgroundColor: '#1e3a8a',
      pointRadius: 3,
      tension: .38,
    }],
  };

  const annualData = {
    labels: (comparativo.data ?? []).map((x) => String(x.anio)),
    datasets: [{
      label: 'Consumo anual',
      data: (comparativo.data ?? []).map((x) => toNumber(x.consumoKwh)),
      backgroundColor: colors,
      borderColor: '#1e3a8a',
      borderRadius: 8,
    }],
  };

  const incidenciaData = {
    labels: (incidencias.data ?? []).map((x) => [x.tipoIncidencia, x.estado].filter(Boolean).join(' / ')),
    datasets: [{ label: 'Incidencias', data: (incidencias.data ?? []).map((x) => x.total), backgroundColor: colors, borderRadius: 8 }],
  };

  const resumenData = resumen.data;
  const consumoTotal = toNumber(resumenData?.consumoTotalKwh);
  const promedioMensual = active.mes ? null : monthlyRows.length ? consumoTotal / monthlyRows.length : 0;
  const totalIncidencias = resumenData?.totalIncidencias ?? sumValues(incidencias.data ?? undefined);
  const zonaMayorConsumo = [...(zona.data ?? [])].sort((a, b) => toNumber(b.consumoKwh) - toNumber(a.consumoKwh))[0]?.nombreZona ?? '-';
  const annualRows = [...(comparativo.data ?? [])].sort((a, b) => toNumber(a.anio) - toNumber(b.anio));
  const previousAnnual = annualRows.length > 1 ? annualRows[annualRows.length - 2] : undefined;
  const currentAnnual = annualRows.length > 0 ? annualRows[annualRows.length - 1] : undefined;
  const variation = previousAnnual && toNumber(previousAnnual.consumoKwh) !== 0
    ? `${(((toNumber(currentAnnual?.consumoKwh) - toNumber(previousAnnual.consumoKwh)) / toNumber(previousAnnual.consumoKwh)) * 100).toLocaleString('es-PE', { maximumFractionDigits: 1, signDisplay: 'always' })}%`
    : '-';

  const mensualOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { boxWidth: 10, color: '#444651', font: { size: 11, weight: 600 as const } } },
      tooltip: { callbacks: { label: (ctx: { raw: unknown }) => ` ${Number(ctx.raw).toLocaleString('es-PE')} kWh` } },
    },
    scales: {
      x: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } },
      y: {
        grid: { color: '#eef2f7' },
        ticks: { color: '#64748b', callback: formatYTick },
        title: { display: true, text: 'Consumo (kWh)', color: '#64748b', font: { size: 11 } },
      },
    },
  }), []);

  const comparativoOptions = useMemo(() => {
    const rows = [...(comparativo.data ?? [])].sort((a, b) => toNumber(a.anio) - toNumber(b.anio));
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { boxWidth: 10, color: '#444651', font: { size: 11, weight: 600 as const } } },
        tooltip: {
          callbacks: {
            label: (ctx: { raw: unknown; dataIndex: number }) => {
              const prev = rows[ctx.dataIndex - 1];
              const kwh = Number(ctx.raw).toLocaleString('es-PE');
              if (!prev || toNumber(prev.consumoKwh) === 0) return ` ${kwh} kWh`;
              const pct = (((Number(ctx.raw) - toNumber(prev.consumoKwh)) / toNumber(prev.consumoKwh)) * 100)
                .toLocaleString('es-PE', { maximumFractionDigits: 1, signDisplay: 'always' });
              return ` ${kwh} kWh (${pct}% vs ${prev.anio})`;
            },
          },
        },
      },
      scales: {
        x: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } },
        y: {
          grid: { color: '#eef2f7' },
          ticks: { color: '#64748b', callback: formatYTick },
          title: { display: true, text: 'Consumo (kWh)', color: '#64748b', font: { size: 11 } },
        },
      },
    };
  }, [comparativo.data]);

  const comparativoSubtitle = active.anioDesde === active.anioHasta
    ? `Año ${active.anioDesde}`
    : `${active.anioDesde} – ${active.anioHasta}`;

  const setRangeFilter = (value: string) => {
    setRange(value);
    if (value === 'actual') setDraft((prev) => ({ ...prev, anioDesde: String(thisYear), anioHasta: String(thisYear) }));
    if (value === '3') setDraft((prev) => ({ ...prev, anioDesde: String(thisYear - 2), anioHasta: String(thisYear) }));
    if (value === '5') setDraft((prev) => ({ ...prev, anioDesde: String(thisYear - 4), anioHasta: String(thisYear) }));
  };

  const applyFilters = () => setActive({ ...draft });
  const clearFilters = () => {
    setRange('actual');
    setDraft(emptyFilters);
    setActive(emptyFilters);
  };

  const exportReport = () => {
    const reportFilters = {
      anioDesde: active.anioDesde,
      anioHasta: active.anioHasta,
      mes: active.mes,
      zonaId: active.zonaId,
      distrito: active.distrito,
      tipoCliente: active.tipoCliente,
      estadoLectura: active.estadoLectura,
    };
    setExporting(true);
    reportesService.consumoExcel(reportFilters).catch(() => {}).finally(() => setExporting(false));
  };

  return (
    <div className="dashboard-stitch">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Resumen Operativo</p>
          <h1>Visualización general de métricas y estado de la red.</h1>
        </div>
      </section>

      <section className="dashboard-filters">
        <div className="filter-field"><span>Rango de años</span><select value={range} onChange={(e) => setRangeFilter(e.target.value)}><option value="actual">Año actual</option><option value="3">Últimos 3 años</option><option value="5">Últimos 5 años</option><option value="custom">Personalizado</option></select></div>
        <div className="filter-field">
          <span>Año desde</span>
          <select value={draft.anioDesde} onChange={(e) => { setRange('custom'); setDraft((prev) => ({ ...prev, anioDesde: e.target.value })); }}>
            {anioOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <span>Año hasta</span>
          <select value={draft.anioHasta} onChange={(e) => { setRange('custom'); setDraft((prev) => ({ ...prev, anioHasta: e.target.value })); }}>
            {anioOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="filter-field"><span>Mes</span><select value={draft.mes} onChange={(e) => setDraft((prev) => ({ ...prev, mes: e.target.value }))}>{monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div className="filter-field"><span>Zona operativa</span><select value={draft.zonaId} onChange={(e) => setDraft((prev) => ({ ...prev, zonaId: e.target.value, distrito: '' }))}><option value="">Todas</option>{zonaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div className="filter-field"><span>Distrito</span><select value={draft.distrito} onChange={(e) => setDraft((prev) => ({ ...prev, distrito: e.target.value }))}><option value="">Todos</option>{distritoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div className="filter-field"><span>Tipo de cliente</span><select value={draft.tipoCliente} onChange={(e) => setDraft((prev) => ({ ...prev, tipoCliente: e.target.value }))}>{tipoClienteOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div className="filter-field"><span>Estado de lectura</span><select value={draft.estadoLectura} onChange={(e) => setDraft((prev) => ({ ...prev, estadoLectura: e.target.value }))}><option value="">Todos</option>{estadoLecturaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div className="filter-field"><span>Tipo de incidencia</span><select value={draft.tipoIncidencia} onChange={(e) => setDraft((prev) => ({ ...prev, tipoIncidencia: e.target.value }))}><option value="">Todas</option>{tipoIncidenciaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div className="filter-actions">
          <button type="button" className="ghost" onClick={clearFilters}>Limpiar filtros</button>
          <button type="button" className="secondary" onClick={exportReport} disabled={exporting}><span className="material-symbols-outlined">download</span>{exporting ? 'Exportando...' : 'Exportar reporte'}</button>
          <button type="button" onClick={applyFilters}>Aplicar filtros</button>
        </div>
        <p className="filter-info"><span className="material-symbols-outlined">info</span>Todos los indicadores, gráficos y tablas se recalculan según los filtros seleccionados. El dashboard permite analizar el consumo eléctrico registrado por el TPS por periodo, zona, distrito y tipo de cliente.</p>
      </section>

      <section className="dashboard-kpis">
        <Card title="Consumo Total Filtrado" value={formatKwh(consumoTotal)}><span className="kpi-icon material-symbols-outlined icon-fill">bolt</span></Card>
        <Card title="Consumo Prom. Mensual" value={promedioMensual !== null ? formatKwh(promedioMensual) : '-'}><span className="kpi-icon material-symbols-outlined">calendar_month</span></Card>
        <Card title="Variación vs Anterior" value={variation} accent><span className="kpi-icon material-symbols-outlined">trending_up</span></Card>
        <Card title="Zona Mayor Consumo" value={zonaMayorConsumo}><span className="kpi-icon material-symbols-outlined">map</span></Card>
        <Card title="Medidores Activos" value={resumenData?.medidoresActivos ?? 0}><span className="kpi-icon material-symbols-outlined">check_circle</span></Card>
        <Card title="Lecturas Observadas" value={resumenData?.lecturasObservadas ?? 0}><span className="kpi-icon material-symbols-outlined">warning</span></Card>
        <Card title="Total de Incidencias" value={totalIncidencias}><span className="kpi-icon material-symbols-outlined">report_problem</span></Card>
      </section>

      <section className="dashboard-grid">
        <ChartCard title="Consumo mensual según filtros" loading={mensual.loading} error={mensual.error}>
          <Line data={monthlyData} options={mensualOptions} />
        </ChartCard>
        <ChartCard title="Distribución por tipo de cliente" loading={tipo.loading} error={tipo.error}>
          <Doughnut data={series(tipo.data ?? [], 'tipoCliente')} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Comparativo anual según rango seleccionado" subtitle={comparativoSubtitle} loading={comparativo.loading} error={comparativo.error}>
          <Bar data={annualData} options={comparativoOptions} />
        </ChartCard>
        <ChartCard title="Consumo por zona operativa" loading={zona.loading} error={zona.error}>
          <Bar data={series(zona.data ?? [], 'nombreZona')} options={zonaBarOptions} />
        </ChartCard>
        <ChartCard title="Incidencias por tipo" loading={incidencias.loading} error={incidencias.error}>
          <Bar data={incidenciaData} options={incidenciasBarOptions} />
        </ChartCard>
      </section>

      <section className="dashboard-sectionHeader">
        <div>
          <h2>Top 10 Suministros con Mayor Consumo</h2>
          <p>Periodo actual seleccionado</p>
        </div>
        <button type="button" onClick={exportReport}>Ver Reporte Completo <span className="material-symbols-outlined">arrow_forward</span></button>
      </section>
      <Table
        loading={top.loading}
        data={top.data ?? []}
        columns={[
          { header: 'Código Suministro', accessor: 'codigoSuministro' },
          { header: 'Zona', accessor: 'nombreZona' },
          { header: 'Distrito', accessor: 'distrito' },
          { header: 'Tipo Cliente', accessor: 'tipoCliente' },
          { header: 'Consumo (kWh)', accessor: (row) => formatKwh(row.consumoKwh) },
          { header: 'Estado', accessor: 'estado' },
        ]}
      />
    </div>
  );
}
