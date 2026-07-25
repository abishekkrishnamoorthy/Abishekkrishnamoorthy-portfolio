import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  "aria-label"?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  href,
  external,
  onClick,
  disabled,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-gold)] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none",
    size === "sm" ? "min-h-9 px-4 text-sm" : "min-h-11 px-5 text-[15px]",
    variant === "primary" && "bg-[var(--accent-gold)] text-black hover:bg-[var(--accent-gold-hover)]",
    variant === "secondary" && "border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-white hover:border-[rgba(232,163,61,0.4)] hover:bg-[var(--bg-surface-alt)]",
    variant === "ghost" && "text-[var(--text-secondary)] hover:text-[var(--accent-gold)]",
    className,
  );
  const content = (
    <>
      {icon && iconPosition === "left" ? icon : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? icon : null}
    </>
  );
  if (href) {
    const isExternal = external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if (isExternal) {
      return (
        <a className={classes} href={href || "#"} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link className={classes} href={href} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button className={classes} onClick={onClick} disabled={disabled} type={type} {...props}>
      {content}
    </button>
  );
}
