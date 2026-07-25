import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className = "", children, ...props }, ref) => (
  <select
    ref={ref}
    className={`min-h-11 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";
