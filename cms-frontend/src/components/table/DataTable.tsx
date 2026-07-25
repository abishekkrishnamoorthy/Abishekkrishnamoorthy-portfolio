import type { ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EmptyState } from "@/components/feedback/EmptyState";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  primary?: boolean;
};

export function DataTable<T extends { id?: string; _id?: string; slug?: string }>({
  rows,
  columns,
  actions,
  emptyTitle = "No records yet",
}: {
  rows: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
  emptyTitle?: string;
}) {
  const tableMode = useMediaQuery("(min-width: 768px)");
  if (!rows.length) return <EmptyState title={emptyTitle} />;

  if (!tableMode) {
    return (
      <div className="grid gap-4">
        {rows.map((row) => {
          const key = row.id ?? row._id ?? row.slug ?? JSON.stringify(row);
          const primary = columns.find((column) => column.primary) ?? columns[0];
          return (
            <article key={key} className="rounded-xl border border-border-subtle bg-surface p-4 shadow-elevation-1">
              <div className="grid gap-4">
                <h3 className="min-w-0 font-semibold">{primary.render(row)}</h3>
                {actions ? <div className="flex flex-wrap gap-2">{actions(row)}</div> : null}
              </div>
              <dl className="mt-4 grid gap-2 border-t border-border-subtle pt-3 text-sm">
                {columns.filter((column) => column.key !== primary.key).map((column) => (
                  <div key={column.key} className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{column.header}</dt>
                    <dd className="text-right text-secondary">{column.render(row)}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-hover text-xs uppercase text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.header}
              </th>
            ))}
            {actions ? <th className="px-4 py-3 text-right font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rows.map((row) => {
            const key = row.id ?? row._id ?? row.slug ?? JSON.stringify(row);
            return (
              <tr key={key} className="hover:bg-surface-hover">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle">
                    {column.render(row)}
                  </td>
                ))}
                {actions ? <td className="px-4 py-3 text-right">{actions(row)}</td> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
