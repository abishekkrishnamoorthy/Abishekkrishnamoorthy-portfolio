export function ImagePreview({ src, alt }: { src?: string; alt: string }) {
  if (!src) return <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border-subtle text-sm text-muted">No image selected</div>;
  return <img src={src} alt={alt} className="aspect-video w-full rounded-md border border-border-subtle object-cover" loading="lazy" />;
}
