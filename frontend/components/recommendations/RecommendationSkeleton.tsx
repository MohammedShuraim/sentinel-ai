"use client";

import { Card } from "@/components/ui/Card";

export function RecommendationSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="flex items-center justify-between gap-3 p-5"
          >
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-7 w-16" />
            </div>
            <div className="skeleton h-10 w-10 rounded-xl" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="relative flex flex-col gap-4 overflow-hidden p-5">
            <span
              aria-hidden
              className="absolute inset-y-4 left-0 w-1 rounded-full bg-elevated"
            />
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-6 w-20" />
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
                <div className="skeleton h-4 w-3/5" />
              </div>
              <div className="skeleton h-6 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="skeleton h-3 w-2/5" />
              <div className="skeleton h-1.5 w-full rounded-full" />
            </div>
            <div className="skeleton h-[74px] w-full rounded-xl" />
            <div className="mt-auto flex items-center gap-2 border-t border-line/60 pt-3.5">
              <div className="skeleton h-8 flex-1 rounded-lg" />
              <div className="skeleton h-8 flex-1 rounded-lg" />
              <div className="skeleton h-8 flex-1 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
