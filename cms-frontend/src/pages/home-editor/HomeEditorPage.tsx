import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/app/providers/ToastProvider";
import { FormField } from "@/components/form/FormField";
import { FormSection } from "@/components/form/FormSection";
import { SaveButton } from "@/components/form/SaveButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { homeSchema, type HomeFormValues } from "@/features/home/home.schema";
import { useHome, useUpdateHome, useUploadMedia } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function HomeEditorPage() {
  const query = useHome();
  const update = useUpdateHome();
  const uploadMedia = useUploadMedia();
  const saveWorkflow = useSaveWorkflow();
  const form = useForm<HomeFormValues>({ resolver: zodResolver(homeSchema) });
  const hasInitializedForm = useRef(false);
  const portraitUrl = useWatch({ control: form.control, name: "hero.portraitUrl" });
  const backgroundUrl = useWatch({ control: form.control, name: "hero.backgroundUrl" });
  useEffect(() => {
    if (query.data && !hasInitializedForm.current) {
      form.reset(query.data);
      hasInitializedForm.current = true;
    }
  }, [form, query.data]);

  async function uploadHeroAsset(file: File) {
    const asset = await uploadMedia.mutateAsync({ file, folder: "portfolio/home/hero" });
    const url = asset.secureUrl?.trim() || asset.url?.trim();
    if (!url) throw new Error("Cloudinary upload completed, but no image URL was returned.");
    return url;
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit(
        (values) =>
          saveWorkflow.save(async () => {
            const savedHome = await update.mutateAsync(values);
            form.reset(savedHome);
          }),
        saveWorkflow.validationFailed,
      )}
    >
      <FormSection title="Hero">
        <FormField label="Role Badge" error={form.formState.errors.hero?.roleBadge?.message}><Input {...form.register("hero.roleBadge")} /></FormField>
        <FormField label="Headline" error={form.formState.errors.hero?.headline?.message}><Input {...form.register("hero.headline")} /></FormField>
        <FormField label="Highlighted Headline" error={form.formState.errors.hero?.highlightedHeadline?.message}><Input {...form.register("hero.highlightedHeadline")} /></FormField>
        <FormField label="Subheadline" error={form.formState.errors.hero?.subheadline?.message}><Textarea {...form.register("hero.subheadline")} /></FormField>
        <FormField label="Primary CTA" error={form.formState.errors.hero?.cta?.primaryLabel?.message}><Input {...form.register("hero.cta.primaryLabel")} /></FormField>
        <FormField label="Secondary CTA" error={form.formState.errors.hero?.cta?.secondaryLabel?.message}><Input {...form.register("hero.cta.secondaryLabel")} /></FormField>
        <FormField label="Status Enabled" error={form.formState.errors.hero?.status?.enabled?.message}>
          <label className="inline-flex min-h-11 items-center gap-3 rounded-md border border-border-subtle bg-surface px-3 text-sm text-primary">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...form.register("hero.status.enabled")} />
            <span>Show availability status</span>
          </label>
        </FormField>
        <FormField label="Availability Status" error={form.formState.errors.hero?.status?.text?.message}><Input {...form.register("hero.status.text")} /></FormField>
        <FormField label="LinkedIn URL" error={form.formState.errors.hero?.socialLinks?.linkedIn?.message}><Input {...form.register("hero.socialLinks.linkedIn")} /></FormField>
        <FormField label="GitHub URL" error={form.formState.errors.hero?.socialLinks?.gitHub?.message}><Input {...form.register("hero.socialLinks.gitHub")} /></FormField>
        <FormField label="Email Address" error={form.formState.errors.hero?.socialLinks?.email?.message}><Input type="email" {...form.register("hero.socialLinks.email")} /></FormField>
      </FormSection>
      <FormSection title="Hero Assets">
        <HeroAssetField
          label="Portrait Image"
          assetName="Portrait"
          value={portraitUrl}
          error={form.formState.errors.hero?.portraitUrl?.message}
          isUploading={uploadMedia.isPending}
          onUpload={uploadHeroAsset}
          onChange={(url) => form.setValue("hero.portraitUrl", url, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
        />
        <FormField label="Portrait Alt Text" error={form.formState.errors.hero?.portraitAlt?.message}><Input {...form.register("hero.portraitAlt")} /></FormField>
        <HeroAssetField
          label="Background Image"
          assetName="Background"
          value={backgroundUrl}
          error={form.formState.errors.hero?.backgroundUrl?.message}
          isUploading={uploadMedia.isPending}
          onUpload={uploadHeroAsset}
          onChange={(url) => form.setValue("hero.backgroundUrl", url, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
        />
      </FormSection>
      <div className="sticky bottom-16 flex justify-end rounded-lg border border-border-subtle bg-surface p-3 lg:bottom-4">
        <SaveButton isSaving={saveWorkflow.isSaving} disabled={query.isLoading} />
      </div>
    </form>
  );
}

function HeroAssetField({
  label,
  assetName,
  value,
  error,
  isUploading,
  onUpload,
  onChange,
}: {
  label: string;
  assetName: string;
  value?: string;
  error?: string;
  isUploading: boolean;
  onUpload: (file: File) => Promise<string>;
  onChange: (url: string) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const assetUrl = value?.trim() ?? "";
  const hasAsset = assetUrl.length > 0;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!allowedImageTypes.has(file.type)) {
      toast.error("Hero assets must be JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > maxImageBytes) {
      toast.error("Hero assets must be 5MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const url = (await onUpload(file)).trim();
      if (!url) throw new Error("Upload completed, but no image URL was returned.");
      onChange(url);
      toast.success(`${label} uploaded. Save Home to publish it.`);
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : `${label} upload failed`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormField label={label} error={error}>
      <div className="grid gap-3 rounded-lg border border-border-subtle bg-surface p-3">
        <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-hover">
          {hasAsset ? (
            <img src={assetUrl} alt={`${label} preview`} className="aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="grid aspect-[16/9] place-items-center text-center">
              <div>
                <ImageIcon className="mx-auto mb-2 text-muted" size={22} />
                <p className="text-xs font-semibold text-primary">{label}</p>
                <p className="mt-1 text-xs text-muted">No image selected</p>
              </div>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={uploading || isUploading} onClick={() => inputRef.current?.click()}>
            <Upload size={14} /> {hasAsset ? `Replace ${assetName}` : `Upload ${assetName}`}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={!hasAsset || uploading || isUploading} onClick={() => onChange("")}>
            <X size={14} /> Remove
          </Button>
        </div>
        <p className="text-xs text-muted">JPEG, PNG, or WEBP. Maximum file size: 5MB. Save Home to persist this URL.</p>
      </div>
    </FormField>
  );
}
