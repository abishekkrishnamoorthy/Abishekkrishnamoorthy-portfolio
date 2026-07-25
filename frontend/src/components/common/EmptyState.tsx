import { Button } from "@/components/common/Button";

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center">
      {icon ? <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-surface-alt)] text-[var(--accent-gold)]">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">{description}</p> : null}
      {action ? <Button className="mt-5" variant="secondary" onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}
