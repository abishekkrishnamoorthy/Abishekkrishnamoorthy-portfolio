export function HeroEyebrow({ text }: { text: string }) {
  if (!text) return null;
  return <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-gold)]">{text}</p>;
}

