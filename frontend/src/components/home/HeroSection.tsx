import { ArrowRight, BriefcaseBusiness, Code2, Mail } from "lucide-react";
import Image from "next/image";
import type { ReactElement } from "react";
import { Button } from "@/components/common/Button";
import type { HomeHero } from "@/types/home.types";

type HeroSocialLink = { label: string; href: string; icon: ReactElement };

export function HeroSection({ hero }: { hero: HomeHero }) {
  const socialLinks = [
    hero.socialLinks.linkedIn ? { label: "LinkedIn", href: hero.socialLinks.linkedIn, icon: <BriefcaseBusiness className="h-4 w-4" /> } : null,
    hero.socialLinks.gitHub ? { label: "GitHub", href: hero.socialLinks.gitHub, icon: <Code2 className="h-4 w-4" /> } : null,
    hero.socialLinks.email ? { label: "Email", href: `mailto:${hero.socialLinks.email}`, icon: <Mail className="h-4 w-4" /> } : null,
  ].filter((link): link is HeroSocialLink => Boolean(link));

  return (
    <section className="hero-section section-container relative grid min-h-[calc(100vh-68px)] items-center gap-12 overflow-hidden md:grid-cols-[minmax(0,500px)_minmax(420px,1fr)] lg:gap-20 xl:grid-cols-[minmax(0,540px)_minmax(520px,1fr)]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/graphics/grid.svg')] bg-[length:680px_auto] bg-[center_top] opacity-[0.055]" />
      <div className="pointer-events-none absolute -right-28 top-12 h-[520px] w-[520px] rounded-full bg-[rgba(232,163,61,0.055)] blur-3xl" />
      <div className="relative z-10 max-w-[520px]">
        {hero.roleBadge ? <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-gold)]">{hero.roleBadge}</p> : null}
        <h1 className="max-w-[540px] text-[28px] font-bold leading-9 text-white md:text-[38px] md:leading-[50px] xl:text-[40px] xl:leading-[54px]">
          {hero.headline}
          <span className="block text-[var(--accent-gold)]">{hero.highlightedHeadline}</span>
        </h1>
        <p className="mt-5 max-w-[470px] text-[15px] leading-7 text-[var(--text-secondary)] md:text-base">{hero.subheadline}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button className="min-h-10 px-5" href="/projects" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">{hero.cta.primaryLabel}</Button>
          <Button className="min-h-10 px-5" href="/contact" variant="secondary">{hero.cta.secondaryLabel}</Button>
        </div>
        {(hero.status.enabled && hero.status.text) || socialLinks.length ? (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {hero.status.enabled && hero.status.text ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-gold)]" aria-hidden="true" />
                {hero.status.text}
              </p>
            ) : null}
            {socialLinks.length ? (
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => (
                  <a key={link.label} href={link.href} aria-label={link.label} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:border-[rgba(232,163,61,0.4)] hover:text-[var(--accent-gold)]">
                    {link.icon}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="relative z-0 mx-auto h-[390px] w-full max-w-[540px] md:h-[540px] md:max-w-[590px] md:justify-self-end md:translate-x-8 lg:h-[590px] lg:max-w-[650px] xl:translate-x-14">
        <div className="absolute left-[56%] top-8 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[url('/assets/graphics/mesh-glow.png')] bg-cover opacity-55 blur-2xl md:h-[470px] md:w-[470px] md:opacity-60" />
        <div className="absolute left-[48%] top-16 h-[260px] w-[360px] -translate-x-1/2 rounded-full bg-[rgba(232,163,61,0.12)] blur-3xl md:h-[360px] md:w-[520px]" />
        <div className="absolute inset-x-[-22vw] bottom-0 h-[64%] md:left-[-18vw] md:right-[-8vw] md:h-[68%] lg:left-[-14vw]">
          <Image src="/assets/hero/skyline.png" alt="" fill className="object-cover object-bottom opacity-[0.68]" priority sizes="(min-width: 1024px) 62vw, (min-width: 768px) 58vw, 125vw" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[97%] md:left-10 lg:left-16">
          <Image src="/assets/hero/portriat.png" alt="Abishek Krishnamoorthy portrait" fill className="object-contain object-bottom" priority sizes="(min-width: 1024px) 44vw, (min-width: 768px) 48vw, 88vw" />
        </div>
        <Image src="/assets/graphics/dots.svg" alt="" width={132} height={132} className="absolute right-2 top-12 opacity-40 md:right-2 md:top-20" />
        <div className="pointer-events-none absolute inset-x-[-22vw] bottom-0 h-32 bg-gradient-to-t from-[var(--bg-base)] via-[rgba(10,10,10,0.74)] to-transparent md:h-40" />
        <div className="pointer-events-none absolute inset-y-0 left-[-22vw] w-44 bg-gradient-to-r from-[var(--bg-base)] via-[rgba(10,10,10,0.64)] to-transparent md:w-56" />
        <div className="pointer-events-none absolute inset-y-0 right-[-22vw] w-28 bg-gradient-to-l from-[var(--bg-base)] to-transparent md:hidden" />
      </div>
    </section>
  );
}
