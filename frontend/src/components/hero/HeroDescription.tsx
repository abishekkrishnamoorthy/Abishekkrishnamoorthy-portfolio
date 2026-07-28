export function HeroDescription({ text }: { text: string }) {
  return <p className="mx-auto max-w-[90%] text-[clamp(16px,4.3vw,17px)] leading-[1.7] text-[#B8B8B8] [text-wrap:balance] md:mx-0 md:max-w-[min(640px,48vw)] md:text-[18px] md:leading-[1.62] md:text-[var(--text-secondary)] lg:max-w-[58ch]">{text}</p>;
}
