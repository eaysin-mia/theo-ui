"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    status: {
      neutral: "bg-muted-foreground",
      success: "bg-success",
      warning: "bg-warning",
      info: "bg-info",
      destructive: "bg-destructive",
    },
    size: {
      sm: "size-1.5",
      default: "size-2",
      lg: "size-2.5",
    },
  },
  defaultVariants: {
    status: "neutral",
    size: "default",
  },
});

interface StatusDotProps
  extends
    useRender.ComponentProps<"span">,
    VariantProps<typeof statusDotVariants> {}

function StatusDot({
  className,
  status,
  size,
  render,
  ...props
}: StatusDotProps) {
  const defaultProps = {
    className: cn(statusDotVariants({ status, size, className })),
    "data-slot": "status-dot",
  };

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(defaultProps, props),
    render,
  });
}

export { StatusDot, statusDotVariants };
export type { StatusDotProps };
