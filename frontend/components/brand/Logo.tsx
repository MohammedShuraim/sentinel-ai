import { cn } from "@/lib/utils/cn";

export type LogoSize = "sm" | "md" | "lg";

export interface LogoProps {
  size?: LogoSize;
  withWordmark?: boolean;
  className?: string;
}

const markSizes: Record<LogoSize, string> = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-11 w-11 rounded-2xl",
};

const wordmarkSizes: Record<LogoSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export function Logo({
  size = "md",
  withWordmark = true,
  className,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center bg-gradient-to-br from-brand to-brand-strong shadow-glow ring-1 ring-brand/40",
          markSizes[size],
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3/5 w-3/5"
          fill="none"
          stroke="#ffffff"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 17.5 8.5 12l4 3 8-10" />
          <path d="M15.5 5h5v5" />
        </svg>
      </span>
      {withWordmark ? (
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-fg",
            wordmarkSizes[size],
          )}
        >
          Sentellent
        </span>
      ) : null}
    </span>
  );
}
