export function GoogleSearchPreview({ title, url, description }: { title: string; url: string; description: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <p className="truncate text-sm text-secondary">{url || "https://example.com/page"}</p>
      <p className="mt-1 truncate text-lg text-blue-400">{title || "Page title preview"}</p>
      <p className="mt-1 text-sm text-muted">{description || "Meta description preview appears here."}</p>
    </div>
  );
}
