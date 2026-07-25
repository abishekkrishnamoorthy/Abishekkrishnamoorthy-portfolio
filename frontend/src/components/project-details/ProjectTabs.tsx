"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectStructureBlock } from "@/components/project-details/ProjectStructureBlock";
import { TechStackTable } from "@/components/project-details/TechStackTable";
import { slugify } from "@/lib/utils";
import type { Project } from "@/types/project.types";

type Tab = "readme" | "screenshots" | "case-study";

export function ProjectTabs({ project }: { project: Project }) {
  const [active, setActive] = useState<Tab>("readme");
  const tabs: { id: Tab; label: string }[] = [
    { id: "readme", label: "README" },
    { id: "screenshots", label: "Screenshots" },
    { id: "case-study", label: "Case Study" },
  ];
  return (
    <div>
      <div role="tablist" className="mb-8 flex overflow-x-auto border-b border-[var(--border-subtle)]">
        {tabs.map((tab) => (
          <button key={tab.id} role="tab" aria-selected={active === tab.id} className="relative px-5 py-4 text-sm font-semibold text-[var(--text-secondary)] aria-selected:text-white" onClick={() => setActive(tab.id)}>
            {tab.label}
            {active === tab.id ? <motion.span layoutId="project-tab-underline" className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--accent-gold)]" /> : null}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {active === "readme" ? <ProjectOverviewTab project={project} /> : null}
          {active === "screenshots" ? <ProjectScreenshotsTab project={project} /> : null}
          {active === "case-study" ? <ProjectCaseStudyTab project={project} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ProjectOverviewTab({ project }: { project: Project }) {
  const sections = useMemo(() => project.readmeMarkdown.split(/\n## /).map((section, index) => (index === 0 ? section : `## ${section}`)), [project.readmeMarkdown]);
  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const heading = section.match(/^##\s(.+)$/m)?.[1] ?? "Overview";
        return (
          <section key={heading} id={slugify(heading)} className="scroll-mt-28 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: ({ children }) => <h2 className="mb-4 text-xl font-semibold text-white">{children}</h2>, p: ({ children }) => <p className="mb-3 text-sm leading-7 text-[var(--text-secondary)]">{children}</p>, li: ({ children }) => <li className="ml-5 list-disc text-sm leading-7 text-[var(--text-secondary)]">{children}</li> }}>{section}</ReactMarkdown>
          </section>
        );
      })}
      <section id="tech-stack" className="scroll-mt-28"><h2 className="mb-4 text-xl font-semibold text-white">Tech Stack</h2><TechStackTable rows={project.techStackTable} /></section>
      <section id="project-structure" className="scroll-mt-28"><h2 className="mb-4 text-xl font-semibold text-white">Project Structure</h2><ProjectStructureBlock value={project.projectStructure} /></section>
    </div>
  );
}

export function ProjectScreenshotsTab({ project }: { project: Project }) {
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight" && active !== null) setActive((active + 1) % project.gallery.length);
      if (event.key === "ArrowLeft" && active !== null) setActive((active - 1 + project.gallery.length) % project.gallery.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, project.gallery.length]);

  if (!project.gallery.length) return <EmptyState title="No screenshots added yet" />;
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {project.gallery.map((image, index) => (
          <button key={image.url} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]" onClick={() => setActive(index)}>
            <Image src={image.url} alt={image.caption ?? `${project.title} screenshot`} fill className="object-cover" />
          </button>
        ))}
      </div>
      {active !== null ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <button aria-label="Close lightbox" className="absolute right-5 top-5 text-white" onClick={() => setActive(null)}><X /></button>
          <button aria-label="Previous screenshot" className="absolute left-5 text-white" onClick={() => setActive((active - 1 + project.gallery.length) % project.gallery.length)}><ChevronLeft /></button>
          <div className="relative h-[70vh] w-[80vw]"><Image src={project.gallery[active].url} alt={project.gallery[active].caption ?? "Project screenshot"} fill className="object-contain" /></div>
          <button aria-label="Next screenshot" className="absolute right-5 text-white" onClick={() => setActive((active + 1) % project.gallery.length)}><ChevronRight /></button>
        </div>
      ) : null}
    </>
  );
}

export function ProjectCaseStudyTab({ project }: { project: Project }) {
  return (
    <article className="space-y-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <CaseBlock title="Architecture" body={project.architectureNotes} />
      <CaseList title="Challenges" items={project.challenges} />
      <CaseList title="Solutions" items={project.solutions} />
      <CaseList title="Learning Outcomes" items={project.learningOutcomes} />
    </article>
  );
}

function CaseBlock({ title, body }: { title: string; body: string }) {
  return <section id={slugify(title)} className="scroll-mt-28"><h2 className="mb-3 text-xl font-semibold text-white">{title}</h2><p className="text-sm leading-7 text-[var(--text-secondary)]">{body}</p></section>;
}

function CaseList({ title, items }: { title: string; items: string[] }) {
  return <section id={slugify(title)} className="scroll-mt-28"><h2 className="mb-3 text-xl font-semibold text-white">{title}</h2><ul className="space-y-2">{items.map((item) => <li key={item} className="text-sm leading-7 text-[var(--text-secondary)]">- {item}</li>)}</ul></section>;
}
