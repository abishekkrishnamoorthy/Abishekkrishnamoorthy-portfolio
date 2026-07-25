import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project.types";

const labels: Record<ProjectStatus, string> = {
  production: "Production",
  "in-progress": "In Progress",
  completed: "Completed",
};

export function Badge({ status, label }: { status: ProjectStatus; label?: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-3 py-1 text-xs font-semibold text-white">
      <span className={cn("h-2 w-2 rounded-full", status === "in-progress" ? "bg-[var(--status-progress)]" : "bg-[var(--status-success)]")} />
      {label ?? labels[status]}
    </span>
  );
}
