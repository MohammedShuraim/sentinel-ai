import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/common/Spinner";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, loading, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 disabled:pointer-events-none disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export { Button };
