"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
} from "lucide-react";

export function StatusIcon({
  status,
}: {
  status?: "running" | "error" | "pending";
}) {
  if (status === "running") {
    return <LoaderCircleIcon className="size-3.5 animate-spin text-primary" />;
  }

  if (status === "error") {
    return <CircleAlertIcon className="size-3.5 text-destructive" />;
  }

  return <CircleCheckIcon className="size-3.5 text-muted-foreground" />;
}
