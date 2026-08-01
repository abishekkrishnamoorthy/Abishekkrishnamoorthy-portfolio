import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { seoSchema, robotsValues, type SeoFormValues } from "@/features/seo/seo.schema";
import { GoogleSearchPreview } from "@/features/seo/components/GoogleSearchPreview";
import { SeoFieldGroup } from "@/features/seo/components/SeoFieldGroup";
import { SeoImageField } from "@/features/seo/components/SeoImageField";
import { SocialPreview } from "@/features/seo/components/SocialPreview";
import type { GlobalSeo, SeoOverride } from "@/types/admin.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

const emptyPageSeo: SeoFormValues = {
  pagePath: "/",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogImageUrl: "",
  ogTitle: "",
  ogDescription: "",
  robots: undefined,
};

function valuesFromOverride(override?: SeoOverride | null): SeoFormValues {
  return {
    pagePath: override?.pagePath ?? "/",
    metaTitle: override?.metaTitle ?? "",
    metaDescription: override?.metaDescription ?? "",
    canonicalUrl: override?.canonicalUrl ?? "",
    ogImageUrl: override?.ogImageUrl ?? "",
    ogTitle: override?.ogTitle ?? "",
    ogDescription: override?.ogDescription ?? "",
    robots: override?.robots,
  };
}

function pathUrl(globalSeo: GlobalSeo | undefined, path: string, canonicalUrl?: string) {
  if (canonicalUrl) return canonicalUrl;
  const siteUrl = globalSeo?.siteUrl ?? "https://abishekkrishnamoorthy.online";
  return `${siteUrl}${path === "/" ? "" : path}`;
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function PageSeoFormDialog({
  open,
  onOpenChange,
  override,
  globalSeo,
  overrides,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  override?: SeoOverride | null;
  globalSeo?: GlobalSeo;
  overrides: SeoOverride[];
  onSave: (values: SeoFormValues) => Promise<unknown>;
}) {
  const saveWorkflow = useSaveWorkflow();
  const form = useForm<SeoFormValues>({ resolver: zodResolver(seoSchema), defaultValues: emptyPageSeo });
  const values = useWatch({ control: form.control });
  const current = { ...emptyPageSeo, ...values };
  const isEditing = Boolean(override?._id);

  useEffect(() => {
    if (open) form.reset(valuesFromOverride(override));
  }, [form, open, override]);

  const metaTitle = current.metaTitle || globalSeo?.defaultMetaTitle || "";
  const metaDescription = current.metaDescription || globalSeo?.defaultMetaDescription || "";
  const previewTitle = current.metaTitle && globalSeo?.titleTemplate ? globalSeo.titleTemplate.replace("%page%", current.metaTitle) : metaTitle;
  const previewDescription = metaDescription;
  const previewUrl = pathUrl(globalSeo, current.pagePath, current.canonicalUrl);
  const duplicatePath = overrides.some((item) => item.pagePath === current.pagePath && item._id !== override?._id);
  const duplicateTitle = Boolean(current.metaTitle) && overrides.some((item) => item.metaTitle === current.metaTitle && item._id !== override?._id);

  async function submit(values: SeoFormValues) {
    if (duplicatePath) {
      form.setError("pagePath", { message: "A page override already exists for this path." });
      return;
    }
    await saveWorkflow.save(async () => {
      await onSave(values);
      onOpenChange(false);
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEditing ? "Edit Page SEO" : "New Page SEO"} contentClassName="sm:max-w-3xl">
      <form className="grid gap-4" onSubmit={form.handleSubmit(submit, saveWorkflow.validationFailed)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Page Path" error={form.formState.errors.pagePath?.message}><Input {...form.register("pagePath")} /></FormField>
          <FormField label="Canonical URL" error={form.formState.errors.canonicalUrl?.message}><Input {...form.register("canonicalUrl")} /></FormField>
          <SeoFieldGroup
            titleLabel="Meta Title"
            descriptionLabel="Meta Description"
            titleValue={current.metaTitle ?? ""}
            descriptionValue={current.metaDescription ?? ""}
            titleError={form.formState.errors.metaTitle?.message}
            descriptionError={form.formState.errors.metaDescription?.message}
            onTitleChange={(value) => form.setValue("metaTitle", value, { shouldDirty: true, shouldValidate: true })}
            onDescriptionChange={(value) => form.setValue("metaDescription", value, { shouldDirty: true, shouldValidate: true })}
          />
          <FormField label="Robots" error={form.formState.errors.robots?.message}>
            <Select {...form.register("robots")}>
              <option value="">Inherit from Global</option>
              {robotsValues.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </FormField>
        </div>
        {duplicateTitle ? <p className="rounded-md border border-accent/30 bg-accent/10 p-3 text-sm text-accent">Another override already uses this meta title.</p> : null}
        <div className="grid gap-4 rounded-lg border border-border-subtle p-4 md:grid-cols-2">
          <FormField label="Open Graph Title" error={form.formState.errors.ogTitle?.message}><Input {...form.register("ogTitle")} /></FormField>
          <FormField label="Open Graph Description" error={form.formState.errors.ogDescription?.message}><Input {...form.register("ogDescription")} /></FormField>
          <SeoImageField label="Open Graph Image" value={current.ogImageUrl} folder="portfolio/seo/pages" error={form.formState.errors.ogImageUrl?.message} onChange={(url) => form.setValue("ogImageUrl", url, { shouldDirty: true, shouldValidate: true })} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <GoogleSearchPreview title={previewTitle} url={previewUrl} description={previewDescription} />
          <SocialPreview imageUrl={current.ogImageUrl || globalSeo?.defaultOgImageUrl} title={current.ogTitle || previewTitle} description={current.ogDescription || previewDescription} domain={domainFromUrl(previewUrl)} />
        </div>
        <div className="flex justify-end gap-2">
          <SaveButton isSaving={saveWorkflow.isSaving} />
        </div>
      </form>
    </Modal>
  );
}
