import { X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { FormField } from "@/components/form/FormField";
import { ImagePreview } from "@/components/media/ImagePreview";
import { UploadDropzone } from "@/components/media/UploadDropzone";
import { Button } from "@/components/ui/Button";
import { useUploadMedia } from "@/features/shared/hooks";

const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);

export function SeoImageField({
  label,
  value,
  folder,
  error,
  onChange,
}: {
  label: string;
  value?: string;
  folder: string;
  error?: string;
  onChange: (url: string) => void;
}) {
  const toast = useToast();
  const uploadMedia = useUploadMedia();
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    if (!allowedImageTypes.has(file.type)) {
      toast.error("SEO images must be JPEG, PNG, WEBP, or ICO.");
      return;
    }
    if (file.size > maxImageBytes) {
      toast.error("SEO images must be 5MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const asset = await uploadMedia.mutateAsync({ file, folder });
      const url = asset.secureUrl?.trim() || asset.url?.trim();
      if (!url) throw new Error("Upload completed, but no image URL was returned.");
      onChange(url);
      toast.success(`${label} uploaded. Save SEO to publish it.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${label} upload failed`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormField label={label} error={error}>
      <div className="grid gap-3 rounded-lg border border-border-subtle bg-surface p-3">
        <ImagePreview src={value} alt={`${label} preview`} />
        <UploadDropzone onFile={(file) => void upload(file)} />
        <Button type="button" size="sm" variant="ghost" disabled={!value || uploading || uploadMedia.isPending} onClick={() => onChange("")}>
          <X size={14} /> Remove
        </Button>
      </div>
    </FormField>
  );
}
