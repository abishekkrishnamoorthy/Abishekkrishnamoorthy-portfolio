"use client";

import { Bot, ChevronLeft, ChevronRight, ExternalLink, Code2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FeaturedProjectCard } from "@/components/home/FeaturedProjectCard";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { SectionTitle } from "@/components/common/SectionTitle";
import type { Project } from "@/types/project.types";
import { useAssistant } from "@/hooks/useAssistant";
import { ApiError } from "@/types/common.types";

export function ProjectHeader({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="section-container pb-8">
        <Link href="/projects" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-gold)]"><ChevronLeft className="h-4 w-4" /> Back to Projects</Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Project</p>
            <h1 className="text-[28px] font-bold leading-9 text-white md:text-[40px] md:leading-[56px]">{project.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">{project.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4"><Badge status={project.status} /><a href={project.liveDemoUrl} className="text-sm text-[var(--accent-gold)]">Live URL</a></div>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-48 lg:justify-end">
            <Button href={project.liveDemoUrl} external icon={<ExternalLink className="h-4 w-4" />}>Live Demo</Button>
            <Button variant="secondary" icon={<Bot className="h-4 w-4" />} onClick={() => setOpen(true)}>Ask Project AI</Button>
          </div>
        </div>
      </section>
      <AskProjectAIPanel project={project} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function OnThisPageNav({ project }: { project: Project }) {
  const items = ["overview", "key-features", "tech-stack", "project-structure", "getting-started", "deployment"];
  return (
    <aside className="sticky top-28 hidden h-fit space-y-4 lg:block">
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <h2 className="text-sm font-semibold text-white">On this page</h2>
        <nav className="mt-4 flex flex-col gap-2">
          {items.map((item) => <a key={item} href={`#${item}`} className="border-l border-[var(--border-subtle)] pl-3 text-sm capitalize text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]">{item.replaceAll("-", " ")}</a>)}
        </nav>
      </div>
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <h2 className="text-sm font-semibold text-white">Project Links</h2>
        <div className="mt-4 grid gap-3">
          <Button href={project.liveDemoUrl} external variant="secondary" icon={<ExternalLink className="h-4 w-4" />}>Live Demo</Button>
          <Button href={project.githubUrl} external variant="secondary" icon={<Code2 className="h-4 w-4" />}>GitHub Repository</Button>
        </div>
      </div>
    </aside>
  );
}

export function RelatedProjectsSection({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section className="section-container">
      <SectionTitle eyebrow="Related Projects" title="Keep exploring adjacent work." />
      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project, index) => <FeaturedProjectCard key={project.id} project={project} index={index} />)}
      </div>
    </section>
  );
}

export function ProjectPrevNextNav({ project }: { project: Project }) {
  return (
    <section className="section-container pt-0">
      <div className="grid gap-4 md:grid-cols-2">
        {project.previousProject ? <ProjectNavCard direction="Previous" href={`/projects/${project.previousProject.slug}`} title={project.previousProject.title} /> : <div />}
        {project.nextProject ? <ProjectNavCard direction="Next" href={`/projects/${project.nextProject.slug}`} title={project.nextProject.title} align="right" /> : <div />}
      </div>
    </section>
  );
}

function ProjectNavCard({ direction, href, title, align }: { direction: string; href: string; title: string; align?: "right" }) {
  return (
    <Link href={href} aria-label={`${direction} project: ${title}`} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition hover:border-[rgba(232,163,61,0.4)]">
      <span className={`flex items-center gap-2 text-sm text-[var(--text-muted)] ${align === "right" ? "justify-end" : ""}`}>{align === "right" ? null : <ChevronLeft className="h-4 w-4" />}{direction}{align === "right" ? <ChevronRight className="h-4 w-4" /> : null}</span>
      <span className={`mt-2 block font-semibold text-white ${align === "right" ? "text-right" : ""}`}>{title}</span>
    </Link>
  );
}

function AskProjectAIPanel({ project, open, onClose }: { project: Project; open: boolean; onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string>();
  const assistant = useAssistant();
  if (!open) return null;

  const submit = async () => {
    if (!question.trim()) return;
    try {
      const result = await assistant.mutateAsync({ message: question.trim(), projectSlug: project.slug });
      setResponse(result.message);
    } catch (error) {
      setResponse(error instanceof ApiError ? error.message : "The project assistant is currently unavailable.");
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 lg:pointer-events-none lg:bg-transparent">
      <div className="ml-auto mt-auto flex h-full max-w-md items-end lg:h-auto lg:pt-[50vh]">
        <div className="pointer-events-auto w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Ask {project.title} AI</h2>
            <button aria-label="Close Ask Project AI" onClick={onClose} className="text-[var(--text-secondary)] hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">AI responses are based on project documentation.</p>
          <label className="mt-4 flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-4 py-3 text-sm text-[var(--text-muted)]">
            <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} placeholder="Ask about this project..." className="w-full bg-transparent outline-none" />
          </label>
          {response ? <p role="status" className="mt-3 text-sm text-[var(--text-secondary)]">{response}</p> : null}
        </div>
      </div>
    </div>
  );
}
