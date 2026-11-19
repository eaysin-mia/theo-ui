"use client";

import * as React from "react";
import {
  motion,
  type HTMLMotionProps,
  type TargetAndTransition,
  type Transition,
  useReducedMotionConfig,
} from "motion/react";

import {
  useAutoHeight,
  type AutoHeightOptions,
} from "@theo/ui/hooks/use-auto-height";
import { cn } from "@theo/ui/lib/utils";

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  bounce: 0,
  restDelta: 0.01,
};

export interface AutoHeightProps extends Omit<
  HTMLMotionProps<"div">,
  "animate"
> {
  children: React.ReactNode;
  /**
   * Values that change the content: the height is measured again immediately when they change.
   */
  deps?: React.DependencyList;
  /**
   * Extra values to animate along with the height.
   */
  animate?: TargetAndTransition;
  /**
   * Transition configuration for the height spring.
   */
  transition?: Transition;
  /**
   * Measurement options passed to the underlying useAutoHeight hook.
   */
  options?: AutoHeightOptions;
  /**
   * Optional CSS class applied to the inner content wrapper measured by ResizeObserver.
   */
  innerClassName?: string;
  /**
   * Explicitly toggle reduced motion (defaults to Framer Motion's MotionConfigContext).
   */
  reduceMotion?: boolean;
}

/**
 * AutoHeight animates its container height smoothly whenever its content changes.
 * Measures content using ResizeObserver and integrates with Motion spring animations.
 */
export function AutoHeight({
  children,
  deps = [],
  transition = DEFAULT_TRANSITION,
  style,
  animate,
  className,
  innerClassName,
  options,
  reduceMotion: customReduceMotion,
  ...props
}: AutoHeightProps) {
  const systemReduceMotion = useReducedMotionConfig() ?? false;
  const shouldReduceMotion = customReduceMotion ?? systemReduceMotion;
  const { ref, height } = useAutoHeight<HTMLDivElement>(deps, options);

  const effectiveTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : transition;

  return (
    <motion.div
      style={{ overflow: "hidden", ...style }}
      animate={{ height, ...animate }}
      transition={effectiveTransition}
      className={cn("overflow-hidden", className)}
      data-slot="auto-height"
      {...props}
    >
      <div ref={ref} className={innerClassName} data-slot="auto-height-content">
        {children}
      </div>
    </motion.div>
  );
}

export { useAutoHeight, type AutoHeightOptions };
