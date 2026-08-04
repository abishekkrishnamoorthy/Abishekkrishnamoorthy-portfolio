import "@mdxeditor/editor/style.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CreateLink,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  quotePlugin,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import {
  CalendarDays,
  Eye,
  FileImage,
  GripVertical,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/app/providers/ToastProvider";
import { FormField } from "@/components/form/FormField";
import { SaveButton } from "@/components/form/SaveButton";
import { SlugInput } from "@/components/form/SlugInput";
import { TagInput } from "@/components/form/TagInput";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CmsEditorModal, type CmsEditorTab } from "@/components/ui/CmsEditorModal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { projectCategories, projectSchema, projectStatuses, type ProjectFormValues } from "@/features/projects/projects.schema";
import { useCreateProject, useProjects, useUpdateProject, useUploadMedia } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";
import { createClientId } from "@/lib/utils/createClientId";
import { toDateInputValue } from "@/lib/utils/formatDate";

type ProjectTab = "details" | "readme" | "screenshots" | "case-study";
type GalleryItem = NonNullable<ProjectFormValues["gallery"]>[number];
type TechStackRow = ProjectFormValues["techStackTable"][number];
type GalleryDraft = GalleryItem & {
  clientId: string;
  file?: File;
  previewUrl: string;
};
type ThumbnailDraft = {
  file?: File;
  previewUrl: string;
};

const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxGalleryItems = 10;

const defaults: ProjectFormValues = {
  slug: "",
  orderIndex: 0,
  title: "",
  tagline: "",
  shortDescription: "",
  description: "",
  status: "completed",
  category: "Full Stack",
  thumbnailUrl: "",
  techTags: [],
  highlights: [],
  liveDemoUrl: "https://example.com",
  githubUrl: "https://github.com/example/repo",
  durationLabel: "",
  role: "",
  lastUpdatedAt: new Date().toISOString().slice(0, 10),
  techIcons: [],
  readmeMarkdown: "",
  projectStructure: "",
  techStackTable: [{ category: "Frontend", technologies: "" }],
  gallery: [],
  architectureNotes: "",
  challenges: [],
  solutions: [],
  learningOutcomes: [],
  isFeatured: false,
  publishStatus: "published",
};

function createGalleryClientId() {
  return createClientId("gallery");
}

function galleryDraftFromItem(item: GalleryItem): GalleryDraft {
  return {
    clientId: createGalleryClientId(),
    url: item.url,
    previewUrl: item.url,
    caption: item.caption ?? "",
    alt: item.alt ?? "",
    title: item.title ?? item.caption ?? "",
    description: item.description ?? "",
  };
}

function galleryValueFromDraft(item: GalleryDraft): GalleryItem {
  const title = item.title?.trim() ?? "";
  const caption = item.caption?.trim() || title || undefined;
  const alt = item.alt?.trim() || title || undefined;
  const description = item.description?.trim() || undefined;
  return {
    url: item.url,
    caption,
    alt,
    title: title || undefined,
    description,
  };
}

function validateImageFile(file: File) {
  if (!allowedImageTypes.has(file.type)) return "Images must be JPEG, PNG, or WEBP.";
  if (file.size > maxImageBytes) return "Images must be 5MB or smaller.";
  return null;
}

function uploadStatusLabel(isSaving: boolean, hasFile: boolean) {
  if (isSaving && hasFile) return "Uploading...";
  if (hasFile) return "Pending upload";
  return null;
}

function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<MDXEditorMethods | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getMarkdown() !== value) {
      editorRef.current.setMarkdown(value);
    }
  }, [value]);

  return (
    <div className="overflow-hidden rounded-md border border-border-subtle bg-surface">
      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        className="min-h-[520px] bg-surface sm:min-h-[650px]"
        contentEditableClassName="min-h-[460px] px-4 py-4 text-sm text-primary outline-none sm:min-h-[590px] sm:px-5"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          tablePlugin(),
          imagePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
          codeMirrorPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertCodeBlock />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}

function SortableGalleryCard({
  item,
  index,
  isSaving,
  onPickFile,
  onRemove,
  onChange,
}: {
  item: GalleryDraft;
  index: number;
  isSaving: boolean;
  onPickFile: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<GalleryDraft>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.clientId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };
  const status = uploadStatusLabel(isSaving, Boolean(item.file));

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border-subtle bg-surface shadow-elevation-1">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-surface-hover text-secondary"
            aria-label={`Reorder screenshot ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <div>
            <p className="text-sm font-medium text-primary">Screenshot {index + 1}</p>
            {status ? <p className="text-xs text-accent">{status}</p> : null}
          </div>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 size={14} /> Remove
        </Button>
      </div>
      <div className="grid gap-4 p-3 sm:p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-hover">
          {item.previewUrl ? (
            <img src={item.previewUrl} alt={item.title || `Screenshot ${index + 1} preview`} className="aspect-[16/10] w-full object-cover" />
          ) : (
            <div className="grid aspect-[16/10] place-items-center text-center">
              <div>
                <ImageIcon className="mx-auto mb-2 text-muted" size={22} />
                <p className="text-xs font-semibold text-primary">Screenshot {index + 1}</p>
                <p className="mt-1 text-xs text-muted">No image selected</p>
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Button className="w-full sm:w-auto" type="button" size="sm" variant="secondary" onClick={onPickFile}>
              <Upload size={14} /> {item.previewUrl ? "Replace image" : "Upload image"}
            </Button>
          </div>
          <FormField label="Title">
            <Input value={item.title ?? ""} onChange={(event) => onChange({ title: event.target.value })} placeholder="Dashboard Overview" />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={item.description ?? ""}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="What this screen shows and why it matters."
              className="min-h-24"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
  max,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
  placeholder: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-sm font-semibold text-primary">{label}</p>
      </div>
      <div className="grid gap-3 p-4">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-start">
            <Input value={item} onChange={(event) => onChange(items.map((entry, itemIndex) => (itemIndex === index ? event.target.value : entry)))} placeholder={placeholder} />
            <Button className="w-full md:w-auto" type="button" size="sm" variant="secondary" disabled={index === 0} onClick={() => onChange(arrayMove(items, index, index - 1))}>Up</Button>
            <Button className="w-full md:w-auto" type="button" size="sm" variant="secondary" disabled={index === items.length - 1} onClick={() => onChange(arrayMove(items, index, index + 1))}>Down</Button>
            <Button className="w-full md:w-auto" type="button" size="sm" variant="ghost" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="secondary" disabled={items.length >= max} onClick={() => onChange([...items, ""])}>
          <Plus size={14} /> Add item
        </Button>
      </div>
    </div>
  );
}

function TechStackTableEditor({
  rows,
  onChange,
}: {
  rows: TechStackRow[];
  onChange: (rows: TechStackRow[]) => void;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-sm font-semibold text-primary">Tech Stack Table</p>
      </div>
      <div className="grid gap-3 p-4">
        {rows.map((row, index) => (
          <div key={`tech-stack-${index}`} className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
            <Input
              value={row.category}
              onChange={(event) => onChange(rows.map((item, rowIndex) => (rowIndex === index ? { ...item, category: event.target.value } : item)))}
              placeholder="Frontend"
            />
            <Input
              value={row.technologies}
              onChange={(event) => onChange(rows.map((item, rowIndex) => (rowIndex === index ? { ...item, technologies: event.target.value } : item)))}
              placeholder="Next.js, Tailwind CSS"
            />
            <Button type="button" size="sm" variant="ghost" disabled={rows.length === 1} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="secondary" disabled={rows.length >= 8} onClick={() => onChange([...rows, { category: "", technologies: "" }])}>
          <Plus size={14} /> Add row
        </Button>
      </div>
    </div>
  );
}

export default function ProjectEditorPage() {
  const { slug } = useParams();
  const isNew = !slug;
  const navigate = useNavigate();
  const toast = useToast();
  const projects = useProjects();
  const create = useCreateProject();
  const update = useUpdateProject();
  const uploadMedia = useUploadMedia();
  const saveWorkflow = useSaveWorkflow(isNew ? "Project created successfully" : "Project updated successfully");
  const [activeTab, setActiveTab] = useState<ProjectTab>("details");
  const [thumbnailDraft, setThumbnailDraft] = useState<ThumbnailDraft>({ previewUrl: "" });
  const [galleryDrafts, setGalleryDrafts] = useState<GalleryDraft[]>([]);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const addGalleryInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const current = useMemo(() => projects.data?.find((item) => item.slug === slug), [projects.data, slug]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  const publishStatus = form.watch("publishStatus");
  const galleryError = form.formState.errors.gallery?.message;

  useEffect(() => {
    if (isNew) {
      form.reset(defaults);
      setThumbnailDraft({ previewUrl: "" });
      setGalleryDrafts([]);
      return;
    }
    if (current) {
      const nextValues = { ...defaults, ...current, lastUpdatedAt: toDateInputValue(current.lastUpdatedAt) || defaults.lastUpdatedAt };
      form.reset(nextValues);
      setThumbnailDraft({ previewUrl: current.thumbnailUrl });
      setGalleryDrafts((current.gallery ?? []).map(galleryDraftFromItem));
    }
  }, [current, form, isNew]);

  function closeModal() {
    navigate("/projects");
  }

  function syncGallery(nextGallery: GalleryDraft[]) {
    setGalleryDrafts(nextGallery);
    form.setValue("gallery", nextGallery.map(galleryValueFromDraft), { shouldDirty: true, shouldValidate: true });
  }

  function handleThumbnailSelection(file: File | undefined) {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setThumbnailDraft({ file, previewUrl });
    form.setValue("thumbnailUrl", previewUrl, { shouldDirty: true, shouldValidate: true });
  }

  function handleAddScreenshot(file: File | undefined) {
    if (!file) return;
    if (galleryDrafts.length >= maxGalleryItems) {
      toast.error("A project can have up to 10 screenshots.");
      return;
    }
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    const nextItem: GalleryDraft = {
      clientId: createGalleryClientId(),
      file,
      previewUrl: URL.createObjectURL(file),
      title: "",
      description: "",
      caption: "",
      alt: "",
      url: "",
    };
    nextItem.url = nextItem.previewUrl;
    syncGallery([...galleryDrafts, nextItem]);
  }

  function handleReplaceScreenshot(clientId: string, file: File | undefined) {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    syncGallery(
      galleryDrafts.map((item) => (
        item.clientId === clientId
          ? { ...item, file, previewUrl, url: item.url || previewUrl }
          : item
      )),
    );
  }

  async function uploadImageAsset(file: File, folder: string) {
    const asset = await uploadMedia.mutateAsync({ file, folder });
    return asset.secureUrl || asset.url;
  }

  async function resolveThumbnailUrl(values: ProjectFormValues) {
    if (!thumbnailDraft.file) return thumbnailDraft.previewUrl || values.thumbnailUrl;
    return uploadImageAsset(thumbnailDraft.file, "portfolio/projects/thumbnails");
  }

  async function resolveGalleryValues(projectTitle: string) {
    const nextItems: GalleryDraft[] = [];
    for (const item of galleryDrafts) {
      const uploadedUrl = item.file ? await uploadImageAsset(item.file, "portfolio/projects/gallery") : item.url;
      nextItems.push({ ...item, url: uploadedUrl, previewUrl: uploadedUrl, file: undefined });
    }
    setGalleryDrafts(nextItems);
    return nextItems.map((item) => {
      const title = item.title?.trim() || undefined;
      return {
        url: item.url,
        title,
        description: item.description?.trim() || undefined,
        caption: item.caption?.trim() || title,
        alt: item.alt?.trim() || title || `${projectTitle} screenshot`,
      };
    });
  }

  async function submitValues(values: ProjectFormValues) {
    const thumbnailUrl = await resolveThumbnailUrl(values);
    const gallery = await resolveGalleryValues(values.title.trim());
    const payload: ProjectFormValues = {
      ...values,
      thumbnailUrl,
      gallery,
      techStackTable: values.techStackTable.map((row) => ({ category: row.category.trim(), technologies: row.technologies.trim() })),
      challenges: values.challenges.map((item) => item.trim()).filter(Boolean),
      solutions: values.solutions.map((item) => item.trim()).filter(Boolean),
      learningOutcomes: values.learningOutcomes.map((item) => item.trim()).filter(Boolean),
    };

    form.setValue("thumbnailUrl", thumbnailUrl, { shouldDirty: true, shouldValidate: true });
    form.setValue("gallery", gallery, { shouldDirty: true, shouldValidate: true });
    setThumbnailDraft({ previewUrl: thumbnailUrl });

    if (isNew) {
      await create.mutateAsync(payload);
    } else {
      await update.mutateAsync({ slug: slug!, body: payload });
    }
    return true;
  }

  const submit = form.handleSubmit(async (values) => {
    const didSave = await saveWorkflow.save(() => submitValues(values));
    if (didSave) closeModal();
  }, (errors) => {
    if (errors.gallery) setActiveTab("screenshots");
    else if (errors.readmeMarkdown || errors.projectStructure || errors.techStackTable) setActiveTab("readme");
    else if (errors.architectureNotes || errors.challenges || errors.solutions || errors.learningOutcomes) setActiveTab("case-study");
    else setActiveTab("details");
    saveWorkflow.validationFailed(errors);
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = galleryDrafts.findIndex((item) => item.clientId === active.id);
    const newIndex = galleryDrafts.findIndex((item) => item.clientId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    syncGallery(arrayMove(galleryDrafts, oldIndex, newIndex));
  }

  const isLoadingExistingProject = !isNew && projects.isLoading;
  const isMissingProject = !isNew && !projects.isLoading && !current;
  const editorTabs: Array<CmsEditorTab<ProjectTab>> = [
    { value: "details", label: "Project Details", icon: Sparkles },
    { value: "readme", label: "README", icon: Link2 },
    { value: "screenshots", label: "Screenshots", icon: FileImage },
    { value: "case-study", label: "Case Study", icon: Eye },
  ];

  return (
    <CmsEditorModal
      open
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
      title={isNew ? "New Project" : current?.title ?? "Edit Project"}
      description={isNew ? "Create a new project and organize it around the public site structure." : "Update project content without leaving the Projects list."}
      status={
        <>
          <Badge>{isNew ? "Create" : "Edit"}</Badge>
          <Badge tone={publishStatus === "published" ? "success" : "warning"}>{publishStatus === "published" ? "Published" : "Draft"}</Badge>
          {galleryDrafts.length ? <Badge tone="neutral">{galleryDrafts.length} screenshots</Badge> : null}
        </>
      }
      tabs={editorTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      footer={
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="hidden text-sm text-secondary md:block">
            {saveWorkflow.isSaving ? "Uploading media and saving project..." : "Closing returns to the Projects list. Drafts keep fewer than 3 screenshots; published projects need 3-10."}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-end">
            <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
              <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
              <SaveButton
                form="project-editor-form"
                variant="secondary"
                isSaving={saveWorkflow.isSaving}
                label="Publish"
                onClick={() => form.setValue("publishStatus", "published", { shouldDirty: true, shouldValidate: false })}
              />
            </div>
            <SaveButton
              className="w-full md:w-auto"
              form="project-editor-form"
              isSaving={saveWorkflow.isSaving}
              label="Save Draft"
              onClick={() => form.setValue("publishStatus", "draft", { shouldDirty: true, shouldValidate: false })}
            />
          </div>
        </div>
      }
    >
      {isLoadingExistingProject ? (
        <div className="flex min-h-[360px] items-center justify-center text-sm text-secondary">
          <Loader2 size={18} className="mr-2 animate-spin" /> Loading project…
        </div>
      ) : isMissingProject ? (
        <div className="grid gap-4 p-6">
          <p className="text-sm text-secondary">We could not find that project. It may have been deleted or renamed.</p>
          <div><Button type="button" onClick={closeModal}>Back to Projects</Button></div>
        </div>
      ) : (
        <form id="project-editor-form" onSubmit={submit} className="grid gap-5 sm:gap-8">
            {activeTab === "details" ? (
              <div className="grid gap-5 sm:gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="grid gap-5 sm:gap-6">
                  <Card>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FormField label="Title" error={form.formState.errors.title?.message}>
                        <Input {...form.register("title")} />
                      </FormField>
                      <FormField label="Slug" error={form.formState.errors.slug?.message}>
                        <SlugInput value={form.watch("slug")} source={form.watch("title")} onChange={(value) => form.setValue("slug", value, { shouldDirty: true, shouldValidate: true })} />
                      </FormField>
                      <FormField label="Tagline" error={form.formState.errors.tagline?.message}>
                        <Input {...form.register("tagline")} />
                      </FormField>
                      <FormField label="Short Description" error={form.formState.errors.shortDescription?.message}>
                        <Textarea {...form.register("shortDescription")} className="min-h-24" />
                      </FormField>
                      <div className="md:col-span-2">
                        <FormField label="Description" error={form.formState.errors.description?.message}>
                          <Textarea {...form.register("description")} className="min-h-28" />
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FormField label="Category" error={form.formState.errors.category?.message}>
                        <Select {...form.register("category")}>{projectCategories.map((item) => <option key={item}>{item}</option>)}</Select>
                      </FormField>
                      <FormField label="Project Status" error={form.formState.errors.status?.message}>
                        <Select {...form.register("status")}>{projectStatuses.map((item) => <option key={item}>{item}</option>)}</Select>
                      </FormField>
                      <FormField label="Publish Status" error={form.formState.errors.publishStatus?.message}>
                        <Select {...form.register("publishStatus")}><option value="draft">draft</option><option value="published">published</option></Select>
                      </FormField>
                      <FormField label="Display Order" error={form.formState.errors.orderIndex?.message}>
                        <Input type="number" min={0} {...form.register("orderIndex", { valueAsNumber: true })} />
                      </FormField>
                      <FormField label="Live Demo URL" error={form.formState.errors.liveDemoUrl?.message}>
                        <Input {...form.register("liveDemoUrl")} />
                      </FormField>
                      <FormField label="GitHub URL" error={form.formState.errors.githubUrl?.message}>
                        <Input {...form.register("githubUrl")} />
                      </FormField>
                      <FormField label="Duration" error={form.formState.errors.durationLabel?.message}>
                        <Input {...form.register("durationLabel")} />
                      </FormField>
                      <FormField label="Role" error={form.formState.errors.role?.message}>
                        <Input {...form.register("role")} />
                      </FormField>
                      <FormField label="Last Updated" error={form.formState.errors.lastUpdatedAt?.message}>
                        <Input type="date" {...form.register("lastUpdatedAt")} />
                      </FormField>
                      <label className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-hover px-3 py-3 text-sm font-medium text-primary">
                        <input type="checkbox" className="h-4 w-4 accent-[var(--color-accent)]" {...form.register("isFeatured")} />
                        Feature this project
                      </label>
                    </CardContent>
                  </Card>

                  <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                    <Card>
                      <CardContent className="grid gap-4">
                        <FormField label="Tech Tags" error={form.formState.errors.techTags?.message as string | undefined}>
                          <TagInput value={form.watch("techTags")} onChange={(value) => form.setValue("techTags", value, { shouldDirty: true, shouldValidate: true })} />
                        </FormField>
                        <FormField label="Highlights" error={form.formState.errors.highlights?.message as string | undefined}>
                          <TagInput value={form.watch("highlights")} onChange={(value) => form.setValue("highlights", value, { shouldDirty: true, shouldValidate: true })} max={4} />
                        </FormField>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="grid gap-4">
                        <FormField label="Tech Icons" error={form.formState.errors.techIcons?.message as string | undefined} hint="Short labels used in the quick stats strip.">
                          <TagInput value={form.watch("techIcons")} onChange={(value) => form.setValue("techIcons", value, { shouldDirty: true, shouldValidate: true })} max={5} />
                        </FormField>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid gap-5 sm:gap-6">
                  <Card>
                    <CardContent className="grid gap-4">
                      <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-hover">
                        {thumbnailDraft.previewUrl ? (
                          <img src={thumbnailDraft.previewUrl} alt="Project thumbnail preview" className="aspect-[16/10] w-full object-cover" />
                        ) : (
                          <div className="grid aspect-[16/10] place-items-center text-center">
                            <div>
                              <ImageIcon className="mx-auto mb-2 text-muted" size={22} />
                              <p className="text-xs font-semibold text-primary">Project Thumbnail</p>
                              <p className="mt-1 text-xs text-muted">No image selected</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input ref={thumbnailInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { handleThumbnailSelection(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                      <div className="flex flex-wrap gap-2">
                        <Button className="flex-1 sm:flex-none" type="button" size="sm" variant="secondary" onClick={() => thumbnailInputRef.current?.click()}>
                          <Upload size={14} /> {thumbnailDraft.previewUrl ? "Replace thumbnail" : "Upload thumbnail"}
                        </Button>
                        <Button className="flex-1 sm:flex-none" type="button" size="sm" variant="ghost" disabled={!thumbnailDraft.previewUrl && !form.watch("thumbnailUrl")} onClick={() => { setThumbnailDraft({ previewUrl: "" }); form.setValue("thumbnailUrl", "", { shouldDirty: true, shouldValidate: true }); }}>
                          <X size={14} /> Remove
                        </Button>
                      </div>
                      <p className="text-xs text-muted">Thumbnail uploads on save through the CMS media pipeline. JPEG, PNG, or WEBP up to 5MB.</p>
                      {thumbnailDraft.file ? <Badge tone="warning">Pending upload</Badge> : null}
                      {form.formState.errors.thumbnailUrl?.message ? <p className="text-xs text-danger">{form.formState.errors.thumbnailUrl.message}</p> : null}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}

            {activeTab === "readme" ? (
              <div className="grid gap-5">
                <Card>
                  <CardContent className="grid gap-4">
                    <div>
                      <p className="mb-2 text-sm font-semibold text-primary">README Markdown</p>
                      <MarkdownEditor value={form.watch("readmeMarkdown")} onChange={(value) => form.setValue("readmeMarkdown", value, { shouldDirty: true, shouldValidate: true })} />
                      {form.formState.errors.readmeMarkdown?.message ? <p className="mt-2 text-xs text-danger">{form.formState.errors.readmeMarkdown.message}</p> : null}
                    </div>
                  </CardContent>
                </Card>

                <TechStackTableEditor rows={form.watch("techStackTable")} onChange={(rows) => form.setValue("techStackTable", rows, { shouldDirty: true, shouldValidate: true })} />

                <Card>
                  <CardContent className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-secondary" />
                      <p className="text-sm font-semibold text-primary">Project Structure</p>
                    </div>
                    <Textarea
                      {...form.register("projectStructure")}
                      className="min-h-[340px] font-mono text-xs sm:min-h-[420px]"
                      placeholder="apps/web
src/components
src/features"
                    />
                    {form.formState.errors.projectStructure?.message ? <p className="text-xs text-danger">{form.formState.errors.projectStructure.message}</p> : null}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {activeTab === "screenshots" ? (
              <div className="grid gap-5">
                <Card>
                  <CardContent className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">Screenshot Manager</p>
                        <p className="text-sm text-secondary">Add up to 10 screenshots. Published projects need at least 3. Reorder the strip to control the public gallery sequence.</p>
                      </div>
                      <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={galleryDrafts.length >= maxGalleryItems} onClick={() => addGalleryInputRef.current?.click()}>
                        <Plus size={16} /> Add screenshot
                      </Button>
                      <input
                        ref={addGalleryInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => { handleAddScreenshot(event.target.files?.[0]); event.currentTarget.value = ""; }}
                      />
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={galleryDrafts.map((item) => item.clientId)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4">
                          {galleryDrafts.map((item, index) => (
                            <div key={item.clientId}>
                              <input
                                ref={(node) => { galleryInputRefs.current[item.clientId] = node; }}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) => { handleReplaceScreenshot(item.clientId, event.target.files?.[0]); event.currentTarget.value = ""; }}
                              />
                              <SortableGalleryCard
                                item={item}
                                index={index}
                                isSaving={saveWorkflow.isSaving}
                                onPickFile={() => galleryInputRefs.current[item.clientId]?.click()}
                                onRemove={() => syncGallery(galleryDrafts.filter((draft) => draft.clientId !== item.clientId))}
                                onChange={(patch) => syncGallery(galleryDrafts.map((draft) => (draft.clientId === item.clientId ? { ...draft, ...patch } : draft)))}
                              />
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {!galleryDrafts.length ? (
                      <div className="grid place-items-center rounded-lg border border-dashed border-border-subtle bg-surface-hover px-6 py-10 text-center">
                        <div>
                          <ImageIcon className="mx-auto mb-3 text-muted" size={24} />
                          <p className="text-sm font-medium text-primary">No screenshots yet</p>
                          <p className="mt-1 text-sm text-secondary">Add screenshots here and they will upload when you save the project.</p>
                        </div>
                      </div>
                    ) : null}

                    {galleryError ? <p className="text-xs text-danger">{galleryError}</p> : null}
                    <p className="text-xs text-muted">Accepted formats: JPEG, PNG, WEBP. Maximum file size: 5MB each.</p>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {activeTab === "case-study" ? (
              <div className="grid gap-5">
                <Card>
                  <CardContent className="grid gap-3">
                    <p className="text-sm font-semibold text-primary">Architecture Notes</p>
                    <Textarea
                      {...form.register("architectureNotes")}
                      className="min-h-[340px] sm:min-h-[420px]"
                      placeholder="Describe the architecture, tradeoffs, and reasoning behind the implementation."
                    />
                    {form.formState.errors.architectureNotes?.message ? <p className="text-xs text-danger">{form.formState.errors.architectureNotes.message}</p> : null}
                  </CardContent>
                </Card>

                <div className="grid gap-5 xl:grid-cols-3">
                  <StringListEditor
                    label="Challenges"
                    items={form.watch("challenges")}
                    onChange={(items) => form.setValue("challenges", items, { shouldDirty: true, shouldValidate: true })}
                    max={6}
                    placeholder="High-traffic deployment rollout"
                  />
                  <StringListEditor
                    label="Solutions"
                    items={form.watch("solutions")}
                    onChange={(items) => form.setValue("solutions", items, { shouldDirty: true, shouldValidate: true })}
                    max={6}
                    placeholder="Added queue-backed processing"
                  />
                  <StringListEditor
                    label="Learning Outcomes"
                    items={form.watch("learningOutcomes")}
                    onChange={(items) => form.setValue("learningOutcomes", items, { shouldDirty: true, shouldValidate: true })}
                    max={6}
                    placeholder="Improved observability and incident response"
                  />
                </div>
              </div>
            ) : null}
        </form>
      )}
    </CmsEditorModal>
  );
}
