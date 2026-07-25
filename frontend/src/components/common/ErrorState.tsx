import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";

export function ErrorState({ message = "Something went wrong.", onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg-surface-alt)] text-[var(--accent-gold)]">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-white">Unable to load this section</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">{message}</p>
      <Button className="mt-5" variant="secondary" onClick={onRetry}>Retry</Button>
    </div>
  );
}
