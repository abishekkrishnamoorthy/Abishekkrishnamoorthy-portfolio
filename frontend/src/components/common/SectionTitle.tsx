import { ArrowRight } from "lucide-react";
import Link from "next/link";

type SectionTitleProps = {
  eyebrow: string;
  title: React.ReactNode;
  action?: { label: string; href: string };
};

export function SectionTitle({ eyebrow, title, action }: SectionTitleProps) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-gold)]">{eyebrow}</p>
        <h2 className="max-w-3xl text-[22px] font-bold leading-7 text-white md:text-[28px] md:leading-9">{title}</h2>
      </div>
      {action ? (
        <Link href={action.href} className="hidden items-center gap-2 text-sm font-medium text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] md:inline-flex">
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
