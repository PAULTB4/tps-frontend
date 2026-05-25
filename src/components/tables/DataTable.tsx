import type React from 'react';
import type { TableColumn } from '../../types';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Props<T> = {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  empty?: string;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  actions?: (row: T) => React.ReactNode;
  entityLabel?: string;
};

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  empty = 'Sin registros',
  meta,
  onPageChange,
  onLimitChange,
  actions,
  entityLabel = 'registros',
}: Props<T>) {
  const start = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const end = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;
  const hasPagination = !!meta && meta.totalPages > 1;
  const limitOptions = [10, 20, 50, 100];
  const summary = meta
    ? meta.total === 0
      ? `Sin ${entityLabel}`
      : meta.total === 1
        ? `1 ${entityLabel} encontrado`
        : `Mostrando ${start} a ${end} de ${meta.total} ${entityLabel}`
    : '';

  return (
    <div className="stitch-tableShell">
      <div className="overflow-x-auto">
        <table className="stitch-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={String(c.header)} className={c.className ?? ''}>{c.header}</th>
              ))}
              {actions && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="stitch-tableState" colSpan={columns.length + (actions ? 1 : 0)}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-enosa-500 border-t-transparent" />
                    Cargando información...
                  </span>
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td className="stitch-tableState" colSpan={columns.length + (actions ? 1 : 0)}>{empty}</td>
              </tr>
            )}
            {!loading && data.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((c) => (
                  <td key={String(c.header)} className={c.className ?? ''}>
                    {typeof c.accessor === 'function' ? c.accessor(row) : String(row[c.accessor] ?? '-')}
                  </td>
                ))}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="stitch-tableFooter">
          <div className="stitch-tableSummary">
            <span>{summary}</span>
          </div>

          <div className="stitch-tablePaginationBar">
            {onLimitChange && (
              <label className="stitch-pageSize">
                <span>Por página</span>
                <select
                  className="stitch-pageSizeSelect"
                  value={meta.limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                >
                  {limitOptions.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </label>
            )}

            {hasPagination && onPageChange && (
              <div className="stitch-pageButtons">
                <button
                  type="button"
                  className="stitch-pageButton"
                  onClick={() => onPageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  aria-label="Página anterior"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (meta.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (meta.page <= 3) {
                    pageNum = i + 1;
                  } else if (meta.page >= meta.totalPages - 2) {
                    pageNum = meta.totalPages - 4 + i;
                  } else {
                    pageNum = meta.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`stitch-pageButton ${pageNum === meta.page ? 'is-active' : ''}`}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="stitch-pageButton"
                  onClick={() => onPageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  aria-label="Página siguiente"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
