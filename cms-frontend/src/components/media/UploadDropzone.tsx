import { Upload } from "lucide-react";

export function UploadDropzone({ onFile }: { onFile: (file: File) => void }) {
  return (
    <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border-subtle bg-surface p-4 text-center text-sm text-secondary hover:bg-surface-hover">
      <Upload className="mb-2" size={22} />
      <span>Choose a file to upload</span>
      <input className="sr-only" type="file" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
    </label>
  );
}
