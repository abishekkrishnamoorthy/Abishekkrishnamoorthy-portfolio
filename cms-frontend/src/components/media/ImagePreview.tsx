export function ImagePreview({ src, alt }: { src?: string; alt: string }) {
  if (!src) return <div className="flex aspect-[16/9] min-w-0 items-center justify-center rounded-md border border-dashed border-border-subtle bg-surface-hover px-4 text-center text-sm text-muted">No image selected</div>;
  return (
    <div className="aspect-[16/9] min-w-0 overflow-hidden rounded-md border border-border-subtle bg-surface-hover">
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" sizes="(min-width: 1024px) 480px, 100vw" />
    </div>
  );
}
