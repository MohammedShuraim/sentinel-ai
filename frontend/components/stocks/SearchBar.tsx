"use client";

import { Input } from "@/components/ui/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search by ticker or company…",
  ariaLabel = "Search stocks",
}: SearchBarProps) {
  return (
    <div className="group relative flex-1">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle transition-[color,transform] duration-200 group-focus-within:scale-110 group-focus-within:text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </svg>
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="bg-surface/60 pl-10 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 hover:border-line-strong focus:bg-surface/80"
      />
    </div>
  );
}
