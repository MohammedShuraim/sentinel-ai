"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SparkIcon } from "@/components/common/icons";
import {
  EASE_OUT,
  fadeUp,
  scaleIn,
  staggerContainer,
} from "@/lib/motion/presets";

const ROADMAP = [
  "Login",
  "Complete AI Profile",
  "Receive AI Recommendations",
  "Buy Your First Stock",
  "Track Portfolio Performance",
] as const;

export function PortfolioEmptyState() {
  const reduceMotion = useReducedMotion();
  const item = reduceMotion ? undefined : fadeUp;
  const scale = reduceMotion ? undefined : scaleIn;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface/70 px-5 py-10 shadow-[0_0_0_1px_rgb(214_40_40/0.06)] backdrop-blur-xl sm:px-8 sm:py-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_0%,rgb(214_40_40/0.08),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_40%_at_85%_20%,rgb(214_40_40/0.08),transparent_70%)]"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <motion.div variants={scale} className="relative">
          <PortfolioIllustration reduceMotion={Boolean(reduceMotion)} />
        </motion.div>

        <motion.div variants={item} className="flex flex-col gap-2.5">
          <p className="text-xs font-medium uppercase tracking-widest text-brand">
            Getting started
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Build Your Investment Portfolio
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-fg-muted">
            You haven&apos;t purchased any stocks yet.
            <br />
            Discover AI-powered investment opportunities or browse the market to
            begin building your portfolio.
          </p>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-fg-subtle">
            This portfolio will automatically update after your first purchase.
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <Link href="/recommendations" className="sm:min-w-[14rem]">
            <Button
              size="lg"
              className="w-full px-6 transition-transform duration-200 hover:-translate-y-0.5"
              aria-label="View AI Recommendations"
            >
              <SparkIcon className="h-4 w-4" />
              View AI Recommendations
            </Button>
          </Link>
          <Link href="/stocks" className="sm:min-w-[12rem]">
            <Button
              size="lg"
              variant="secondary"
              className="w-full px-6 transition-transform duration-200 hover:-translate-y-0.5"
              aria-label="Browse Stocks"
            >
              <ChartIcon className="h-4 w-4" />
              Browse Stocks
            </Button>
          </Link>
        </motion.div>

        <motion.ol
          variants={item}
          aria-label="How your portfolio journey works"
          className="relative mt-2 flex w-full max-w-xl flex-col gap-0"
        >
          {ROADMAP.map((label, index) => {
            const isLast = index === ROADMAP.length - 1;
            const accent = index % 2 === 0 ? "brand" : "ai";
            return (
              <li key={label} className="relative flex gap-4 pb-5 last:pb-0">
                {!isLast ? (
                  <span
                    aria-hidden
                    className="absolute left-[0.4375rem] top-3 h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-line-strong to-transparent"
                  />
                ) : null}
                <span
                  aria-hidden
                  className={
                    accent === "brand"
                      ? "relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand shadow-[0_0_12px_rgb(214_40_40/0.55)]"
                      : "relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-ai shadow-[0_0_12px_rgb(214_40_40/0.55)]"
                  }
                />
                <div className="flex min-w-0 flex-col items-start gap-0.5 pt-0 text-left">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-fg-subtle">
                    Step {index + 1}
                  </span>
                  <span className="text-sm font-medium text-fg">{label}</span>
                </div>
              </li>
            );
          })}
        </motion.ol>

        <motion.p
          variants={item}
          className="max-w-lg text-xs leading-relaxed text-fg-subtle"
        >
          Your portfolio grows automatically as you invest. Every stock you
          purchase will appear here together with performance tracking,
          allocation insights, and AI-assisted analysis.
        </motion.p>
      </div>
    </motion.div>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15l3-4 3 2 5-7" />
    </svg>
  );
}

function PortfolioIllustration({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div aria-hidden className="relative grid h-36 w-36 place-items-center sm:h-40 sm:w-40">
      <span className="absolute inset-4 rounded-full bg-brand/10 blur-2xl" />
      <span className="absolute inset-8 rounded-full bg-ai/15 blur-xl" />

      <motion.div
        className="absolute left-2 top-6 rounded-lg border border-line/80 bg-elevated/90 px-2 py-1 text-[9px] font-medium text-fg-muted shadow-sm backdrop-blur"
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: EASE_OUT } }
        }
      >
        RELIANCE
      </motion.div>
      <motion.div
        className="absolute bottom-8 right-1 rounded-lg border border-ai/30 bg-ai-soft/80 px-2 py-1 text-[9px] font-medium text-ai shadow-sm backdrop-blur"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, 5, 0],
                transition: { duration: 4.5, repeat: Infinity, ease: EASE_OUT, delay: 0.4 },
              }
        }
      >
        TCS
      </motion.div>

      <svg
        viewBox="0 0 120 120"
        className="relative h-28 w-28 sm:h-32 sm:w-32"
        fill="none"
      >
        <circle
          cx="60"
          cy="60"
          r="48"
          className="stroke-line-strong"
          strokeWidth={1.2}
          strokeDasharray="3 7"
        />
        {/* briefcase / portfolio */}
        <rect
          x="34"
          y="48"
          width="52"
          height="36"
          rx="6"
          className="fill-elevated stroke-brand/70"
          strokeWidth={2}
        />
        <path
          d="M48 48v-4a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v4"
          className="stroke-brand/70"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d="M34 62h52"
          className="stroke-line"
          strokeWidth={1.5}
        />
        {/* mini chart */}
        <path
          d="M44 74l8-8 6 5 12-12"
          className="stroke-brand"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M62 59h8v8"
          className="stroke-brand"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* AI spark accent */}
        <g className="fill-ai">
          <path d="M88 34l1.4 4.2 4.2 1.4-4.2 1.4L88 45.2l-1.4-4.2-4.2-1.4 4.2-1.4L88 34Z" />
        </g>
      </svg>
    </div>
  );
}
