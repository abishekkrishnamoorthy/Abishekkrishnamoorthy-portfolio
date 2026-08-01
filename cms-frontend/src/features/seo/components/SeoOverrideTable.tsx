import { Edit3, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/table/DataTable";
import type { GlobalSeo, SeoOverride } from "@/types/admin.types";

type IndexFilter = "all" | "indexed" | "non-indexed";

function isIndexed(override: SeoOverride, globalSeo?: GlobalSeo) {
  const robots = override.robots || globalSeo?.defaultRobots || "index,follow";
  return !robots.includes("noindex");
}

export function SeoOverrideTable({
  rows,
  globalSeo,
  onCreate,
  onEdit,
  onDelete,
}: {
  rows: SeoOverride[];
  globalSeo?: GlobalSeo;
  onCreate: () => void;
  onEdit: (override: SeoOverride) => void;
  onDelete: (override: SeoOverride) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<IndexFilter>("all");
  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !needle || row.pagePath.toLowerCase().includes(needle) || (row.metaTitle ?? "").toLowerCase().includes(needle);
      const indexed = isIndexed(row, globalSeo);
      const matchesFilter = filter === "all" || (filter === "indexed" ? indexed : !indexed);
      return matchesSearch && matchesFilter;
    });
  }, [filter, globalSeo, rows, search]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
        <Input placeholder="Search URL or title" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          {(["all", "indexed", "non-indexed"] as const).map((value) => (
            <Button key={value} type="button" size="sm" variant={filter === value ? "primary" : "secondary"} onClick={() => setFilter(value)}>
              {value === "all" ? "All" : value === "indexed" ? "Indexed" : "Non-Indexed"}
            </Button>
          ))}
          <Button type="button" size="sm" onClick={onCreate}><Plus size={14} /> New</Button>
        </div>
      </div>
      <DataTable<SeoOverride>
        rows={filteredRows}
        emptyTitle="No SEO overrides found"
        columns={[
          { key: "path", header: "Path", primary: true, render: (row) => row.pagePath },
          { key: "title", header: "Title", render: (row) => row.metaTitle || "Inherited" },
          { key: "robots", header: "Robots", render: (row) => row.robots || `Inherits ${globalSeo?.defaultRobots ?? "index,follow"}` },
        ]}
        actions={(row) => (
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(row)}><Edit3 size={14} /> Edit</Button>
            <Button type="button" size="sm" variant="danger" onClick={() => onDelete(row)}><Trash2 size={14} /></Button>
          </div>
        )}
      />
    </div>
  );
}
