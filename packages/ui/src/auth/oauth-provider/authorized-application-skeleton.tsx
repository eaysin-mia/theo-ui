"use client";

import { Skeleton } from "#components/skeleton";

export function AuthorizedApplicationSkeleton() {
  return (
    <div role="listitem" className="flex items-center gap-3 p-4">
      <Skeleton className="size-10 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
