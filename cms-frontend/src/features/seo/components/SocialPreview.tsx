import { ImageIcon } from "lucide-react";

export function SocialPreview({ imageUrl, title, description, domain }: { imageUrl?: string; title: string; description: string; domain: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" loading="lazy" />
      ) : (
        <div className="grid aspect-[1.91/1] place-items-center bg-surface-hover text-muted">
          <ImageIcon size={28} aria-hidden="true" />
        </div>
      )}
      <div className="grid gap-1 p-4">
        <p className="truncate text-xs uppercase text-muted">{domain || "example.com"}</p>
        <p className="truncate font-semibold text-primary">{title || "Social title preview"}</p>
        <p className="text-sm text-secondary">{description || "Social description preview appears here."}</p>
      </div>
    </div>
  );
}
