import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { MediaAsset } from "@/types/media.types";

export function MediaGrid({ assets, onDelete }: { assets: MediaAsset[]; onDelete?: (asset: MediaAsset) => void }) {
  if (!assets.length) return <EmptyState title="No media yet" description="Upload assets from image fields or the media library." />;
  return (
    <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))] gap-4">
      {assets.map((asset) => (
        <article key={asset._id} className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-elevation-1 transition hover:-translate-y-0.5 hover:border-accent/40">
          <div className="aspect-[16/9] overflow-hidden bg-surface-hover">
            <img
              src={asset.secureUrl || asset.url}
              alt={asset.publicId}
              className="h-full w-full object-cover"
              loading="lazy"
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 100vw"
            />
          </div>
          <div className="min-w-0 space-y-2 p-3">
            <h3 className="truncate text-sm font-medium">{asset.publicId}</h3>
            <p className="text-xs text-muted">Used in {asset.usedIn?.length ?? 0} places</p>
            {onDelete ? (
              <Button size="sm" variant="danger" className="w-full" onClick={() => onDelete(asset)}>
                <Trash2 size={14} /> Delete
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
