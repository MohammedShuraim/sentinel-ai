import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type CardVariant = "surface" | "elevated" | "glass";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  surface: "border-line bg-surface shadow-card",
  elevated: "border-line bg-elevated shadow-card",
  glass: "glass",
};

export function Card({
  className,
  variant = "surface",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border p-6",
        variantStyles[variant],
        interactive && "card-hover cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}
