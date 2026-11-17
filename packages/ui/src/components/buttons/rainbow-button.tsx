"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Spinner } from "@theo/ui/spinner";
import { cn } from "@theo/ui/utils";

export const rainbowButtonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-shadow outline-none",
    "animate-rainbow [background-size:200%]",
    "border-2 border-transparent [background-clip:padding-box,border-box,border-box] [background-origin:border-box]",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-64 data-loading:text-transparent data-loading:select-none",
    "pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
    "[&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
    "[:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)] [:disabled,:active,[data-pressed]]:shadow-none",
    "[--rainbow-gradient:linear-gradient(90deg,var(--color-red-500),var(--color-amber-500),var(--color-emerald-500),var(--color-blue-500),var(--color-purple-500),var(--color-red-500))]",
    "before:absolute before:start-1/2 before:bottom-[-20%] before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-(--rainbow-gradient) before:[background-size:200%] before:blur-md",
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
          "bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(to_bottom,var(--primary)_50%,--alpha(var(--primary)/60%)_80%,transparent),var(--rainbow-gradient)]",
          "text-primary-foreground *:data-[slot=button-loading-indicator]:text-primary-foreground",
          "shadow-xs shadow-primary/24",
          "hover:brightness-105 [:active,[data-pressed]]:brightness-95",
        ],
        outline: [
          "bg-[linear-gradient(var(--card),var(--card)),linear-gradient(to_bottom,var(--card)_50%,--alpha(var(--card)/60%)_80%,transparent),var(--rainbow-gradient)]",
          "text-foreground *:data-[slot=button-loading-indicator]:text-foreground",
          "shadow-xs/5",
          "hover:bg-accent/50 [:active,[data-pressed]]:bg-accent/50",
        ],
        secondary: [
          "bg-[linear-gradient(var(--secondary),var(--secondary)),linear-gradient(to_bottom,var(--secondary)_50%,--alpha(var(--secondary)/60%)_80%,transparent),var(--rainbow-gradient)]",
          "text-secondary-foreground *:data-[slot=button-loading-indicator]:text-secondary-foreground",
          "hover:bg-secondary/90 [:active,[data-pressed]]:bg-secondary/80",
        ],
      },
    },
  },
);

export interface RainbowButtonProps
  extends
    useRender.ComponentProps<"button">,
    VariantProps<typeof rainbowButtonVariants> {
  loading?: boolean;
}

export function RainbowButton({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: RainbowButtonProps) {
  const isDisabled: boolean = Boolean(loading || disabledProp);
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(rainbowButtonVariants({ variant, size, className })),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}
