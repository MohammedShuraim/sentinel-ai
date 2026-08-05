import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type CardVariant = "surface" | "elevated" | "glass";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  /** Hide the premium red accent line on top. */
  accent?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  surface: "border-line bg-elevated shadow-card",
  elevated: "border-line bg-elevated shadow-card",
  glass: "glass",
};

export function Card({
  className,
  variant = "surface",
  interactive = false,
  accent = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card border p-6",
        variantStyles[variant],
        interactive && "card-hover cursor-pointer",
        className,
      )}
      {...props}
    >
      {accent ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-80"
        />
      ) : null}
      {children}
    </div>
  );
}
