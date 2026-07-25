"use client";

import { Copy } from "lucide-react";

export function ProjectStructureBlock({ value }: { value: string }) {
  return (
    <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[#0f0f0f] p-5">
      <button aria-label="Copy project structure" className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-[var(--accent-gold)]" onClick={() => navigator.clipboard.writeText(value)}>
        <Copy className="h-4 w-4" />
      </button>
      <pre className="overflow-x-auto pr-8 font-mono text-sm leading-7 text-[var(--text-secondary)]">{value}</pre>
    </div>
  );
}
