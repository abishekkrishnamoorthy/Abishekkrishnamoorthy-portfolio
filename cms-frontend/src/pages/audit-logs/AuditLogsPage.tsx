import { DataTable } from "@/components/table/DataTable";
import { useAuditLogs } from "@/features/shared/hooks";
import { formatDate } from "@/lib/utils/formatDate";
import type { AuditLog } from "@/types/admin.types";

export default function AuditLogsPage() {
  const query = useAuditLogs();
  return <DataTable<AuditLog> rows={query.data ?? []} columns={[{ key: "action", header: "Action", primary: true, render: (row) => row.action }, { key: "collection", header: "Collection", render: (row) => row.collection }, { key: "document", header: "Document", render: (row) => row.documentId ?? "N/A" }, { key: "time", header: "Time", render: (row) => formatDate(row.createdAt) }]} />;
}
