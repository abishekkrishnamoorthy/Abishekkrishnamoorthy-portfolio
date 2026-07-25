export function IconLink({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a
      aria-label={label}
      href={href || "#"}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:border-[rgba(232,163,61,0.4)] hover:text-[var(--accent-gold)]"
    >
      {icon}
    </a>
  );
}
