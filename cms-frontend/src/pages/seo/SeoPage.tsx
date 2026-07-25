import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { DataTable } from "@/components/table/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { SaveButton } from "@/components/form/SaveButton";
import { useCreateSeo, useDeleteSeo, useSeo } from "@/features/shared/hooks";
import { seoSchema } from "@/features/seo/seo.schema";
import type { SeoOverride } from "@/types/admin.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

export default function SeoPage() {
  const query = useSeo();
  const create = useCreateSeo();
  const remove = useDeleteSeo();
  const confirm = useConfirm();
  const saveWorkflow = useSaveWorkflow();
  const [draft, setDraft] = useState({ pagePath: "/", metaTitle: "", metaDescription: "", ogImageUrl: "", canonicalUrl: "" });
  const createOverride = async () => {
    const result = seoSchema.safeParse(draft);
    if (!result.success) return saveWorkflow.validationError(`Please fix the highlighted fields: ${result.error.issues[0]?.message ?? "Invalid SEO override"}`);
    const saved = await saveWorkflow.save(() => create.mutateAsync(result.data));
    if (saved) setDraft({ pagePath: "/", metaTitle: "", metaDescription: "", ogImageUrl: "", canonicalUrl: "" });
  };
  return (
    <div className="grid gap-5">
      <Card><CardContent className="grid gap-3 md:grid-cols-2">
        <Input value={draft.pagePath} onChange={(e) => setDraft({ ...draft, pagePath: e.target.value })} />
        <Input placeholder="Meta title" value={draft.metaTitle} onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })} />
        <Textarea placeholder="Meta description" value={draft.metaDescription} onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })} />
        <SaveButton type="button" isSaving={saveWorkflow.isSaving} label="Create SEO Override" onClick={() => void createOverride()} />
      </CardContent></Card>
      <DataTable<SeoOverride> rows={query.data ?? []} columns={[{ key: "path", header: "Path", primary: true, render: (row) => row.pagePath }, { key: "title", header: "Title", render: (row) => row.metaTitle }]} actions={(row) => <Button size="sm" variant="danger" onClick={async () => (await confirm({ title: `Delete ${row.pagePath}?`, description: "This cannot be undone." })) && remove.mutate(row._id)}><Trash2 size={14} /></Button>} />
    </div>
  );
}
