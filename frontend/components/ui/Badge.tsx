import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "neutral"
  | "brand"
  | "profit"
  | "loss"
  | "warn"
  | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "border-line bg-elevated text-fg-muted",
  brand: "border-transparent bg-brand-soft text-brand",
  profit: "border-transparent bg-profit-soft text-profit",
  loss: "border-transparent bg-loss-soft text-loss",
  warn: "border-transparent bg-warn-soft text-warn",
  info: "border-transparent bg-info-soft text-info",
};

const dotStyles: Record<BadgeVariant, string> = {
  neutral: "bg-fg-muted",
  brand: "bg-brand",
  profit: "bg-profit",
  loss: "bg-loss",
  warn: "bg-warn",
  info: "bg-info",
};

export function Badge({
  className,
  variant = "neutral",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full animate-pulse-soft",
            dotStyles[variant],
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
