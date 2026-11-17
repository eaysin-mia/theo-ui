"use client";

import { Skeleton } from "@theo/ui/skeleton";

export function ApiKeySkeleton() {
  return (
    <div role="listitem" className="flex items-center gap-3 p-4">
      <Skeleton className="size-8 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
