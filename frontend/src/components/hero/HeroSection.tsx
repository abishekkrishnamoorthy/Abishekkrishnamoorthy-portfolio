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
    <section className="hero-section relative isolate -mt-16 overflow-hidden pb-8 pt-0 [--hero-glow-x:50%] [--hero-glow-y:36%] md:-mt-[68px] md:h-[90vh] md:min-h-[760px] md:max-h-[920px] md:pb-0 md:[--hero-glow-x:min(84vw,calc(50%_+_470px))] md:[--hero-glow-y:clamp(170px,24vh,240px)] lg:h-auto lg:min-h-[calc(100svh-68px)] lg:max-h-none">
      <HeroBackground backgroundUrl={hero.backgroundUrl} />
      <motion.div className="relative z-10 flex w-full justify-center pt-[84px] md:hidden" {...motionProps(shouldAnimate, "portrait")}>
        <div className="relative flex w-full max-w-full justify-center overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(100%,470px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 [background-image:repeating-radial-gradient(circle,transparent_0_17px,rgba(212,175,55,0.24)_18px_19px,transparent_20px_31px)] [mask-image:radial-gradient(circle,black_22%,transparent_72%)]" />
          <div className="hero-mobile-card-glow pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(212,175,55,0.2)] blur-[48px]" />
          <div className="hero-mobile-portrait-card relative z-10 aspect-[20/21] w-[clamp(250px,72vw,320px)] overflow-hidden rounded-[32px] border border-[rgba(212,175,55,0.72)] bg-[radial-gradient(circle_at_60%_38%,rgba(212,175,55,0.2),transparent_42%),linear-gradient(145deg,#15130d_0%,#0d0d0e_58%,#090909_100%)] shadow-[0_28px_70px_rgba(0,0,0,0.62),0_0_42px_rgba(212,175,55,0.14),inset_0_1px_0_rgba(255,235,174,0.08)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.48)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex h-[84%] items-end justify-center">
              <HeroPortrait src={hero.portraitUrl} alt={hero.portraitAlt} />
            </div>
          </div>
        </div>
      </motion.div>
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 content-start gap-0 px-4 pt-7 md:h-full md:min-h-0 md:grid-cols-[minmax(0,60fr)_minmax(280px,40fr)] md:items-end md:gap-7 md:px-6 md:pt-[clamp(96px,11vh,120px)] md:pb-0 lg:h-auto lg:min-h-[calc(100svh-68px)] lg:grid-cols-[minmax(0,56fr)_minmax(330px,44fr)] lg:gap-10 lg:px-8 lg:pb-[clamp(28px,4vh,48px)]">
        <motion.div className="relative z-20 min-w-0 max-w-full text-center md:max-w-[min(600px,100%)] md:self-center md:pb-[clamp(18px,3.8vh,44px)] md:text-left lg:max-w-[580px]" {...(shouldAnimate ? heroMotion.container : {})}>
          <motion.div {...motionProps(shouldAnimate, "eyebrow")}>
            <HeroEyebrow text={hero.roleBadge} />
          </motion.div>
          <motion.div className="mt-4" {...motionProps(shouldAnimate, "headline")}>
            <HeroHeadline base={hero.headline} highlight={hero.highlightedHeadline} />
          </motion.div>
          <motion.div className="mt-5 md:mt-6" {...motionProps(shouldAnimate, "description")}>
            <HeroDescription text={hero.subheadline} />
          </motion.div>
          <motion.div className="mt-6 md:mt-4 lg:mt-6" {...motionProps(shouldAnimate, "ctas")}>
            <HeroCTAGroup primaryLabel={hero.cta.primaryLabel} secondaryLabel={hero.cta.secondaryLabel} />
          </motion.div>
          <motion.div className="mt-5 md:mt-4" {...motionProps(shouldAnimate, "availability")}>
            <HeroAvailabilityRow status={hero.status.enabled ? hero.status.text : undefined} socials={socialLinks} />
          </motion.div>
        </motion.div>
        <motion.div className="pointer-events-none hidden min-h-0 items-end justify-end md:pointer-events-auto md:relative md:right-auto md:z-10 md:flex md:min-h-[clamp(460px,56vh,690px)] md:-translate-x-12 md:justify-end md:self-end md:opacity-100" {...motionProps(shouldAnimate, "portrait")}>
          <HeroPortrait src={hero.portraitUrl} alt={hero.portraitAlt} />
        </motion.div>
      </div>
    </section>
  );
}
