"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import type { CSSProperties } from "react";

import { Spinner } from "#components/spinner";
import { cn } from "#lib/utils";

export const shimmerButtonVariants = cva(
  [
    "group relative z-0 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg font-medium whitespace-nowrap transition-shadow outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-64 data-loading:text-transparent data-loading:select-none",
    "pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
    "[&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
    "[:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)] [:disabled,:active,[data-pressed]]:shadow-none",
    "[border-radius:var(--shimmer-radius,var(--radius-lg))] border border-transparent [background:var(--bg)]",
  ],
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-[calc(--spacing(3)-1px)] text-base sm:h-8 sm:text-sm",
        xs: "h-7 gap-1 rounded-md px-[calc(--spacing(2)-1px)] text-sm sm:h-6 sm:text-xs [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] text-sm sm:h-7 sm:text-xs",
        lg: "h-10 px-[calc(--spacing(3.5)-1px)] text-base sm:h-9 sm:text-sm",
        xl: "h-11 px-[calc(--spacing(4)-1px)] text-lg sm:h-10 sm:text-base [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        icon: "size-9 sm:size-8",
        "icon-xs":
          "size-7 rounded-md sm:size-6 not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-4 sm:not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 sm:size-7",
        "icon-lg": "size-10 sm:size-9",
        "icon-xl":
          "size-11 sm:size-10 [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
      },
      variant: {
        default: [
          "[--bg:var(--primary)] [--shimmer-color:var(--primary-foreground)]",
          "text-primary-foreground shadow-xs shadow-primary/24",
          "hover:brightness-105 [:active,[data-pressed]]:brightness-95",
          "*:data-[slot=button-loading-indicator]:text-primary-foreground",
        ],
        outline: [
          "[--bg:var(--card)] [--shimmer-color:var(--color-neutral-400)]",
          "dark:[--bg:var(--card)] dark:[--shimmer-color:var(--color-neutral-200)]",
          "border-border text-foreground shadow-xs/5",
          "hover:bg-accent/50 [:active,[data-pressed]]:bg-accent/50",
          "*:data-[slot=button-loading-indicator]:text-foreground",
        ],
        secondary: [
          "[--bg:var(--secondary)] [--shimmer-color:var(--color-neutral-400)]",
          "dark:[--bg:var(--secondary)] dark:[--shimmer-color:var(--color-neutral-300)]",
          "border-border/50 text-secondary-foreground",
          "hover:bg-secondary/90 [:active,[data-pressed]]:bg-secondary/80",
          "*:data-[slot=button-loading-indicator]:text-secondary-foreground",
        ],
      },
    },
  },
);

export interface ShimmerButtonProps
  extends
    useRender.ComponentProps<"button">,
    VariantProps<typeof shimmerButtonVariants> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  loading?: boolean;
}

export function ShimmerButton({
  shimmerColor,
  shimmerSize = "0.05em",
  shimmerDuration = "3s",
  borderRadius = "var(--radius-lg)",
  background,
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  style,
  ...props
}: ShimmerButtonProps) {
  const isDisabled: boolean = Boolean(loading || disabledProp);
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const customStyle: Record<string, string | number> = {
    "--spread": "90deg",
    "--shimmer-radius": borderRadius,
    "--speed": shimmerDuration,
    "--cut": shimmerSize,
  };

  if (shimmerColor) customStyle["--shimmer-color"] = shimmerColor;
  if (background) customStyle["--bg"] = background;

  const mergedStyle: CSSProperties = {
    ...customStyle,
    ...style,
  } as CSSProperties;

  const defaultProps = {
    children: (
      <>
        {/* 1. Spark container with container-type: size */}
        <div
          aria-hidden="true"
          className="@container-size pointer-events-none absolute inset-0 -z-30 overflow-visible blur-[2px]"
        >
          <div className="absolute inset-0 aspect-square h-[100cqh] animate-shimmer-slide rounded-none [mask:none]">
            <div className="absolute -inset-full w-auto [translate:0_0] rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>

        {/* 2. Button content */}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>

        {/* 3. Loading spinner */}
        {loading && (
          <Spinner
            className="pointer-events-none absolute z-20"
            data-slot="button-loading-indicator"
          />
        )}

        {/* 4. Highlight inner glow */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-10 size-full rounded-(--shimmer-radius,var(--radius-lg))",
            "shadow-[inset_0_-8px_10px_--alpha(var(--shimmer-color)/15%)] transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_--alpha(var(--shimmer-color)/30%)]",
            "[:active,[data-pressed]]:shadow-[inset_0_-10px_10px_--alpha(var(--shimmer-color)/30%)]",
          )}
        />

        {/* 5. Backdrop surface */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-(--cut) -z-20 rounded-[calc(var(--shimmer-radius,var(--radius-lg))-var(--cut))] [background:var(--bg)]"
        />
      </>
    ),
    className: cn(shimmerButtonVariants({ variant, size, className })),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    style: mergedStyle,
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}
