import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlobalSeoForm } from "@/features/seo/components/GlobalSeoForm";
import { PageSeoFormDialog } from "@/features/seo/components/PageSeoFormDialog";
import { SeoOverrideTable } from "@/features/seo/components/SeoOverrideTable";
import { useCreateSeo, useDeleteSeo, useGlobalSeo, useSeo, useUpdateSeo } from "@/features/shared/hooks";
import { useConfirm } from "@/hooks/useConfirm";
import type { SeoFormValues } from "@/features/seo/seo.schema";
import type { SeoOverride } from "@/types/admin.types";

type Tab = "global" | "pages";

export default function SeoPage() {
  const [tab, setTab] = useState<Tab>("global");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SeoOverride | null>(null);
  const seoQuery = useSeo();
  const globalQuery = useGlobalSeo();
  const create = useCreateSeo();
  const update = useUpdateSeo();
  const remove = useDeleteSeo();
  const confirm = useConfirm();

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(override: SeoOverride) {
    setEditing(override);
    setDialogOpen(true);
  }

  async function savePageSeo(values: SeoFormValues) {
    if (editing?._id) return update.mutateAsync({ id: editing._id, body: values });
    return create.mutateAsync(values);
  }

  async function deleteOverride(override: SeoOverride) {
    const ok = await confirm({ title: `Delete ${override.pagePath}?`, description: "This cannot be undone." });
    if (ok) remove.mutate(override._id);
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={tab === "global" ? "primary" : "secondary"} onClick={() => setTab("global")}>Global</Button>
        <Button type="button" variant={tab === "pages" ? "primary" : "secondary"} onClick={() => setTab("pages")}>Pages</Button>
      </div>
      {tab === "global" ? (
        <GlobalSeoForm />
      ) : (
        <SeoOverrideTable rows={seoQuery.data ?? []} globalSeo={globalQuery.data} onCreate={openCreate} onEdit={openEdit} onDelete={(row) => void deleteOverride(row)} />
      )}
      <PageSeoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        override={editing}
        globalSeo={globalQuery.data}
        overrides={seoQuery.data ?? []}
        onSave={savePageSeo}
      />
    </div>
  );
}
