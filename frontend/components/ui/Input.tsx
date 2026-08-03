import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error = false, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={error || undefined}
      className={cn(
        "flex h-10 w-full rounded-xl border bg-surface px-3.5 text-sm text-fg shadow-sm transition-colors placeholder:text-fg-subtle focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-loss/60 focus:border-loss/70 focus:ring-loss/25"
          : "border-line focus:border-brand/60 focus:ring-brand/25",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
