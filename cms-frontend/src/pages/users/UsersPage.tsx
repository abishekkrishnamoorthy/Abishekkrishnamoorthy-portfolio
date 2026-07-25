import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/table/DataTable";
import { SaveButton } from "@/components/form/SaveButton";
import { useCreateUser, useUpdateUser, useUsers } from "@/features/shared/hooks";
import { createUserSchema } from "@/features/users/users.schema";
import type { CmsUser } from "@/types/admin.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

type RoleName = "SUPER_ADMIN" | "EDITOR" | "VIEWER";

export default function UsersPage() {
  const query = useUsers();
  const create = useCreateUser();
  const update = useUpdateUser();
  const saveWorkflow = useSaveWorkflow();
  const updateWorkflow = useSaveWorkflow();
  const [draft, setDraft] = useState<{ name: string; email: string; password: string; roleName: RoleName }>({ name: "", email: "", password: "", roleName: "VIEWER" });
  const createUser = async () => {
    const result = createUserSchema.safeParse(draft);
    if (!result.success) return saveWorkflow.validationError(`Please fix the highlighted fields: ${result.error.issues[0]?.message ?? "Invalid user"}`);
    const saved = await saveWorkflow.save(() => create.mutateAsync(result.data));
    if (saved) setDraft({ name: "", email: "", password: "", roleName: "VIEWER" });
  };
  return (
    <div className="grid gap-5">
      <Card><CardContent className="grid gap-3 md:grid-cols-4">
        <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        <Input placeholder="Password" type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
        <Select value={draft.roleName} onChange={(e) => setDraft({ ...draft, roleName: e.target.value as RoleName })}><option>SUPER_ADMIN</option><option>EDITOR</option><option>VIEWER</option></Select>
        <SaveButton type="button" isSaving={saveWorkflow.isSaving} label="Create User" onClick={() => void createUser()} />
      </CardContent></Card>
      <DataTable<CmsUser> rows={query.data ?? []} columns={[{ key: "name", header: "Name", primary: true, render: (row) => row.name }, { key: "email", header: "Email", render: (row) => row.email }, { key: "role", header: "Role", render: (row) => row.roleId?.name ?? "Unknown" }, { key: "active", header: "Active", render: (row) => String(row.active) }]} actions={(row) => <Button disabled={updateWorkflow.isSaving} size="sm" variant="secondary" onClick={() => void updateWorkflow.save(() => update.mutateAsync({ id: row._id, body: { active: !row.active } }))}>{row.active ? "Deactivate" : "Activate"}</Button>} />
    </div>
  );
}
