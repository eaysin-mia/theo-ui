"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type * as React from "react";

import { cn } from "#lib/utils";

export interface AnimatedGradientTextProps extends useRender.ComponentProps<"span"> {
  speed?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = "var(--color-amber-500)",
  colorTo = "var(--color-purple-500)",
  render,
  style,
  ...props
}: AnimatedGradientTextProps) {
  const mergedStyle = {
    "--bg-size": `${speed * 300}%`,
    "--color-from": colorFrom,
    "--color-to": colorTo,
    ...style,
  } as React.CSSProperties;

  const defaultProps = {
    "data-slot": "animated-gradient-text",
    style: mergedStyle,
    className: cn(
      "inline animate-gradient bg-linear-to-r from-(--color-from) via-(--color-to) to-(--color-from) bg-size-[var(--bg-size)_100%] bg-clip-text text-transparent",
      className,
    ),
    children,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
