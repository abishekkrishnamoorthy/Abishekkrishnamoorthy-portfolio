import { Link, Outlet } from "react-router-dom";
import { Edit, Image as ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormSection } from "@/components/form/FormSection";
import { FormField } from "@/components/form/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { DataTable } from "@/components/table/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useDeleteProject, useProjects, useProjectsHeader, usePublishProject, useUpdateProjectsHeader, useUploadProjectsHeaderImage } from "@/features/shared/hooks";
import type { Project, ProjectHeader, ProjectHeaderShowcaseImage } from "@/types/project.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

const maxShowcaseImageBytes = 5 * 1024 * 1024;
const allowedShowcaseImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const defaultHeaderDraft: ProjectHeader = {
  badge: "My Work",
  title: "Projects that solve",
  highlightText: "real world problems.",
  description: "A focused catalog of full-stack, AI, cloud, frontend, backend, and learning projects.",
  showcaseImages: [
    { imageUrl: "", label: "Image Card 1", order: 1 },
    { imageUrl: "", label: "Image Card 2", order: 2 },
    { imageUrl: "", label: "Image Card 3", order: 3 },
    { imageUrl: "", label: "Image Card 4", order: 4 },
    { imageUrl: "", label: "Image Card 5", order: 5 },
  ],
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });
}

export default function ProjectsListPage() {
  const headerQuery = useProjectsHeader();
  const updateHeader = useUpdateProjectsHeader();
  const uploadImage = useUploadProjectsHeaderImage();
  const query = useProjects();
  const remove = useDeleteProject();
  const publish = usePublishProject();
  const confirm = useConfirm();
  const saveWorkflow = useSaveWorkflow();
  const toast = useToast();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [headerDraft, setHeaderDraft] = useState<ProjectHeader>(defaultHeaderDraft);
  const [isHeaderDirty, setIsHeaderDirty] = useState(false);

  useEffect(() => {
    if (!headerQuery.data || isHeaderDirty) return;
    setHeaderDraft({ ...headerQuery.data, showcaseImages: [...headerQuery.data.showcaseImages].sort((a, b) => a.order - b.order) });
  }, [headerQuery.data, isHeaderDirty]);

  function updateShowcaseSlot(order: ProjectHeaderShowcaseImage["order"], patch: Partial<ProjectHeaderShowcaseImage>) {
    setIsHeaderDirty(true);
    setHeaderDraft((draft) => ({
      ...draft,
      showcaseImages: draft.showcaseImages.map((slot) => (slot.order === order ? { ...slot, ...patch } : slot)),
    }));
  }

  async function uploadHeaderImage(order: ProjectHeaderShowcaseImage["order"], file: File | undefined) {
    if (!file) return;
    if (!allowedShowcaseImageTypes.has(file.type)) {
      toast.error("Showcase images must be JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > maxShowcaseImageBytes) {
      toast.error("Showcase images must be 5MB or smaller.");
      return;
    }
    try {
      const data = await readFileAsDataUrl(file);
      const uploaded = await uploadImage.mutateAsync({ fileName: file.name, mimeType: file.type, data });
      updateShowcaseSlot(order, { imageUrl: uploaded.imageUrl });
      toast.success("Image uploaded. Save Projects Header to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      if (fileInputRefs.current[order]) fileInputRefs.current[order]!.value = "";
    }
  }

  function saveProjectsHeader() {
    const payload = {
      badge: headerDraft.badge.trim(),
      title: headerDraft.title.trim(),
      highlightText: headerDraft.highlightText.trim(),
      description: headerDraft.description.trim(),
      showcaseImages: [...headerDraft.showcaseImages]
        .sort((a, b) => a.order - b.order)
        .map((slot) => ({ imageUrl: slot.imageUrl.trim(), label: slot.label.trim(), order: slot.order })),
    };
    if (payload.badge.length < 2 || payload.badge.length > 40) {
      saveWorkflow.validationError("Header Badge must be 2-40 characters.");
      return;
    }
    if (payload.title.length < 3 || payload.title.length > 70) {
      saveWorkflow.validationError("Title must be 3-70 characters.");
      return;
    }
    if (payload.highlightText.length < 3 || payload.highlightText.length > 70) {
      saveWorkflow.validationError("Highlighted Title must be 3-70 characters.");
      return;
    }
    if (payload.description.length < 20 || payload.description.length > 220) {
      saveWorkflow.validationError("Description must be 20-220 characters.");
      return;
    }
    if (payload.showcaseImages.some((slot) => slot.label.length > 40)) {
      saveWorkflow.validationError("Small Labels must be 40 characters or fewer.");
      return;
    }
    void saveWorkflow.save(async () => {
      const saved = await updateHeader.mutateAsync(payload);
      setHeaderDraft({ ...saved, showcaseImages: [...saved.showcaseImages].sort((a, b) => a.order - b.order) });
      setIsHeaderDirty(false);
      return saved;
    });
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-2xl font-semibold">Projects</h1><p className="text-sm text-secondary">Manage portfolio case studies.</p></div>
          <Link to="/projects/new"><Button><Plus size={18} /> New Project</Button></Link>
        </div>
        <FormSection title="Projects Header" description="Manage the text and five fixed showcase image slots. Layout, positioning, and card styling stay in the frontend.">
          <FormField label="Header Badge"><Input value={headerDraft.badge} onChange={(event) => { setIsHeaderDirty(true); setHeaderDraft((draft) => ({ ...draft, badge: event.target.value })); }} /></FormField>
          <FormField label="Title"><Input value={headerDraft.title} onChange={(event) => { setIsHeaderDirty(true); setHeaderDraft((draft) => ({ ...draft, title: event.target.value })); }} /></FormField>
          <FormField label="Highlighted Title"><Input value={headerDraft.highlightText} onChange={(event) => { setIsHeaderDirty(true); setHeaderDraft((draft) => ({ ...draft, highlightText: event.target.value })); }} /></FormField>
          <FormField label="Description"><Textarea value={headerDraft.description} onChange={(event) => { setIsHeaderDirty(true); setHeaderDraft((draft) => ({ ...draft, description: event.target.value })); }} /></FormField>
          {headerDraft.showcaseImages.map((slot) => (
            <div key={slot.order} className="rounded-lg border border-border-subtle bg-surface p-3">
              <p className="mb-3 text-sm font-semibold text-primary">Image Card {slot.order}{slot.order === 5 ? " (Optional)" : ""}</p>
              <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-hover">
                {slot.imageUrl ? (
                  <img src={slot.imageUrl} alt={`Card ${slot.order} preview`} className="aspect-[16/10] w-full object-cover" />
                ) : (
                  <div className="grid aspect-[16/10] place-items-center text-center">
                    <div>
                      <ImageIcon className="mx-auto mb-2 text-muted" size={22} />
                      <p className="text-xs font-semibold text-primary">Image Card {slot.order}</p>
                      <p className="mt-1 text-xs text-muted">No Image Uploaded</p>
                    </div>
                  </div>
                )}
              </div>
              <FormField label="Small Label">
                <Input value={slot.label} onChange={(event) => updateShowcaseSlot(slot.order, { label: event.target.value })} />
              </FormField>
              <input ref={(node) => { fileInputRefs.current[slot.order] = node; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void uploadHeaderImage(slot.order, event.target.files?.[0])} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" disabled={uploadImage.isPending} onClick={() => fileInputRefs.current[slot.order]?.click()}>
                  <Upload size={14} /> {slot.imageUrl ? "Replace Image" : "Upload Image"}
                </Button>
                <Button type="button" size="sm" variant="secondary" disabled={!slot.imageUrl || uploadImage.isPending} onClick={() => updateShowcaseSlot(slot.order, { imageUrl: "" })}>
                  <X size={14} /> Remove Image
                </Button>
              </div>
            </div>
          ))}
          <div className="md:col-span-2">
            <Button type="button" disabled={headerQuery.isLoading || uploadImage.isPending || saveWorkflow.isSaving} onClick={saveProjectsHeader}>
              Save Projects Header
            </Button>
            <p className="mt-2 text-xs text-muted">Images accept JPEG, PNG, or WEBP. Maximum 5MB each.</p>
          </div>
        </FormSection>
        <DataTable<Project>
          rows={query.data ?? []}
          emptyTitle={query.isLoading ? "Loading projects..." : "No projects yet"}
          columns={[
            { key: "title", header: "Title", primary: true, render: (row) => row.title },
            { key: "category", header: "Category", render: (row) => row.category },
            { key: "status", header: "Status", render: (row) => <Badge tone={row.publishStatus === "published" ? "success" : "warning"}>{row.publishStatus}</Badge> },
            { key: "updated", header: "Updated", render: (row) => row.lastUpdatedAt },
          ]}
          actions={(row) => (
            <div className="inline-flex flex-wrap justify-end gap-2">
              <Link to={`/projects/${row.slug}`}><Button size="sm" variant="secondary"><Edit size={14} /> Edit</Button></Link>
              <Button disabled={saveWorkflow.isSaving} size="sm" variant="secondary" onClick={() => void saveWorkflow.save(() => publish.mutateAsync({ slug: row.slug, publishStatus: row.publishStatus === "published" ? "draft" : "published" }))}>{row.publishStatus === "published" ? "Unpublish" : "Publish"}</Button>
              <Button size="sm" variant="danger" onClick={async () => (await confirm({ title: `Delete ${row.title}?`, description: "This cannot be undone." })) && remove.mutate(row.slug)}><Trash2 size={14} /></Button>
            </div>
          )}
        />
      </div>
      <Outlet />
    </>
  );
}
