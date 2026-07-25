import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`min-h-11 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
    {...props}
  />
));

Input.displayName = "Input";
