"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { fadeUp, staggerContainer } from "@/lib/motion/presets";

export const dashboardContainer: Variants = staggerContainer;
export const dashboardItem: Variants = fadeUp;

interface SectionProps {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({
  title,
  actionHref,
  actionLabel,
  className,
  children,
}: SectionProps) {
  return (
    <motion.section
      variants={dashboardItem}
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-base font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="shrink-0 text-xs font-medium text-brand underline-offset-4 hover:underline"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </motion.section>
  );
}
