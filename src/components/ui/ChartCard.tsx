import type React from 'react';

type Props = { title: string; children: React.ReactNode; loading?: boolean };

export function ChartCard({ title, children, loading }: Props) {
  return <section className="stitch-chartCard"><div className="stitch-chartHeader"><h2>{title}</h2></div>{loading ? <div className="stitch-chartLoading">Cargando gráfico...</div> : <div className="stitch-chartBody">{children}</div>}</section>;
}
