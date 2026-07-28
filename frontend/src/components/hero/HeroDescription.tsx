export function HeroDescription({ text }: { text: string }) {
  return <p className="max-w-[26ch] text-lg leading-[1.75] text-[var(--text-secondary)] [text-wrap:balance] md:max-w-[min(640px,48vw)] md:text-[19px] md:leading-[1.65]">{text}</p>;
}
