import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/table/DataTable";
import { useMeetingRequests, useUpdateMeetingStatus } from "@/features/shared/hooks";
import type { MeetingRequest } from "@/types/contact.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

export default function MeetingRequestsPage() {
  const query = useMeetingRequests();
  const update = useUpdateMeetingStatus();
  const saveWorkflow = useSaveWorkflow();
  return (
    <DataTable<MeetingRequest>
      rows={query.data ?? []}
      emptyTitle={query.isLoading ? "Loading meeting requests..." : "No meeting requests yet"}
      columns={[
        { key: "name", header: "Name", primary: true, render: (row) => row.fullName },
        { key: "type", header: "Type", render: (row) => row.meetingType },
        { key: "date", header: "Date", render: (row) => `${row.preferredDate} ${row.preferredTime}` },
        { key: "status", header: "Status", render: (row) => row.status },
      ]}
      actions={(row) => <Select disabled={saveWorkflow.isSaving} value={row.status} onChange={(e) => void saveWorkflow.save(() => update.mutateAsync({ id: row._id, status: e.target.value }))}><option>received</option><option>reviewed</option><option>scheduled</option><option>declined</option></Select>}
    />
  );
}
