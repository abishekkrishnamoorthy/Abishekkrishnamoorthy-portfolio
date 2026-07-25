import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-surface p-6 text-center">
      <Inbox className="mb-3 text-muted" size={28} />
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? <p className="mt-1 max-w-md text-sm text-secondary">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
