"use client";

import { Card } from "@/components/ui/Card";

function HoldingSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="skeleton h-6 w-20" />
            <div className="skeleton h-5 w-12 rounded-full" />
          </div>
          <div className="skeleton h-4 w-3/5" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-3 w-12" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-12 rounded-xl" />
      </div>
      <div className="mt-auto flex flex-col gap-2 border-t border-line/60 pt-3.5">
        <div className="skeleton h-8 rounded-lg" />
        <div className="skeleton h-8 rounded-lg" />
      </div>
    </Card>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="flex items-center justify-between gap-3 p-5">
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-7 w-24" />
            </div>
            <div className="skeleton h-10 w-10 rounded-xl" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HoldingSkeleton />
            <HoldingSkeleton />
          </div>
        </div>
        <Card className="flex h-full flex-col gap-5">
          <div className="skeleton h-2.5 w-full rounded-full" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="skeleton h-2.5 w-2.5 rounded-full" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-12" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
