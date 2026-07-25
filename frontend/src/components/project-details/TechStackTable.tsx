export function TechStackTable({ rows }: { rows: { category: string; technologies: string }[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--bg-surface-alt)] text-white">
          <tr><th className="p-4">Category</th><th className="p-4">Technologies</th></tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
          {rows.map((row) => <tr key={row.category}><td className="p-4 font-medium text-white">{row.category}</td><td className="p-4">{row.technologies}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
