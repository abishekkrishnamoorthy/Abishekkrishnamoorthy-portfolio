import { ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";

export function HeroCTAGroup({
  primaryLabel,
  secondaryLabel,
}: {
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
      <Button
        className="min-h-[52px] w-full px-8 text-base font-semibold shadow-[0_0_34px_rgba(212,175,55,0.18),inset_0_1px_0_rgba(255,255,255,0.28)] hover:shadow-[0_0_46px_rgba(212,175,55,0.28),inset_0_1px_0_rgba(255,255,255,0.32)] md:min-h-14 md:w-auto"
        href="/projects"
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="right"
      >
        {primaryLabel}
      </Button>
      <Button
        className="min-h-[52px] w-full px-8 text-base font-semibold hover:border-[rgba(212,175,55,0.72)] md:min-h-14 md:w-auto"
        href="/contact"
        variant="secondary"
      >
        {secondaryLabel}
      </Button>
    </div>
  );
}
