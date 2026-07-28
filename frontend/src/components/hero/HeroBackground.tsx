import Image from "next/image";
import { HeroGlow } from "@/components/hero/HeroGlow";
import { heroImageSizes } from "@/components/hero/hero.tokens";

export function HeroBackground({ backgroundUrl }: { backgroundUrl: string }) {
  const hasBackground = Boolean(backgroundUrl?.trim());

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[#090909] md:bg-[var(--bg-base)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.2),transparent_24%),radial-gradient(circle_at_8%_18%,rgba(232,163,61,0.06),transparent_26%),radial-gradient(circle_at_50%_74%,rgba(212,175,55,0.05),transparent_34%),linear-gradient(180deg,#090909_0%,#0d0d0f_48%,#08080a_100%)] md:hidden" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.7)_0_1px,transparent_1px_34px),repeating-linear-gradient(90deg,rgba(255,255,255,0.7)_0_1px,transparent_1px_34px)] md:hidden" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0_0.45px,transparent_0.7px)] [background-size:4px_4px] md:hidden" />
      {hasBackground ? (
        <Image
          src={backgroundUrl}
          alt=""
          fill
          priority
          sizes={heroImageSizes.background}
          className="hidden translate-y-[18%] scale-[1.04] object-cover object-[center_bottom] opacity-[0.46] md:block lg:translate-y-0"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(11,11,15,0.12)_48%,rgba(11,11,15,0.72)_84%,var(--bg-base)_100%)]" />
      <HeroGlow />
      <div className="absolute inset-x-[8vw] bottom-[10%] h-28 rounded-full bg-[rgba(212,175,55,0.08)] blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(11,11,15,0.42)_78%,rgba(11,11,15,0.86)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[36vw] bg-gradient-to-r from-[var(--bg-base)] via-[rgba(11,11,15,0.82)] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[28vw] bg-gradient-to-l from-[rgba(11,11,15,0.72)] to-transparent" />
    </div>
  );
}
