import { Link, Outlet } from "react-router-dom";
import { CalendarDays, Clock3, Edit, ExternalLink, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useConfirm } from "@/hooks/useConfirm";
import { useBlogs, useDeleteBlog, useGlobalSeo, usePublishBlog } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";
import { can } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils/formatDate";

export function blogPublicUrl(siteUrl: string | undefined, slug: string) {
  if (!siteUrl) return undefined;
  return `${siteUrl.replace(/\/$/, "")}/blog/${encodeURIComponent(slug)}`;
}

export default function BlogsListPage() {
  const { user } = useAuth();
  const query = useBlogs();
  const globalSeo = useGlobalSeo();
  const publish = usePublishBlog();
  const remove = useDeleteBlog();
  const confirm = useConfirm();
  const saveWorkflow = useSaveWorkflow();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("updated");
  const rows = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return [...(query.data ?? [])]
      .filter((row) => status === "all" || row.publishStatus === status)
      .filter((row) => category === "all" || row.category === category)
      .filter((row) => !searchTerm || [row.title, row.excerpt, row.category, row.tags.join(" ")].join(" ").toLowerCase().includes(searchTerm))
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "published") return b.publishedAt.localeCompare(a.publishedAt);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [category, query.data, search, sort, status]);
  const categories = useMemo(() => [...new Set((query.data ?? []).map((row) => row.category))].sort(), [query.data]);

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-semibold">Blogs</h1><p className="text-sm text-secondary">Author, review, and publish articles.</p></div>
          {can(user, "blogs", "create") ? <Link to="/blogs/new" className="sm:w-auto"><Button className="w-full sm:w-auto"><Plus size={18} /> New Article</Button></Link> : null}
        </div>
        <div className="grid gap-3 rounded-xl border border-border-subtle bg-surface p-3 shadow-elevation-1 sm:p-4 lg:grid-cols-[minmax(0,1fr)_160px_180px_160px]">
          <div className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles..." className="pl-9" aria-label="Search articles" />
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-3 lg:contents">
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
            <Select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="updated">Updated</option>
              <option value="published">Published</option>
              <option value="title">Title</option>
            </Select>
          </div>
        </div>
        {!rows.length ? (
          <EmptyState title={query.isLoading ? "Loading articles..." : "No articles yet"} />
        ) : (
          <div className="grid min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {rows.map((row) => {
              const isPublished = row.publishStatus === "published";
              const publicUrl = blogPublicUrl(globalSeo.data?.siteUrl, row.slug);
              const nextStatus = isPublished ? "draft" : "published";
              const canUpdate = can(user, "blogs", "update");
              const canPublish = can(user, "blogs", "publish");
              const canDelete = can(user, "blogs", "delete");
              return (
                <article
                  key={row._id ?? row.slug}
                  className="group grid min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-elevation-1 transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-elevation-2"
                >
                  <div className="grid min-w-0 gap-0 md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[200px_minmax(0,1fr)]">
                    <div className="relative min-w-0 overflow-hidden bg-surface-hover">
                      <div className="aspect-[16/9] w-full">
                        {row.coverImageUrl ? (
                          <img
                            src={row.coverImageUrl}
                            alt={`${row.title} cover`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                            sizes="(min-width: 1536px) 200px, (min-width: 1280px) 50vw, (min-width: 768px) 220px, 100vw"
                          />
                        ) : (
                          <div className="grid h-full place-items-center border-b border-border-subtle text-center md:border-b-0 md:border-r xl:border-b xl:border-r-0 2xl:border-b-0 2xl:border-r">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">No cover</p>
                              <p className="mt-1 text-xs text-secondary">16:9 preview</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid min-w-0 content-between gap-5 p-4 sm:p-5">
                      <div className="min-w-0 space-y-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <Badge tone="neutral">{row.category}</Badge>
                          <Badge tone={isPublished ? "success" : "warning"}>{row.publishStatus}</Badge>
                          {row.featured ? <Badge tone="info">Featured</Badge> : null}
                        </div>
                        <div className="min-w-0">
                          <h2 className="cms-line-clamp-2 text-base font-semibold leading-6 text-primary sm:text-lg">{row.title}</h2>
                          <p className="cms-line-clamp-2 mt-2 text-sm leading-6 text-secondary">{row.excerpt}</p>
                        </div>
                        <div className="grid min-w-0 gap-2 text-xs text-muted sm:grid-cols-2">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <UserRound size={14} className="shrink-0" />
                            <span className="truncate">{row.author}</span>
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <CalendarDays size={14} className="shrink-0" />
                            <span className="truncate">{formatDate(row.updatedAt)}</span>
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <Clock3 size={14} className="shrink-0" />
                            <span className="truncate">{row.readTimeMinutes ?? 1} min read</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-wrap gap-2 border-t border-border-subtle pt-4">
                        {canUpdate ? (
                          <Link to={`/blogs/${row.slug}`} className="min-w-0 flex-1 sm:flex-none">
                            <Button className="w-full px-3" size="sm" variant="secondary"><Edit size={14} /> Edit</Button>
                          </Link>
                        ) : null}
                        {canPublish ? (
                          <Button
                            className="min-w-0 flex-1 px-3 sm:flex-none"
                            disabled={saveWorkflow.isSaving}
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              const ok = await confirm({
                                title: `${nextStatus === "published" ? "Publish" : "Unpublish"} ${row.title}?`,
                                description: nextStatus === "published" ? "This article will become visible on the public frontend." : "This article will be removed from the public frontend.",
                              });
                              if (ok) void saveWorkflow.save(() => publish.mutateAsync({ slug: row.slug, publishStatus: nextStatus }));
                            }}
                          >
                            {isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        ) : null}
                        {isPublished && publicUrl ? (
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm font-medium text-primary transition hover:bg-surface-hover sm:flex-none"
                          >
                            <ExternalLink size={14} /> Public
                          </a>
                        ) : null}
                        {canDelete ? (
                          <Button
                            className="min-w-0 flex-1 px-3 sm:flex-none"
                            size="sm"
                            variant="danger"
                            onClick={async () => (await confirm({ title: `Delete ${row.title}?`, description: "This cannot be undone." })) && remove.mutate(row.slug)}
                          >
                            <Trash2 size={14} /> Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
}
