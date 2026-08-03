"use client";

import Link from "next/link";
import { SparkleIcon } from "@/components/common/icons";
import { Card } from "@/components/ui/Card";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const actions = [
  {
    href: "/chat",
    label: "Ask the AI analyst",
    description: "Chat about any NSE stock",
    tile: "bg-ai-soft text-ai",
    tileGlow: "group-hover:shadow-[0_0_18px_rgb(167_139_250/0.30)]",
    wash: "bg-[radial-gradient(130%_130%_at_100%_0%,rgb(167_139_250/0.07),transparent_60%)]",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5c-1.2 0-2.4-.3-3.4-.8L4 19.5l1.4-4.3a7.5 7.5 0 1 1 14.6-3.7Z" />
      </svg>
    ),
  },
  {
    href: "/portfolio",
    label: "Manage portfolio",
    description: "Holdings and transactions",
    tile: "bg-brand-soft text-brand",
    tileGlow: "group-hover:shadow-[0_0_18px_rgb(52_211_153/0.30)]",
    wash: "bg-[radial-gradient(130%_130%_at_100%_0%,rgb(52_211_153/0.07),transparent_60%)]",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
        <rect x="3.5" y="8" width="17" height="12" rx="2" />
        <path d="M8.5 8V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8" />
        <path d="M3.5 13h17" />
      </svg>
    ),
  },
  {
    href: "/stocks",
    label: "Browse stocks",
    description: "Search the NSE universe",
    tile: "bg-info-soft text-info",
    tileGlow: "group-hover:shadow-[0_0_18px_rgb(96_165_250/0.30)]",
    wash: "bg-[radial-gradient(130%_130%_at_100%_0%,rgb(96_165_250/0.07),transparent_60%)]",
    icon: (className: string) => (
      <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
        <path d="M4 20V10" />
        <path d="M9.5 20V4" />
        <path d="M15 20v-8" />
        <path d="M20.5 20V7" />
      </svg>
    ),
  },
  {
    href: "/recommendations",
    label: "View recommendations",
    description: "Personalised AI picks",
    tile: "bg-warn-soft text-warn",
    tileGlow: "group-hover:shadow-[0_0_18px_rgb(251_191_36/0.28)]",
    wash: "bg-[radial-gradient(130%_130%_at_100%_0%,rgb(251_191_36/0.06),transparent_60%)]",
    icon: (className: string) => <SparkleIcon className={className} />,
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {actions.map((action) => (
        <Link key={action.href} href={action.href} className="group">
          <Card
            interactive
            className={`relative flex h-full items-start gap-3 overflow-hidden p-4 active:scale-[0.98] ${action.wash}`}
          >
            <span
              aria-hidden
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 ${action.tile} ${action.tileGlow}`}
            >
              {action.icon("h-4.5 w-4.5")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-fg">
                {action.label}
              </span>
              <span className="truncate text-xs text-fg-subtle">
                {action.description}
              </span>
            </span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="mt-1 h-4 w-4 shrink-0 -translate-x-1 text-fg-subtle opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:text-fg-muted group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Card>
        </Link>
      ))}
    </div>
  );
}
