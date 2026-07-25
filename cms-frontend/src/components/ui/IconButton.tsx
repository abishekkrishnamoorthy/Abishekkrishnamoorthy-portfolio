import { type ButtonHTMLAttributes, forwardRef } from "react";

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(({ className = "", ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle bg-surface text-secondary transition hover:bg-surface-hover hover:text-primary disabled:opacity-50 ${className}`}
    {...props}
  />
));

IconButton.displayName = "IconButton";
