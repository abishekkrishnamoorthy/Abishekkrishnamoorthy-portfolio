import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/table/DataTable";
import { TagInput } from "@/components/form/TagInput";
import { SaveButton } from "@/components/form/SaveButton";
import { useConfirm } from "@/hooks/useConfirm";
import { useCreateExperience, useDeleteExperience, useExperience, useUpdateExperience } from "@/features/shared/hooks";
import { experienceSchema, type ExperienceFormValues } from "@/features/experience/experience.schema";
import type { Experience } from "@/types/admin.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

const empty: ExperienceFormValues = { role: "", company: "", location: "", startDate: new Date().toISOString().slice(0, 10), endDate: null, description: "", techTags: [], orderIndex: 0, publishStatus: "draft" };

export default function ExperiencePage() {
  const query = useExperience();
  const create = useCreateExperience();
  const update = useUpdateExperience();
  const remove = useDeleteExperience();
  const confirm = useConfirm();
  const saveWorkflow = useSaveWorkflow();
  const statusWorkflow = useSaveWorkflow();
  const [draft, setDraft] = useState(empty);
  const addExperience = async () => {
    const result = experienceSchema.safeParse(draft);
    if (!result.success) return saveWorkflow.validationError(`Please fix the highlighted fields: ${result.error.issues[0]?.message ?? "Invalid experience"}`);
    const saved = await saveWorkflow.save(() => create.mutateAsync(result.data));
    if (saved) setDraft(empty);
  };
  return (
    <div className="grid gap-5">
      <Card><CardContent className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
        <Input placeholder="Company" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
        <Input placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
        <Input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
        <Textarea placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <TagInput value={draft.techTags} onChange={(techTags) => setDraft({ ...draft, techTags })} max={12} />
        <SaveButton type="button" isSaving={saveWorkflow.isSaving} label="Add Experience" onClick={() => void addExperience()} />
      </CardContent></Card>
      <DataTable<Experience>
        rows={query.data ?? []}
        columns={[
          { key: "role", header: "Role", primary: true, render: (row) => row.role },
          { key: "company", header: "Company", render: (row) => row.company },
          { key: "status", header: "Status", render: (row) => row.publishStatus },
        ]}
        actions={(row) => <div className="inline-flex gap-2"><Select disabled={statusWorkflow.isSaving} value={row.publishStatus} onChange={(e) => void statusWorkflow.save(() => update.mutateAsync({ id: row._id, body: { publishStatus: e.target.value } }))}><option>draft</option><option>published</option></Select><Button size="sm" variant="danger" onClick={async () => (await confirm({ title: `Delete ${row.role}?`, description: "This cannot be undone." })) && remove.mutate(row._id)}><Trash2 size={14} /></Button></div>}
      />
    </div>
  );
}
