import { Calendar, Clock, Layers, UserRound } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/project.types";

export function ProjectQuickStats({ project }: { project: Project }) {
  const stats = [
    { label: "Status", value: <Badge status={project.status} /> },
    { label: "Duration", value: project.durationLabel, icon: Calendar },
    { label: "Role", value: project.role, icon: UserRound },
    { label: "Last Updated", value: formatDate(project.lastUpdatedAt), icon: Clock },
    { label: "Technologies", value: project.techIcons.join(" / "), icon: Layers },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{Icon ? <Icon className="h-4 w-4" /> : null}{stat.label}</p>
            <div className="text-sm font-semibold text-white">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
}
