import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/common/Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand font-semibold text-brand-ink shadow-glow hover:bg-brand-strong focus-visible:ring-brand/50",
  secondary:
    "border border-line bg-elevated text-fg hover:border-line-strong hover:bg-overlay focus-visible:ring-brand/40",
  outline:
    "border border-line-strong bg-transparent text-fg hover:bg-white/[0.04] focus-visible:ring-brand/40",
  ghost:
    "text-fg-muted hover:bg-white/[0.05] hover:text-fg focus-visible:ring-brand/40",
  destructive:
    "border border-loss/30 bg-loss/15 font-medium text-loss hover:bg-loss/20 focus-visible:ring-loss/50",
  link: "h-auto px-0 text-brand underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-11 gap-2 rounded-xl px-5 text-sm",
  icon: "h-10 w-10 rounded-xl p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        variant !== "link" && sizeStyles[size],
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
