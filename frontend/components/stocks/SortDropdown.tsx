"use client";

export type StockSort = "az" | "za" | "sector" | "exchange";

interface SortDropdownProps {
  value: StockSort;
  onChange: (value: StockSort) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="group relative shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as StockSort)}
        aria-label="Sort stocks"
        className="h-10 appearance-none rounded-xl border border-line bg-surface/60 pl-3.5 pr-9 text-sm text-fg shadow-sm backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 hover:border-line-strong focus:border-brand/60 focus:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-brand/25"
      >
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
        <option value="sector">Sector</option>
        <option value="exchange">Exchange</option>
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle transition-[color,transform] duration-200 group-focus-within:rotate-180 group-focus-within:text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
