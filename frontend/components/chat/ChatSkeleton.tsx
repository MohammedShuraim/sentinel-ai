"use client";

export function ChatSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col gap-6 rounded-card border border-line bg-surface p-5 sm:p-7"
    >
      <div className="flex justify-end">
        <div className="skeleton h-10 w-2/5 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex items-start gap-3">
        <div className="skeleton h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-4/5" />
          <div className="skeleton h-3.5 w-3/5" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="skeleton h-10 w-1/3 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex items-start gap-3">
        <div className="skeleton h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-2/3" />
        </div>
      </div>
    </div>
  );
}
