export function HeroHeadline({ base, highlight }: { base: string; highlight: string }) {
  return (
    <h1 className="max-w-[11ch] text-[clamp(3.5rem,16vw,4rem)] font-extrabold leading-[0.9] tracking-[-0.035em] text-white md:max-w-[12ch] md:text-[clamp(49px,6.6vw,91px)] md:leading-[0.99] md:tracking-normal">
      {base}
      <span className="block text-[var(--accent-gold)]">{highlight}</span>
    </h1>
  );
}
