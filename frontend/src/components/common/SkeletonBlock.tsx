import { cn } from "@/lib/utils";

export function SkeletonBlock({ variant = "card", count = 1 }: { variant?: "card" | "text" | "avatar" | "row"; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(90deg,var(--bg-surface),var(--bg-surface-alt),var(--bg-surface))] bg-[length:200%_100%]",
            variant === "card" && "h-80",
            variant === "row" && "h-64 lg:h-56",
            variant === "text" && "h-5 rounded-md",
            variant === "avatar" && "h-28 w-28 rounded-full",
          )}
        />
      ))}
    </>
  );
}
