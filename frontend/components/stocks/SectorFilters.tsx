"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { activePillTransition } from "@/lib/motion/presets";

interface SectorFiltersProps {
  sectors: string[];
  selected: string | null;
  onSelect: (sector: string | null) => void;
}

export function SectorFilters({
  sectors,
  selected,
  onSelect,
}: SectorFiltersProps) {
  const chips: Array<string | null> = [null, ...sectors];
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Sector filters"
    >
      {chips.map((sector) => {
        const isActive = selected === sector;
        return (
          <button
            key={sector ?? "all"}
            type="button"
            onClick={() => onSelect(sector)}
            aria-pressed={isActive}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-[color,border-color,background-color,transform] duration-200 hover:-translate-y-0.5 active:scale-[0.97]",
              isActive
                ? "border border-transparent text-brand-ink"
                : "border border-line bg-elevated text-fg-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {isActive ? (
              <motion.span
                aria-hidden
                layoutId="sector-active-pill"
                transition={activePillTransition(Boolean(reduceMotion))}
                className="absolute inset-0 rounded-full bg-brand shadow-glow"
              />
            ) : null}
            <span className="relative">{sector ?? "All"}</span>
          </button>
        );
      })}
    </div>
  );
}
