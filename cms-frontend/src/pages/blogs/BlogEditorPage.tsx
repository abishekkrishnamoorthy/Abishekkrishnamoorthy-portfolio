import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock3, Eye, FileText, Image as ImageIcon, Loader2, Settings2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { BlogArticleBuilder } from "@/features/blog-article-builder/BlogArticleBuilder";
import { blogSchema, type BlogFormValues } from "@/features/blogs/blogs.schema";
import { useBlogs, useCreateBlog, useUpdateBlog, useUploadMedia } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";
import { toDateInputValue } from "@/lib/utils/formatDate";
import type { ArticleBlock } from "@/types/blog.types";

type BlogTab = "details" | "editor" | "preview";

const today = new Date().toISOString().slice(0, 10);
const maxMediaBytes = 25 * 1024 * 1024;
const allowedCoverTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const categories = ["Articles", "Projects", "Videos", "Resources", "AI", "AWS", "Backend", "Frontend", "React"];

const defaults: BlogFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  category: "Backend",
  publishedAt: today,
  updatedAt: today,
  author: "Abishek Krishnamoorthy",
  tags: [],
  coverImageUrl: undefined,
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: undefined,
  ogImageUrl: undefined,
  blocks: [],
  editorDocument: undefined,
  featured: false,
  publishStatus: "draft",
};

function validateCover(file: File) {
  if (!allowedCoverTypes.has(file.type)) return "Cover image must be JPEG, PNG, or WEBP.";
  if (file.size > 5 * 1024 * 1024) return "Cover image must be 5MB or smaller.";
  return null;
}

function ArticlePreview({ article }: { article: BlogFormValues }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-5">
      <div className="mx-auto max-w-[780px]">
        <Badge tone="info">{article.category}</Badge>
        <h2 className="mt-4 text-3xl font-bold text-primary">{article.title || "Untitled article"}</h2>
        <p className="mt-3 text-sm leading-7 text-secondary">{article.excerpt || "Article excerpt preview."}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} /> {article.publishedAt}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={15} /> Auto read time</span>
        </div>
        {article.coverImageUrl ? (
          <div className="mt-5 overflow-hidden rounded-lg border border-border-subtle bg-surface-hover">
            <img src={article.coverImageUrl} alt={`${article.title} cover preview`} className="aspect-[16/9] w-full object-cover" loading="lazy" />
          </div>
        ) : null}
        <div className="mt-7 rounded-lg border border-border-subtle bg-surface p-5"><ArticleRenderer blocks={article.blocks} /></div>
      </div>
    </div>
  );
}

export default function BlogEditorPage() {
  const { slug } = useParams();
  const isNew = !slug;
  const navigate = useNavigate();
  const toast = useToast();
  const blogs = useBlogs();
  const create = useCreateBlog();
  const update = useUpdateBlog();
  const uploadMedia = useUploadMedia();
  const saveWorkflow = useSaveWorkflow(isNew ? "Draft saved successfully" : "Article saved successfully");
  const current = useMemo(() => blogs.data?.find((item) => item.slug === slug), [blogs.data, slug]);
  const form = useForm<BlogFormValues>({ resolver: zodResolver(blogSchema), defaultValues: defaults });
  const [activeTab, setActiveTab] = useState<BlogTab>("details");
  const [coverDraft, setCoverDraft] = useState<{ file?: File; previewUrl?: string }>({});
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isNew) {
      form.reset(defaults);
      setCoverDraft({});
      return;
    }
    if (current) {
      const values = {
        ...defaults,
        ...current,
        publishedAt: toDateInputValue(current.publishedAt) || today,
        updatedAt: toDateInputValue(current.updatedAt) || today,
      };
      form.reset(values);
      setCoverDraft({ previewUrl: current.coverImageUrl });
    }
  }, [current, form, isNew]);

  function closeModal() {
    navigate("/blogs");
  }

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxMediaBytes) throw new Error("Media must be 25MB or smaller.");
    const asset = await uploadMedia.mutateAsync({ file, folder: "portfolio/blogs" });
    return asset.secureUrl || asset.url;
  }, [uploadMedia]);

  function handleCoverSelection(file: File | undefined) {
    if (!file) return;
    const error = validateCover(file);
    if (error) {
      toast.error(error);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setCoverDraft({ file, previewUrl });
  }

  function handleBlocksChange(blocks: ArticleBlock[]) {
    form.setValue("blocks", blocks, { shouldDirty: true, shouldValidate: true });
    form.setValue("editorDocument", undefined, { shouldDirty: true });
  }

  async function submitValues(values: BlogFormValues) {
    const coverImageUrl = coverDraft.file ? await uploadFile(coverDraft.file) : values.coverImageUrl;
    const payload: BlogFormValues = {
      ...values,
      coverImageUrl: coverImageUrl || undefined,
      ogImageUrl: values.ogImageUrl || coverImageUrl || undefined,
      seoTitle: values.seoTitle?.trim() || undefined,
      seoDescription: values.seoDescription?.trim() || undefined,
      canonicalUrl: values.canonicalUrl || undefined,
      editorDocument: undefined,
      blocks: values.blocks,
      updatedAt: today,
    };
    form.setValue("coverImageUrl", payload.coverImageUrl, { shouldDirty: true, shouldValidate: true });
    form.setValue("blocks", payload.blocks, { shouldDirty: true, shouldValidate: true });
    setCoverDraft({ previewUrl: payload.coverImageUrl });
    if (isNew) await create.mutateAsync(payload);
    else await update.mutateAsync({ slug: slug!, body: payload });
  }

  const submit = form.handleSubmit(async (values) => {
    const draftValues = { ...values, publishStatus: "draft" as const };
    form.setValue("publishStatus", "draft", { shouldDirty: true, shouldValidate: false });
    const saved = await saveWorkflow.save(() => submitValues(draftValues));
    if (saved) closeModal();
  }, (errors) => {
    if (errors.blocks || errors.editorDocument) setActiveTab("editor");
    else setActiveTab("details");
    saveWorkflow.validationFailed(errors);
  });

  const values = form.watch();
  const isLoadingExisting = !isNew && blogs.isLoading;
  const isMissing = !isNew && !blogs.isLoading && !current;
  const editorTabs: Array<CmsEditorTab<BlogTab>> = [
    { value: "details", label: "Post Details", icon: Settings2 },
    { value: "editor", label: "Editor", icon: FileText },
    { value: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <CmsEditorModal
      open
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
      title={isNew ? "New Blog" : current?.title ?? "Edit Blog"}
      description="Write privately, save a draft, then publish from the Blog List after review."
      status={
        <>
          <Badge tone="warning">Draft</Badge>
          {values.featured ? <Badge tone="info">Featured</Badge> : null}
          {uploadMedia.isPending ? <Badge tone="warning">Uploading media</Badge> : null}
        </>
      }
      headerActions={
        <SaveButton
          className="min-h-10 px-3 text-xs sm:min-h-11 sm:px-4 sm:text-sm"
          form="blog-editor-form"
          isSaving={saveWorkflow.isSaving || uploadMedia.isPending}
          label="Save Draft"
          onClick={() => form.setValue("publishStatus", "draft", { shouldDirty: true, shouldValidate: false })}
        />
      }
      tabs={editorTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {isLoadingExisting ? (
        <div className="flex min-h-[360px] items-center justify-center text-sm text-secondary"><Loader2 size={18} className="mr-2 animate-spin" /> Loading article...</div>
      ) : isMissing ? (
        <div className="grid gap-4 p-6"><p className="text-sm text-secondary">That article was not found.</p><div><Button type="button" onClick={closeModal}>Back to Blogs</Button></div></div>
      ) : (
        <form id="blog-editor-form" onSubmit={submit} className="grid gap-5 sm:gap-8">
            {activeTab === "details" ? (
              <div className="grid gap-5 sm:gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
                <div className="grid gap-5 sm:gap-6">
                  <Card><CardContent className="grid gap-4 md:grid-cols-2">
                    <FormField label="Title" error={form.formState.errors.title?.message}><Input {...form.register("title")} /></FormField>
                    <FormField label="Slug" error={form.formState.errors.slug?.message}><SlugInput value={form.watch("slug")} source={form.watch("title")} onChange={(value) => form.setValue("slug", value, { shouldDirty: true, shouldValidate: true })} /></FormField>
                    <div className="md:col-span-2"><FormField label="Short Description" error={form.formState.errors.excerpt?.message}><Textarea {...form.register("excerpt")} /></FormField></div>
                    <FormField label="Category" error={form.formState.errors.category?.message}><Select {...form.register("category")}>{categories.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
                    <FormField label="Author" error={form.formState.errors.author?.message}><Input {...form.register("author")} /></FormField>
                    <FormField label="Published At" error={form.formState.errors.publishedAt?.message}><Input type="date" {...form.register("publishedAt")} /></FormField>
                    <FormField label="Updated At" error={form.formState.errors.updatedAt?.message}><Input type="date" {...form.register("updatedAt")} /></FormField>
                    <label className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-hover px-3 py-3 text-sm font-medium text-primary"><input type="checkbox" className="h-4 w-4 accent-[var(--color-accent)]" {...form.register("featured")} /> Featured article</label>
                    <div className="md:col-span-2"><FormField label="Tags" error={form.formState.errors.tags?.message as string | undefined}><TagInput value={form.watch("tags")} onChange={(value) => form.setValue("tags", value, { shouldDirty: true, shouldValidate: true })} /></FormField></div>
                  </CardContent></Card>
                  <Card><CardContent className="grid gap-4 md:grid-cols-2">
                    <FormField label="SEO Title" error={form.formState.errors.seoTitle?.message}><Input {...form.register("seoTitle")} /></FormField>
                    <FormField label="Canonical URL" error={form.formState.errors.canonicalUrl?.message}><Input {...form.register("canonicalUrl")} placeholder="https://..." /></FormField>
                    <div className="md:col-span-2"><FormField label="SEO Description" error={form.formState.errors.seoDescription?.message}><Textarea {...form.register("seoDescription")} className="min-h-24" /></FormField></div>
                  </CardContent></Card>
                </div>
                <Card><CardContent className="grid min-w-0 gap-4">
                  <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-hover">
                    {coverDraft.previewUrl ? (
                      <img src={coverDraft.previewUrl} alt="Cover preview" className="aspect-[16/9] w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid aspect-[16/9] place-items-center px-4 text-center">
                        <div>
                          <ImageIcon className="mx-auto mb-2 text-muted" size={22} />
                          <p className="text-xs font-semibold text-primary">Cover Image</p>
                          <p className="mt-1 text-xs text-muted">No image selected</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { handleCoverSelection(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                  <div className="flex flex-wrap gap-2">
                    <Button className="flex-1 sm:flex-none" type="button" size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()}><Upload size={14} /> {coverDraft.previewUrl ? "Replace cover" : "Upload cover"}</Button>
                    <Button className="flex-1 sm:flex-none" type="button" size="sm" variant="ghost" disabled={!coverDraft.previewUrl} onClick={() => { setCoverDraft({}); form.setValue("coverImageUrl", undefined, { shouldDirty: true, shouldValidate: true }); }}><X size={14} /> Remove</Button>
                  </div>
                  <p className="text-xs text-muted">Cover uploads to Cloudinary on save. MongoDB stores only the final URL and media metadata.</p>
                  {coverDraft.file ? <Badge tone="warning">Pending upload</Badge> : null}
                </CardContent></Card>
              </div>
            ) : null}

            {activeTab === "editor" ? (
              <div className="grid gap-4">
                <BlogArticleBuilder
                  blocks={values.blocks}
                  onChange={handleBlocksChange}
                  onUpload={uploadFile}
                />
                {form.formState.errors.blocks?.message ? <p className="text-xs text-danger">{form.formState.errors.blocks.message}</p> : null}
              </div>
            ) : null}

            {activeTab === "preview" ? <ArticlePreview article={values} /> : null}
        </form>
      )}
    </CmsEditorModal>
  );
}
