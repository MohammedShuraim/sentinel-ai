"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";

function initialsOf(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-topnav items-center gap-3 border-b px-4 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 sm:px-6",
        scrolled
          ? "border-line bg-surface/85 shadow-card"
          : "border-transparent bg-bg/60",
      )}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-fg-muted transition-[color,background-color,transform] hover:bg-white/[0.05] hover:text-fg active:scale-95 lg:hidden"
        aria-label="Open sidebar"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <span className="lg:hidden">
        <Logo size="sm" withWordmark={false} />
      </span>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="group flex items-center gap-3 rounded-xl px-2 py-1 transition-colors duration-200 hover:bg-white/[0.04]">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-fg">
              {user?.full_name}
            </p>
            <p className="text-xs leading-tight text-fg-subtle">
              {user?.email}
            </p>
          </div>

          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand ring-1 ring-brand/25 transition-shadow duration-200 group-hover:shadow-glow"
          >
            {initialsOf(user?.full_name)}
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
