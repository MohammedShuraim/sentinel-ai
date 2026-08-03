"use client";

export type RecommendationSortOption =
  | "highest"
  | "lowest"
  | "alpha"
  | "sector"
  | "recommendation";

interface RecommendationSortProps {
  value: RecommendationSortOption;
  onChange: (value: RecommendationSortOption) => void;
}

export function RecommendationSort({
  value,
  onChange,
}: RecommendationSortProps) {
  return (
    <div className="group relative shrink-0">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value as RecommendationSortOption)
        }
        aria-label="Sort recommendations"
        className="h-10 appearance-none rounded-xl border border-line bg-surface/60 pl-3.5 pr-9 text-sm text-fg shadow-sm backdrop-blur-md transition-[border-color,box-shadow,color] duration-200 hover:border-line-strong focus:border-ai/60 focus:outline-none focus:ring-2 focus:ring-ai/25"
      >
        <option value="highest">Highest Confidence</option>
        <option value="lowest">Lowest Confidence</option>
        <option value="alpha">Alphabetical</option>
        <option value="sector">Sector</option>
        <option value="recommendation">Recommendation</option>
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle transition-[transform,color] duration-300 group-focus-within:rotate-180 group-focus-within:text-ai"
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
