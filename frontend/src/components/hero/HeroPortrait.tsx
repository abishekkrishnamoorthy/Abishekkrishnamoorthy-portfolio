import Image from "next/image";
import { heroImageSizes } from "@/components/hero/hero.tokens";

export function HeroPortrait({ src, alt }: { src: string; alt: string }) {
  const hasPortrait = Boolean(src?.trim());

  return (
    <div className="relative mx-auto aspect-[4/5] w-[min(92vw,440px)] overflow-visible md:mx-0 md:w-[clamp(320px,34vw,560px)]">
      <div
        className="absolute inset-x-0 bottom-[-7%] top-0"
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
            className="object-cover object-top"
          />
        ) : null}
      </div>
    </div>
  );
}
