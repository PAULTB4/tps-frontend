import type React from 'react';

type Props = { title?: string; value?: React.ReactNode; subtitle?: string; children?: React.ReactNode; accent?: boolean };

export function Card({ title, value, subtitle, children, accent }: Props) {
  return (
    <section className={`stitch-card ${accent ? 'is-accent' : ''}`}>
      {title && <p className="stitch-cardLabel">{title}</p>}
      {value !== undefined && value !== null && <h3 className="stitch-cardValue">{value}</h3>}
      {subtitle && <p className="stitch-cardSub">{subtitle}</p>}
      {children}
    </section>
  );
}
