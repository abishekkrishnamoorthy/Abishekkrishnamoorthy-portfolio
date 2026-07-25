import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/table/DataTable";
import { useMessages, useUpdateMessageStatus } from "@/features/shared/hooks";
import type { ContactMessage } from "@/types/contact.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

export default function MessagesPage() {
  const query = useMessages();
  const update = useUpdateMessageStatus();
  const saveWorkflow = useSaveWorkflow();
  return (
    <DataTable<ContactMessage>
      rows={query.data ?? []}
      emptyTitle={query.isLoading ? "Loading messages..." : "No messages yet"}
      columns={[
        { key: "subject", header: "Subject", primary: true, render: (row) => row.subject },
        { key: "name", header: "Name", render: (row) => row.name },
        { key: "email", header: "Email", render: (row) => row.email },
        { key: "status", header: "Status", render: (row) => row.status },
      ]}
      actions={(row) => <Select disabled={saveWorkflow.isSaving} value={row.status} onChange={(e) => void saveWorkflow.save(() => update.mutateAsync({ id: row._id, status: e.target.value }))}><option>received</option><option>read</option><option>archived</option></Select>}
    />
  );
}
