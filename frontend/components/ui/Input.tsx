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
        "flex h-10 w-full rounded-2xl border bg-elevated px-3.5 text-sm text-fg shadow-sm transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-fg-subtle focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-loss/60 focus:border-loss/70 focus:ring-loss/25"
          : "border-line focus:border-brand focus:ring-brand/30 focus:shadow-[0_0_0_1px_rgb(214_40_40/0.25),0_0_20px_rgb(214_40_40/0.12)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
