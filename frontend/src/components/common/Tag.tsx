export function Tag({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
      {icon}
      {label}
    </span>
  );
}
