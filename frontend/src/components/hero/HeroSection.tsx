"use client";

import { BriefcaseBusiness, Code2, Mail } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactElement } from "react";
import { HeroAvailabilityRow } from "@/components/hero/HeroAvailabilityRow";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroCTAGroup } from "@/components/hero/HeroCTAGroup";
import { HeroDescription } from "@/components/hero/HeroDescription";
import { HeroEyebrow } from "@/components/hero/HeroEyebrow";
import { HeroHeadline } from "@/components/hero/HeroHeadline";
import { HeroPortrait } from "@/components/hero/HeroPortrait";
import { heroMotion } from "@/components/hero/hero.tokens";
import type { HomeHero } from "@/types/home.types";

type HeroSocialLink = { label: string; href: string; icon: ReactElement };
type HeroMotionStep = Exclude<keyof typeof heroMotion, "container">;

function motionProps(shouldAnimate: boolean, key: HeroMotionStep) {
  const variant = heroMotion[key];
  if (!shouldAnimate) return {};
  return {
    initial: variant.initial,
    animate: variant.animate,
    transition: variant.transition,
  };
}

export function HeroSection({ hero }: { hero: HomeHero }) {
  const reduceMotion = useReducedMotion();
  const hasAnimated = useRef(false);
  const shouldAnimate = !reduceMotion && !hasAnimated.current;
  const socialLinks = [
    hero.socialLinks.linkedIn ? { label: "LinkedIn", href: hero.socialLinks.linkedIn, icon: <BriefcaseBusiness className="h-4 w-4" /> } : null,
    hero.socialLinks.gitHub ? { label: "GitHub", href: hero.socialLinks.gitHub, icon: <Code2 className="h-4 w-4" /> } : null,
    hero.socialLinks.email ? { label: "Email", href: `mailto:${hero.socialLinks.email}`, icon: <Mail className="h-4 w-4" /> } : null,
  ].filter((link): link is HeroSocialLink => Boolean(link));

  useEffect(() => {
    hasAnimated.current = true;
  }, []);

  return (
    <section className="hero-section relative isolate min-h-[calc(100svh-68px)] overflow-hidden py-0 [--hero-glow-x:50%] [--hero-glow-y:32%] md:min-h-[calc(100vh-68px)] md:[--hero-glow-x:min(82vw,calc(50%_+_430px))] md:[--hero-glow-y:clamp(96px,16vh,180px)]">
      <HeroBackground backgroundUrl={hero.backgroundUrl} />
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-68px)] w-[93%] max-w-[1440px] grid-cols-1 content-start gap-0 pt-[clamp(52px,10svh,84px)] md:min-h-[calc(100vh-68px)] md:w-full md:grid-cols-[minmax(0,60fr)_minmax(300px,40fr)] md:items-end md:gap-8 md:px-[clamp(24px,6vw,96px)] md:pt-[clamp(64px,10vh,120px)] lg:grid-cols-[minmax(0,55fr)_minmax(360px,45fr)] lg:gap-12">
        <motion.div className="relative z-20 max-w-full md:max-w-[min(720px,100%)] md:self-center md:pb-[clamp(40px,8vh,96px)]" {...(shouldAnimate ? heroMotion.container : {})}>
          <motion.div {...motionProps(shouldAnimate, "eyebrow")}>
            <HeroEyebrow text={hero.roleBadge} />
          </motion.div>
          <motion.div className="mt-4 md:mt-5" {...motionProps(shouldAnimate, "headline")}>
            <HeroHeadline base={hero.headline} highlight={hero.highlightedHeadline} />
          </motion.div>
          <motion.div className="mt-6 md:mt-8" {...motionProps(shouldAnimate, "description")}>
            <HeroDescription text={hero.subheadline} />
          </motion.div>
          <motion.div className="mt-8 md:mt-10" {...motionProps(shouldAnimate, "ctas")}>
            <HeroCTAGroup primaryLabel={hero.cta.primaryLabel} secondaryLabel={hero.cta.secondaryLabel} />
          </motion.div>
          <motion.div className="mt-6 md:mt-7" {...motionProps(shouldAnimate, "availability")}>
            <HeroAvailabilityRow status={hero.status.enabled ? hero.status.text : undefined} socials={socialLinks} />
          </motion.div>
        </motion.div>
        <motion.div className="relative z-10 hidden min-h-[360px] items-end justify-center md:flex md:min-h-[clamp(520px,62vh,760px)] md:justify-end md:self-end" {...motionProps(shouldAnimate, "portrait")}>
          <HeroPortrait src={hero.portraitUrl} alt={hero.portraitAlt} />
        </motion.div>
      </div>
    </section>
  );
}
