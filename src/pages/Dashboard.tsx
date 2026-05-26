import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { ChartCard } from '../components/ui/ChartCard';
import { Table } from '../components/ui/Table';
import { dashboardService } from '../services/dashboard';
import { useAsync } from '../hooks/useAsync';
import { formatKwh, months, thisYear } from '../utils/format';
import type { ConsumoMensual, ConsumoTipoCliente, ConsumoZona, DashboardResumen, IncidenciaTipo, TopSuministro } from '../types';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const colors = ['#1e3a8a', '#06b6d4', '#334155', '#57dffe', '#64748b', '#94a3b8'];
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { boxWidth: 10, color: '#444651', font: { size: 11, weight: 600 } } } },
  scales: { x: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } }, y: { grid: { color: '#eef2f7' }, ticks: { color: '#64748b' } } },
} as const;

const series = (items: Record<string, unknown>[], labelKey: string, valueKey = 'total') => ({
  labels: items.map((x) => String(x[labelKey] ?? '')),
  datasets: [{
    label: 'Consumo kWh',
    data: items.map((x) => Number(x[valueKey] ?? 0)),
    backgroundColor: colors,
    borderColor: '#1e3a8a',
    borderRadius: 8,
    tension: .35,
  }],
});

const sumValues = (items?: IncidenciaTipo[]) => items?.reduce((acc, item) => acc + item.total, 0) ?? 0;

const anioOptions = Array.from({ length: thisYear - 2019 }, (_, i) => {
  const y = thisYear - i;
  return { label: String(y), value: String(y) };
});

export function Dashboard() {
  const [anio, setAnio] = useState(thisYear);

  const resumen = useAsync<DashboardResumen>(() => dashboardService.resumen(anio), [anio]);
  const mensual = useAsync<ConsumoMensual[]>(() => dashboardService.consumoMensual(anio), [anio]);
  const zona = useAsync<ConsumoZona[]>(() => dashboardService.consumoPorZona(anio), [anio]);
  const tipo = useAsync<ConsumoTipoCliente[]>(() => dashboardService.consumoPorTipoCliente(anio), [anio]);
  const top = useAsync<TopSuministro[]>(() => dashboardService.topSuministros(anio), [anio]);
  const incidencias = useAsync<IncidenciaTipo[]>(() => dashboardService.incidenciasPorTipo(anio), [anio]);

  const monthlyData = {
    labels: months,
    datasets: [{
      label: 'Consumo mensual',
      data: months.map((_, i) => mensual.data?.find((x) => x.mes === i + 1)?.consumoKwh ?? 0),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, .16)',
      fill: true,
      pointBackgroundColor: '#1e3a8a',
      pointRadius: 3,
      tension: .38,
    }],
  };

  const resumenData = resumen.data;
  const totalIncidencias = sumValues(incidencias.data ?? undefined);

  return (
    <div className="dashboard-stitch">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Resumen Operativo</p>
          <h1>Visualización general de métricas y estado de la red.</h1>
        </div>
      </section>

      <section className="dashboard-filters">
        <div className="filter-field"><span>Rango de años</span><select><option>Año actual</option><option>Últimos 3 años</option><option>Últimos 5 años</option></select></div>
        <div className="filter-field">
          <span>Año desde</span>
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {anioOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <span>Año hasta</span>
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {anioOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="filter-field"><span>Mes</span><select><option>Todos</option><option>Enero</option><option>Febrero</option></select></div>
        <div className="filter-field"><span>Zona operativa</span><select><option>Todas</option><option>Piura Centro</option><option>Castilla</option></select></div>
        <div className="filter-field"><span>Distrito</span><select><option>Todos</option><option>Piura</option><option>Castilla</option></select></div>
        <div className="filter-field"><span>Tipo de cliente</span><select><option>Todos</option><option>Residencial</option><option>Comercial</option></select></div>
        <div className="filter-field"><span>Estado de lectura</span><select><option>Todos</option><option>Válida</option><option>Observada</option></select></div>
        <div className="filter-field"><span>Tipo de incidencia</span><select><option>Todas</option><option>Consumo alto</option><option>Consumo bajo</option></select></div>
        <div className="filter-actions">
          <button type="button" className="ghost">Limpiar filtros</button>
          <button type="button" className="secondary"><span className="material-symbols-outlined">download</span>Exportar reporte</button>
          <button type="button">Aplicar filtros</button>
        </div>
        <p className="filter-info"><span className="material-symbols-outlined">info</span>Todos los indicadores, gráficos y tablas se recalculan según los filtros seleccionados. El dashboard permite analizar el consumo eléctrico registrado por el TPS por periodo, zona, distrito y tipo de cliente.</p>
      </section>

      <section className="dashboard-kpis">
        <Card title="Consumo Total Filtrado" value={formatKwh(resumenData?.consumoTotalAnual)}><span className="kpi-icon material-symbols-outlined icon-fill">bolt</span></Card>
        <Card title="Consumo Prom. Mensual" value={formatKwh(resumenData?.promedioMensual)}><span className="kpi-icon material-symbols-outlined">calendar_month</span></Card>
        <Card title="Variación vs Anterior" value="+4.2%" accent><span className="kpi-icon material-symbols-outlined">trending_up</span></Card>
        <Card title="Zona Mayor Consumo" value={resumenData?.zonaMayorConsumo ?? '-'}><span className="kpi-icon material-symbols-outlined">map</span></Card>
        <Card title="Suministros Activos" value={resumenData?.totalSuministrosActivos ?? 0}><span className="kpi-icon material-symbols-outlined">check_circle</span></Card>
        <Card title="Lecturas Observadas" value={resumenData?.lecturasObservadas ?? 0}><span className="kpi-icon material-symbols-outlined">warning</span></Card>
        <Card title="Total de Incidencias" value={totalIncidencias || resumenData?.lecturasObservadas || 0}><span className="kpi-icon material-symbols-outlined">report_problem</span></Card>
      </section>

      <section className="dashboard-grid">
        <ChartCard title="Consumo mensual según filtros" loading={mensual.loading} error={mensual.error}>
          <Line data={monthlyData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Distribución por tipo de cliente" loading={tipo.loading} error={tipo.error}>
          <Doughnut data={series(tipo.data ?? [], 'tipoCliente')} options={{ responsive: true, maintainAspectRatio: false, plugins: chartOptions.plugins }} />
        </ChartCard>
        <ChartCard title="Comparativo anual según rango seleccionado" loading={mensual.loading} error={mensual.error}>
          <Bar data={monthlyData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Consumo por zona operativa" loading={zona.loading} error={zona.error}>
          <Bar data={series(zona.data ?? [], 'zona')} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Incidencias por tipo" loading={incidencias.loading} error={incidencias.error}>
          <Bar data={series(incidencias.data ?? [], 'tipo')} options={chartOptions} />
        </ChartCard>
      </section>

      <section className="dashboard-sectionHeader">
        <div>
          <h2>Top 10 Suministros con Mayor Consumo</h2>
          <p>Periodo actual seleccionado</p>
        </div>
        <button type="button">Ver Reporte Completo <span className="material-symbols-outlined">arrow_forward</span></button>
      </section>
      <Table
        loading={top.loading}
        data={top.data ?? []}
        columns={[
          { header: 'Código Suministro', accessor: 'codigoSuministro' },
          { header: 'Zona', accessor: 'zona' },
          { header: 'Distrito', accessor: 'distrito' },
          { header: 'Tipo Cliente', accessor: 'tipoCliente' },
          { header: 'Consumo (kWh)', accessor: (row) => formatKwh(row.consumoKwh) },
          { header: 'Estado', accessor: 'estado' },
        ]}
      />
    </div>
  );
}
