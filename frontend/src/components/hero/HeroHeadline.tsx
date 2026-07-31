export function HeroHeadline({ base, highlight }: { base: string; highlight: string }) {
  return (
    <h1 className="text-[clamp(2.5rem,9vw,3.2rem)] font-black leading-[0.9] tracking-[-0.04em] text-white md:text-[clamp(4rem,6vw,5.8rem)] md:font-extrabold md:leading-[0.92] lg:text-[clamp(4rem,5vw,5.3rem)]">
      <span className="mx-auto block max-w-[10.5ch] md:mx-0 md:max-w-[9.8ch] lg:max-w-[10.8ch] lg:[text-wrap:balance]">{base}</span>
      <span className="mx-auto block max-w-full text-[clamp(2rem,8vw,3.2rem)] text-[var(--accent-gold)] min-[360px]:whitespace-nowrap md:mx-0 md:w-auto md:max-w-[12.6ch] md:whitespace-normal md:text-[1em] lg:max-w-full">{highlight}</span>
    </h1>
  );
}
