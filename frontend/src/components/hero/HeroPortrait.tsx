import Image from "next/image";
import { heroImageSizes } from "@/components/hero/hero.tokens";

export function HeroPortrait({ src, alt }: { src: string; alt: string }) {
  const hasPortrait = Boolean(src?.trim());

  return (
    <div className="relative mx-auto aspect-[4/5] h-full w-auto overflow-visible md:mx-0 md:h-auto md:w-[clamp(310px,31vw,515px)] lg:w-[clamp(260px,25vw,420px)]">
      <div
        className="hero-portrait-mask absolute inset-0 md:bottom-[-7%]"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 84%, transparent 100%), linear-gradient(to right, transparent 0%, black 18%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 84%, transparent 100%), linear-gradient(to right, transparent 0%, black 18%, black 100%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        {hasPortrait ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes={heroImageSizes.portrait}
            className="object-contain object-bottom md:scale-[1.06] lg:scale-100"
          />
        ) : null}
      </div>
    </div>
  );
}
