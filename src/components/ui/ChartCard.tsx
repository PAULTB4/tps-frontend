import type React from 'react';

type Props = { title: string; subtitle?: string; children: React.ReactNode; loading?: boolean; error?: string };

export function ChartCard({ title, subtitle, children, loading, error }: Props) {
  return (
    <section className="stitch-chartCard">
      <div className="stitch-chartHeader">
        <h2>{title}</h2>
        {subtitle && <p className="stitch-chartSubtitle">{subtitle}</p>}
      </div>
      {loading
        ? <div className="stitch-chartLoading">Cargando gráfico...</div>
        : error
          ? <div className="stitch-chartError">{error}</div>
          : <div className="stitch-chartBody">{children}</div>}
    </section>
  );
}
