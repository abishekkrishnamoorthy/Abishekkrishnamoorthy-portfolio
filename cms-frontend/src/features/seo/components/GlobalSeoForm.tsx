import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { FormSection } from "@/components/form/FormSection";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { globalSeoSchema, robotsValues, type GlobalSeoFormValues } from "@/features/seo/seo.schema";
import { GoogleSearchPreview } from "@/features/seo/components/GoogleSearchPreview";
import { SeoFieldGroup } from "@/features/seo/components/SeoFieldGroup";
import { SeoImageField } from "@/features/seo/components/SeoImageField";
import { SocialPreview } from "@/features/seo/components/SocialPreview";
import { useGlobalSeo, useUpdateGlobalSeo } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

const fallbackGlobalSeo: GlobalSeoFormValues = {
  siteName: "Abishek Krishnamoorthy",
  siteUrl: "https://abishekkrishnamoorthy.online",
  defaultMetaTitle: "Abishek Krishnamoorthy - Full-Stack Developer",
  titleTemplate: "%page% | Abishek Krishnamoorthy",
  defaultMetaDescription: "Full-stack developer portfolio featuring projects, articles, and experience.",
  defaultAuthor: "Abishek Krishnamoorthy",
  defaultRobots: "index,follow",
  googleVerificationCode: "",
  defaultOgImageUrl: "",
  defaultFaviconUrl: "",
};

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function GlobalSeoForm() {
  const query = useGlobalSeo();
  const update = useUpdateGlobalSeo();
  const saveWorkflow = useSaveWorkflow();
  const form = useForm<GlobalSeoFormValues>({ resolver: zodResolver(globalSeoSchema), defaultValues: fallbackGlobalSeo });
  const values = useWatch({ control: form.control });

  useEffect(() => {
    if (query.data) form.reset({ ...fallbackGlobalSeo, ...query.data });
  }, [form, query.data]);

  const current = { ...fallbackGlobalSeo, ...values };

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit(
        (payload) =>
          saveWorkflow.save(async () => {
            const saved = await update.mutateAsync(payload);
            form.reset({ ...fallbackGlobalSeo, ...saved });
          }),
        saveWorkflow.validationFailed,
      )}
    >
      <FormSection title="Identity">
        <FormField label="Website Name" error={form.formState.errors.siteName?.message}><Input {...form.register("siteName")} /></FormField>
        <FormField label="Site URL" error={form.formState.errors.siteUrl?.message}><Input {...form.register("siteUrl")} /></FormField>
        <FormField label="Default Author" error={form.formState.errors.defaultAuthor?.message}><Input {...form.register("defaultAuthor")} /></FormField>
      </FormSection>
      <FormSection title="Search Appearance">
        <SeoFieldGroup
          titleLabel="Default Meta Title"
          descriptionLabel="Default Meta Description"
          titleValue={current.defaultMetaTitle ?? ""}
          descriptionValue={current.defaultMetaDescription ?? ""}
          titleError={form.formState.errors.defaultMetaTitle?.message}
          descriptionError={form.formState.errors.defaultMetaDescription?.message}
          onTitleChange={(value) => form.setValue("defaultMetaTitle", value, { shouldDirty: true, shouldValidate: true })}
          onDescriptionChange={(value) => form.setValue("defaultMetaDescription", value, { shouldDirty: true, shouldValidate: true })}
        />
        <FormField label="Title Template" error={form.formState.errors.titleTemplate?.message}><Input {...form.register("titleTemplate")} /></FormField>
        <FormField label="Default Robots" error={form.formState.errors.defaultRobots?.message}>
          <Select {...form.register("defaultRobots")}>{robotsValues.map((value) => <option key={value} value={value}>{value}</option>)}</Select>
        </FormField>
      </FormSection>
      <FormSection title="Verification">
        <FormField label="Google Verification Code" error={form.formState.errors.googleVerificationCode?.message}><Input {...form.register("googleVerificationCode")} /></FormField>
      </FormSection>
      <FormSection title="Media">
        <SeoImageField label="Default Open Graph Image" value={current.defaultOgImageUrl} folder="portfolio/seo" error={form.formState.errors.defaultOgImageUrl?.message} onChange={(url) => form.setValue("defaultOgImageUrl", url, { shouldDirty: true, shouldValidate: true })} />
        <SeoImageField label="Default Favicon" value={current.defaultFaviconUrl} folder="portfolio/seo" error={form.formState.errors.defaultFaviconUrl?.message} onChange={(url) => form.setValue("defaultFaviconUrl", url, { shouldDirty: true, shouldValidate: true })} />
      </FormSection>
      <div className="grid gap-4 lg:grid-cols-2">
        <GoogleSearchPreview title={current.defaultMetaTitle ?? ""} url={current.siteUrl ?? ""} description={current.defaultMetaDescription ?? ""} />
        <SocialPreview imageUrl={current.defaultOgImageUrl} title={current.defaultMetaTitle ?? ""} description={current.defaultMetaDescription ?? ""} domain={domainFromUrl(current.siteUrl ?? "")} />
      </div>
      <div className="sticky bottom-16 flex justify-end rounded-lg border border-border-subtle bg-surface p-3 lg:bottom-4">
        <SaveButton isSaving={saveWorkflow.isSaving} disabled={query.isLoading} />
      </div>
    </form>
  );
}
