import { ArrowUpRight, Code2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Tag } from "@/components/common/Tag";
import type { Project } from "@/types/project.types";

export function FeaturedProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition hover:-translate-y-1 hover:border-[rgba(232,163,61,0.4)] motion-reduce:hover:translate-y-0">
      <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl bg-[var(--bg-surface-alt)]">
        <Image src={project.thumbnailUrl} alt={`${project.title} thumbnail`} fill className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-[var(--accent-gold)]">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="text-xl font-semibold text-white">{project.title}</h3>
      <p className="mt-1 text-sm font-medium text-[var(--accent-gold)]">{project.tagline}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{project.shortDescription}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.techTags.slice(0, 4).map((tag) => <Tag key={tag} label={tag} />)}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="sm" href={project.liveDemoUrl} external icon={<ArrowUpRight className="h-4 w-4" />}>Live Demo</Button>
        <Button size="sm" variant="secondary" href={project.githubUrl} external icon={<Code2 className="h-4 w-4" />}>GitHub</Button>
        <Button size="sm" variant="ghost" href={`/projects/${project.slug}`}>Case Study</Button>
      </div>
    </article>
  );
}
