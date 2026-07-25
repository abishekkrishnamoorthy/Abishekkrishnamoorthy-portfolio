import { DataTable } from "@/components/table/DataTable";
import { useRoles } from "@/features/shared/hooks";
import type { Role } from "@/types/admin.types";

export default function RolesPage() {
  const query = useRoles();
  return <DataTable<Role> rows={query.data ?? []} columns={[{ key: "name", header: "Role", primary: true, render: (row) => row.name }, { key: "permissions", header: "Permissions", render: (row) => `${row.permissions.length} modules` }]} />;
}
