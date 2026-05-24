import type { TableColumn } from '../../types';

type Props<T> = { columns: TableColumn<T>[]; data: T[]; loading?: boolean; empty?: string };

export function Table<T extends { id?: string | number }>({ columns, data, loading, empty = 'Sin registros' }: Props<T>) {
  return (
    <div className="stitch-tableShell">
      <div className="overflow-x-auto">
        <table className="stitch-table">
          <thead>
            <tr>{columns.map((c) => <th key={String(c.header)} className={c.className ?? ''}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td className="stitch-tableState" colSpan={columns.length}>Cargando información...</td></tr>}
            {!loading && data.length === 0 && <tr><td className="stitch-tableState" colSpan={columns.length}>{empty}</td></tr>}
            {!loading && data.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((c) => <td key={String(c.header)} className={c.className ?? ''}>{typeof c.accessor === 'function' ? c.accessor(row) : String(row[c.accessor] ?? '-')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
