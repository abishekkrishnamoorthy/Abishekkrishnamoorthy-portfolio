import { useState } from "react";
import { FormField } from "@/components/form/FormField";
import { MediaGrid } from "@/components/media/MediaGrid";
import { UploadDropzone } from "@/components/media/UploadDropzone";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/app/providers/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { useDeleteMedia, useMediaAssets, useUploadMedia } from "@/features/shared/hooks";

export default function MediaLibraryPage() {
  const [folder, setFolder] = useState("");
  const query = useMediaAssets(folder || undefined);
  const upload = useUploadMedia();
  const remove = useDeleteMedia();
  const confirm = useConfirm();
  const toast = useToast();
  const uploadFile = async (file: File) => {
    try {
      await upload.mutateAsync({ file, folder: folder || "portfolio" });
      toast.success("Media uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return (
    <div className="grid gap-4">
      <FormField label="Folder filter"><Input value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="portfolio/projects" /></FormField>
      <UploadDropzone onFile={(file) => { void uploadFile(file); }} />
      {upload.isPending ? <p className="text-sm text-secondary">Uploading...</p> : null}
      <MediaGrid assets={query.data ?? []} onDelete={async (asset) => (await confirm({ title: `Delete ${asset.publicId}?`, description: "Cloudinary delete will be attempted by the backend." })) && remove.mutate(asset._id)} />
    </div>
  );
}
