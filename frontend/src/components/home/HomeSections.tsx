import { ArrowRight, BookOpen, CalendarDays, Cloud, Monitor, Network, Server, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { SectionTitle } from "@/components/common/SectionTitle";
import { FeaturedProjectCard } from "@/components/home/FeaturedProjectCard";
import { formatDate } from "@/lib/utils";
import type { ArticlePreview } from "@/types/blog.types";
import type { Project } from "@/types/project.types";
import type { SkillsPayload } from "@/types/skill.types";

export function FeaturedProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section className="section-container">
      <SectionTitle eyebrow="Featured Projects" title="Selected builds with production-minded execution." action={{ label: "View all projects", href: "/projects" }} />
      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project, index) => <FeaturedProjectCard key={project.id} project={project} index={index} />)}
      </div>
    </section>
  );
}

export function SkillsSection({ skills }: { skills: SkillsPayload }) {
  const icons = [Monitor, Server, Cloud];
  return (
    <section id="skills" className="section-container">
      <SectionTitle eyebrow="Skills" title="A practical stack for shipping AI-enabled web products." />
      <div className="grid gap-6 md:grid-cols-3">
        {skills.categories.map((category, index) => {
          const Icon = icons[index] ?? Monitor;
          return (
            <article key={category.category} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
              <Icon className="mb-5 h-7 w-7 text-[var(--accent-gold)]" />
              <h3 className="text-lg font-semibold text-white">{category.title}</h3>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 text-sm text-[var(--text-secondary)]">
                {category.items.map((item) => <span key={item}>{item}</span>)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CurrentlyLearningSection({ skills }: { skills: SkillsPayload }) {
  const icons = { Sparkles, Cloud, Network };
  return (
    <section className="section-container">
      <SectionTitle eyebrow="Currently Learning" title="Active learning tracks with measurable progress." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {skills.learningItems.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? Sparkles;
          return (
            <article key={item.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <Icon className="h-5 w-5 text-[var(--accent-gold)]" />
              <h3 className="mt-4 text-base font-semibold text-white">{item.label}</h3>
              <div className="mt-4 h-2 rounded-full bg-[var(--bg-surface-alt)]" role="progressbar" aria-valuenow={item.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-[var(--accent-gold)]" style={{ width: `${item.progressPercent}%` }} />
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{item.progressPercent}%</p>
            </article>
          );
        })}
        <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] p-5">
          <BookOpen className="h-5 w-5 text-[var(--accent-gold)]" />
          <h3 className="mt-4 text-base font-semibold text-white">Learning Journey</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Tracking growth through focused projects and documentation.</p>
          <Button className="mt-5" variant="secondary" size="sm" href="#">View Journey</Button>
        </article>
      </div>
    </section>
  );
}

export function LatestBlogPreviewSection({ posts }: { posts: ArticlePreview[] }) {
  return (
    <section id="latest-blog-posts" className="section-container">
      <SectionTitle eyebrow="Latest Blog Posts" title="Notes on AI systems, developer tools, and cloud product work." action={{ label: "View all posts", href: "/blog" }} />
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition hover:-translate-y-1 hover:border-[rgba(232,163,61,0.4)] motion-reduce:hover:translate-y-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--bg-surface-alt)]">
              <Image src={post.coverImageUrl ?? "/assets/graphics/mesh-glow.png"} alt={`${post.title} cover`} fill className="object-cover transition group-hover:scale-105 motion-reduce:group-hover:scale-100" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-gold)]">{post.category}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{post.title}</h3>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{post.excerpt}</p>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{formatDate(post.publishedAt)} · {post.readTimeMinutes} min read</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ContactCTASection({ title, description, scheduleLabel }: { title: string; description: string; scheduleLabel?: string }) {
  return (
    <section id="contact-cta" className="section-container text-center">
      <div className="relative mx-auto max-w-3xl overflow-hidden py-8">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-32 rounded-full bg-[rgba(212,175,55,0.08)] blur-3xl" />
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">Contact</p>
          <h2 className="text-[28px] font-bold leading-9 text-white md:text-[40px] md:leading-[52px]">{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/contact" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
              Contact Me
            </Button>
            {scheduleLabel ? <Button href="/contact" variant="secondary" icon={<CalendarDays className="h-4 w-4" />}>{scheduleLabel}</Button> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
