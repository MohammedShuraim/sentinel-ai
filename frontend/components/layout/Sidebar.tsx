"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/stocks", label: "Stocks" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/chat", label: "Chat" },
  { href: "/recommendations", label: "Recommendations" },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Primary"
      >
        <div className="flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Sentellent
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-zinc-600 lg:hidden dark:text-zinc-300"
            aria-label="Close sidebar"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
                  active &&
                    "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
