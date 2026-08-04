import { Link, Outlet } from "react-router-dom";
import { Edit, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/table/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useBlogs, useDeleteBlog, useGlobalSeo, usePublishBlog } from "@/features/shared/hooks";
import type { BlogArticle } from "@/types/blog.types";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";
import { can } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils/formatDate";

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
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 lg:contents">
            <Select className="min-w-[150px] snap-start" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
            <Select className="min-w-[170px] snap-start" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
            <Select className="min-w-[150px] snap-start" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="updated">Updated</option>
              <option value="published">Published</option>
              <option value="title">Title</option>
            </Select>
          </div>
        </div>
        <DataTable<BlogArticle>
          rows={rows}
          emptyTitle={query.isLoading ? "Loading articles..." : "No articles yet"}
          columns={[
            {
              key: "title",
              header: "Title",
              primary: true,
              render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border-subtle bg-surface-hover">
                    {row.coverImageUrl ? <img src={row.coverImageUrl} alt={`${row.title} cover`} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-primary">{row.title}</p>
                    <p className="truncate text-xs text-secondary">{row.excerpt}</p>
                  </div>
                </div>
              ),
            },
            { key: "category", header: "Category", render: (row) => <span className="text-sm">{row.category}</span> },
            { key: "status", header: "Status", render: (row) => <div className="flex flex-wrap gap-1"><Badge tone={row.publishStatus === "published" ? "success" : "warning"}>{row.publishStatus}</Badge>{row.featured ? <Badge tone="info">Featured</Badge> : null}</div> },
            { key: "updated", header: "Updated", render: (row) => <span className="whitespace-nowrap">{formatDate(row.updatedAt)}</span> },
            { key: "read", header: "Read", render: (row) => <span className="whitespace-nowrap">{row.readTimeMinutes ?? 1} min</span> },
          ]}
          stickyActions
          actions={(row) => {
            const isPublished = row.publishStatus === "published";
            const publicUrl = globalSeo.data?.siteUrl ? `${globalSeo.data.siteUrl.replace(/\/$/, "")}/blog/${encodeURIComponent(row.slug)}` : undefined;
            const statusAction = (
              <Button
                className="w-full"
                disabled={saveWorkflow.isSaving}
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const nextStatus = isPublished ? "draft" : "published";
                  const ok = await confirm({
                    title: `${nextStatus === "published" ? "Publish" : "Unpublish"} ${row.title}?`,
                    description: nextStatus === "published" ? "This article will become visible on the public frontend." : "This article will be removed from the public frontend.",
                  });
                  if (ok) void saveWorkflow.save(() => publish.mutateAsync({ slug: row.slug, publishStatus: nextStatus }));
                }}
              >
                {isPublished ? "Unpublish" : "Publish"}
              </Button>
            );
            const deleteAction = (
              <Button className="w-full sm:w-auto" size="sm" variant="danger" onClick={async () => (await confirm({ title: `Delete ${row.title}?`, description: "This cannot be undone." })) && remove.mutate(row.slug)}><Trash2 size={14} /> Delete</Button>
            );
            return (
              <div className="grid w-full grid-cols-2 gap-2 sm:inline-flex sm:w-auto sm:flex-wrap sm:justify-end">
                {can(user, "blogs", "update") ? <Link to={`/blogs/${row.slug}`}><Button className="w-full" size="sm" variant="secondary"><Edit size={14} /> Edit</Button></Link> : null}
                {can(user, "blogs", "publish") ? statusAction : null}
                {isPublished && publicUrl ? <a href={publicUrl} target="_blank" rel="noreferrer"><Button className="w-full" size="sm" variant="secondary"><ExternalLink size={14} /> Public</Button></a> : null}
                {can(user, "blogs", "delete") ? deleteAction : null}
              </div>
            );
          }}
        />
      </div>
      <Outlet />
    </>
  );
}
