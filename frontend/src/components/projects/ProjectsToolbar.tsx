"use client";

import { Search } from "lucide-react";
import { projectCategories } from "@/constants/categories";
import { sortOptions } from "@/constants/sort-options";
import { cn } from "@/lib/utils";
import type { ProjectCategory, ProjectSort } from "@/types/project.types";

export function ProjectsToolbar({
  category,
  search,
  sort,
  onCategory,
  onSearch,
  onSort,
}: {
  category: "All" | ProjectCategory;
  search: string;
  sort: ProjectSort;
  onCategory: (value: "All" | ProjectCategory) => void;
  onSearch: (value: string) => void;
  onSort: (value: ProjectSort) => void;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex snap-x gap-2 overflow-x-auto pb-1">
        {projectCategories.map((item) => (
          <button key={item} className={cn("snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition", category === item ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black" : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-white")} onClick={() => onCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex h-11 items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-secondary)]">
          <Search className="h-4 w-4" />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search projects..." className="w-full bg-transparent text-white outline-none placeholder:text-[var(--text-muted)] sm:w-56" />
        </label>
        <select value={sort} onChange={(event) => onSort(event.target.value as ProjectSort)} className="h-11 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-white outline-none">
          {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
    </div>
  );
}
