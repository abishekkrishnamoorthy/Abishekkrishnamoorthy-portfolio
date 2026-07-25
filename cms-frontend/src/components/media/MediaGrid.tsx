import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { MediaAsset } from "@/types/media.types";

export function MediaGrid({ assets, onDelete }: { assets: MediaAsset[]; onDelete?: (asset: MediaAsset) => void }) {
  if (!assets.length) return <EmptyState title="No media yet" description="Upload assets from image fields or the media library." />;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {assets.map((asset) => (
        <article key={asset._id} className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <img src={asset.secureUrl || asset.url} alt={asset.publicId} className="aspect-video w-full object-cover" loading="lazy" />
          <div className="space-y-2 p-3">
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
