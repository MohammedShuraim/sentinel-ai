"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/brand/Logo";
import { SparkleIcon } from "@/components/common/icons";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  activePillTransition,
  fadeUp,
  sidebarSlideTransition,
  staggerContainer,
} from "@/lib/motion/presets";

interface NavItem {
  href: string;
  label: string;
  icon: (className: string) => React.ReactNode;
}

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (className) => (
      <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
        <path d="M3.5 10.5 12 3.5l8.5 7" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M9.5 20v-5.5h5V20" />
      </svg>
    ),
  },
  {
    href: "/stocks",
    label: "Stocks",
    icon: (className) => (
      <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
        <path d="M4 20V10" />
        <path d="M9.5 20V4" />
        <path d="M15 20v-8" />
        <path d="M20.5 20V7" />
      </svg>
    ),
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: (className) => (
      <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
        <rect x="3.5" y="8" width="17" height="12" rx="2" />
        <path d="M8.5 8V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8" />
        <path d="M3.5 13h17" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (className) => (
      <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5c-1.2 0-2.4-.3-3.4-.8L4 19.5l1.4-4.3a7.5 7.5 0 1 1 14.6-3.7Z" />
      </svg>
    ),
  },
  {
    href: "/recommendations",
    label: "Recommendations",
    icon: (className) => <SparkleIcon className={className} />,
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useReducedMotion();

  const visible = open || isDesktop;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <motion.aside
        initial={false}
        animate={{ x: visible ? 0 : "-100%" }}
        transition={
          reduceMotion ? { duration: 0.15 } : sidebarSlideTransition
        }
        className="fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-line bg-bg"
        aria-label="Primary"
      >
        <div className="flex h-topnav shrink-0 items-center border-b border-line px-5">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-fg-muted transition-[color,background-color,transform] hover:bg-white/[0.05] hover:text-fg active:scale-95 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-widest text-fg-subtle">
            Menu
          </p>
          <motion.div
            className="flex flex-col gap-1"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <motion.div
                  key={item.href}
                  variants={reduceMotion ? undefined : fadeUp}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 active:scale-[0.98]",
                      active
                        ? "text-fg"
                        : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {active ? (
                      <motion.span
                        aria-hidden
                        layoutId="sidebar-active-pill"
                        transition={activePillTransition(
                          Boolean(reduceMotion),
                        )}
                        className="absolute inset-0 rounded-2xl bg-brand shadow-[0_0_24px_rgb(214_40_40/0.28)]"
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-2xl transition-colors duration-200 group-hover:bg-white/[0.04]"
                    />
                    <span
                      className={cn(
                        "relative shrink-0 transition-[color,transform] duration-200",
                        active
                          ? "scale-105 text-fg"
                          : "text-fg-subtle group-hover:scale-105 group-hover:text-fg-muted",
                      )}
                    >
                      {item.icon("h-5 w-5")}
                    </span>
                    <span className="relative">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </nav>

        <div className="shrink-0 border-t border-line px-5 py-4">
          <p className="text-xs text-fg-subtle">
            Sentellent <span className="tnum">v1.0</span>
          </p>
          <p className="mt-0.5 text-[11px] text-fg-subtle/70">
            AI analyst for NSE &amp; BSE
          </p>
        </div>
      </motion.aside>
    </>
  );
}
