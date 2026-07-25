import { ArrowRight, CheckCircle2, ExternalLink, Code2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Tag } from "@/components/common/Tag";
import type { Project } from "@/types/project.types";

export function ProjectListItem({ project }: { project: Project }) {
  return (
    <article className="group grid gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition hover:border-[rgba(232,163,61,0.4)] lg:grid-cols-[0.34fr_1fr_190px] lg:p-5">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--bg-surface-alt)] lg:aspect-auto">
        <Image src={project.thumbnailUrl} alt={`${project.title} thumbnail`} fill className="object-cover transition group-hover:scale-105 motion-reduce:group-hover:scale-100" />
      </div>
      <div className="min-w-0">
        <Badge status={project.status} />
        <h2 className="mt-4 text-xl font-semibold text-white">{project.title}</h2>
        <p className="mt-1 text-sm font-medium text-[var(--accent-gold)]">{project.tagline}</p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.techTags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
        <ul className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 lg:justify-center">
        <Button href={project.liveDemoUrl} external icon={<ExternalLink className="h-4 w-4" />}>Live Demo</Button>
        <Button href={project.githubUrl} external variant="secondary" icon={<Code2 className="h-4 w-4" />}>GitHub</Button>
        <Button href={`/projects/${project.slug}`} variant="secondary" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">Explore Project</Button>
      </div>
    </article>
  );
}
