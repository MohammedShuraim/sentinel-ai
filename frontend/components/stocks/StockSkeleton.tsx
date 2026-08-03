"use client";

import { Card } from "@/components/ui/Card";

function SkeletonCard() {
  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="skeleton h-6 w-20" />
            <div className="skeleton h-5 w-12 rounded-full" />
          </div>
          <div className="skeleton h-4 w-3/5" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="skeleton h-4 w-2/5" />
        <div className="skeleton h-3 w-1/2" />
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-line/60 pt-3.5">
        <div className="skeleton h-8 flex-1 rounded-lg" />
        <div className="skeleton h-8 flex-1 rounded-lg" />
      </div>
    </Card>
  );
}

export function StockSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
