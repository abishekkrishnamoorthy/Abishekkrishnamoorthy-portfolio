import Image from "next/image";
import type { ProjectHeader, ProjectHeaderShowcaseImage } from "@/types/project.types";

type ShowcaseCardProps = {
  slot: ProjectHeaderShowcaseImage | undefined;
  order: ProjectHeaderShowcaseImage["order"];
  className: string;
  sizes: string;
};

function ShowcaseCard({ slot, order, className, sizes }: ShowcaseCardProps) {
  const label = slot?.label?.trim() || "Showcase";

  return (
    <article className={`absolute rounded-2xl border border-[rgba(232,163,61,0.28)] bg-[rgba(12,14,19,0.94)] p-2.5 shadow-[0_22px_54px_rgba(0,0,0,0.42),0_0_32px_rgba(232,163,61,0.12)] transition duration-500 hover:z-[70] hover:-translate-y-1 hover:border-[rgba(232,163,61,0.62)] ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[var(--bg-surface-alt)]">
        {slot?.imageUrl ? (
          <Image src={slot.imageUrl} alt={label} fill className="object-cover" sizes={sizes} />
        ) : (
          <div className="grid h-full place-items-center px-3 text-center">
            <div>
              <p className="text-xs font-semibold text-white">Image Card {order}</p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">No Image Uploaded</p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8">
          <p className="truncate text-[11px] font-semibold text-white">{label}</p>
        </div>
      </div>
    </article>
  );
}

function slotFor(header: ProjectHeader | undefined, order: ProjectHeaderShowcaseImage["order"]) {
  return header?.showcaseImages.find((image) => image.order === order);
}

export function ProjectsHero({ header }: { header?: ProjectHeader }) {
  const slot1 = slotFor(header, 1);
  const slot2 = slotFor(header, 2);
  const slot3 = slotFor(header, 3);
  const slot4 = slotFor(header, 4);
  const slot5 = slotFor(header, 5);

  return (
    <section className="section-container relative grid items-center gap-10 overflow-hidden md:grid-cols-[2fr_3fr]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/graphics/grid.svg')] bg-[length:620px_auto] bg-[center_top] opacity-[0.045]" />
      <div className="pointer-events-none absolute right-4 top-14 h-72 w-72 rounded-full bg-[rgba(232,163,61,0.08)] blur-3xl" />
      <div className="relative z-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">{header?.badge ?? "My Work"}</p>
        <h1 className="max-w-2xl text-[28px] font-bold leading-9 text-white md:text-[40px] md:leading-[56px]">
          {header?.title ?? "Projects that solve"} <span className="text-[var(--accent-gold)]">{header?.highlightText ?? "real world problems."}</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)]">{header?.description ?? "A focused catalog of full-stack, AI, cloud, frontend, backend, and learning projects."}</p>
      </div>

      <div className="relative z-10 h-[300px] min-w-0 sm:h-[340px] md:h-[390px]">
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-56 w-72 rounded-full bg-[rgba(232,163,61,0.16)] blur-3xl" />
        <ShowcaseCard slot={slot1} order={1} sizes="(max-width: 639px) 190px, 280px" className="left-[1%] top-[9%] z-20 h-[152px] w-[212px] -rotate-6 sm:h-[178px] sm:w-[248px] md:left-[2%] md:top-[11%] md:h-[198px] md:w-[282px]" />
        <ShowcaseCard slot={slot2} order={2} sizes="(max-width: 639px) 216px, 300px" className="left-[23%] top-[23%] z-40 h-[166px] w-[232px] rotate-3 sm:h-[194px] sm:w-[274px] md:left-[27%] md:top-[25%] md:h-[218px] md:w-[308px]" />
        <ShowcaseCard slot={slot3} order={3} sizes="(max-width: 639px) 200px, 270px" className="right-[1%] top-[3%] z-30 h-[146px] w-[204px] rotate-6 sm:h-[172px] sm:w-[240px] md:right-[1%] md:top-[4%] md:h-[192px] md:w-[270px]" />
        <ShowcaseCard slot={slot4} order={4} sizes="(max-width: 639px) 132px, 176px" className="left-[35%] bottom-[1%] z-50 h-[98px] w-[140px] rotate-[-8deg] sm:h-[116px] sm:w-[164px] md:left-[39%] md:bottom-[2%] md:h-[132px] md:w-[184px]" />
        <ShowcaseCard slot={slot5} order={5} sizes="(max-width: 639px) 150px, 210px" className="right-0 top-[39%] z-[60] h-[116px] w-[162px] rotate-[-5deg] sm:h-[138px] sm:w-[194px] md:right-0 md:top-[39%] md:h-[154px] md:w-[218px]" />
      </div>
    </section>
  );
}
