"use client";

import { motion, useReducedMotion } from "framer-motion";
import { heroMotion } from "@/components/hero/hero.tokens";

export function HeroGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-[var(--hero-glow-x)] top-[var(--hero-glow-y)] h-[clamp(360px,46vw,760px)] w-[clamp(360px,46vw,760px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,163,61,0.38)_0%,rgba(212,175,55,0.18)_34%,rgba(212,175,55,0.06)_58%,transparent_72%)] blur-3xl"
      initial={reduceMotion ? false : heroMotion.glow.initial}
      animate={reduceMotion ? undefined : { opacity: [1, 0.86, 1], scale: [1, 1.035, 1] }}
      transition={reduceMotion ? undefined : { duration: 9, ease: "easeInOut", repeat: Infinity }}
    />
  );
}
