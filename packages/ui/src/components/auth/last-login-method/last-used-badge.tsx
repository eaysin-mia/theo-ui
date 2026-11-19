"use client";

import { useLastLoginMethod } from "@better-auth-ui/react";
import type { VariantProps } from "class-variance-authority";

import { Badge, type badgeVariants } from "@theo/ui/components/badge";
import { cn } from "@theo/ui/lib/utils";

export type LastUsedBadgeProps = {
  /** Login method IDs that should display the indicator. */
  method: string | string[];
  /** Use the shorter label in constrained layouts. */
  compact?: boolean;
  /** Float the compact indicator over the top-right edge of its container. */
  floating?: boolean;
  className?: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
  size?: VariantProps<typeof badgeVariants>["size"];
};

/**
 * Displays an indicator when one of the supplied method IDs matches Better
 * Auth's stored last login method.
 */
export function LastUsedBadge({
  method,
  compact,
  floating,
  className,
  variant,
  size,
}: LastUsedBadgeProps) {
  const { method: lastLoginMethod, localization } = useLastLoginMethod();
  const methods = Array.isArray(method) ? method : [method];

  if (!lastLoginMethod || !methods.includes(lastLoginMethod)) return null;

  return (
    <Badge
      className={cn(
        floating
          ? "pointer-events-none absolute inset-e-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-popover px-2 text-xs font-medium text-popover-foreground shadow-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          : undefined,
        className,
      )}
      size={size ?? "sm"}
      variant={variant ?? (floating ? "outline" : "secondary")}
    >
      {compact ? localization.lastUsedShort : localization.lastUsed}
    </Badge>
  );
}
