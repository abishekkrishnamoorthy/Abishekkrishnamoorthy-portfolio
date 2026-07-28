import type { ReactElement } from "react";

type HeroSocialLink = { label: string; href: string; icon: ReactElement };

export function HeroAvailabilityRow({
  status,
  socials,
}: {
  status?: string;
  socials: HeroSocialLink[];
}) {
  if (!status && !socials.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
      {status ? (
        <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-gold)]" aria-hidden="true" />
          {status}
        </p>
      ) : null}
      {socials.length ? (
        <div className="flex items-center gap-3">
          {socials.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:border-[rgba(232,163,61,0.4)] hover:text-[var(--accent-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-gold)]"
            >
              {link.icon}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
