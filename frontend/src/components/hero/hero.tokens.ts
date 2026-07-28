export const heroImageSizes = {
  background: "(min-width: 1280px) 100vw, (min-width: 768px) 100vw, 100vw",
  portrait: "(min-width: 1280px) 42vw, (min-width: 768px) 38vw, 92vw",
};

export const heroMotion = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  eyebrow: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  headline: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, ease: "easeOut" as const, delay: 0.1 },
  },
  description: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: "easeOut" as const, delay: 0.3 },
  },
  ctas: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.45, ease: "easeOut" as const, delay: 0.4 },
  },
  availability: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut" as const, delay: 0.5 },
  },
  portrait: {
    initial: { opacity: 0, scale: 1.02 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.75, ease: "easeOut" as const, delay: 0.2 },
  },
  glow: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.85, ease: "easeOut" as const, delay: 0.25 },
  },
};
