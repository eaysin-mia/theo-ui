"use client";

import * as React from "react";

export type AutoHeightOptions = {
  /**
   * Include the parent container's padding and border-width if using border-box.
   * @default true
   */
  includeParentBox?: boolean;
  /**
   * Include the measured element's own padding and border-width if using border-box.
   * @default false
   */
  includeSelfBox?: boolean;
};

/**
 * Measures an element's height with ResizeObserver and accounts for parent padding/border.
 * Smoothly synchronizes with dependencies and responds to dynamic DOM/font/image changes.
 */
export function useAutoHeight<T extends HTMLElement = HTMLDivElement>(
  deps: React.DependencyList = [],
  options: AutoHeightOptions = {
    includeParentBox: true,
    includeSelfBox: false,
  },
) {
  const ref = React.useRef<T | null>(null);
  const roRef = React.useRef<ResizeObserver | null>(null);
  const [height, setHeight] = React.useState<number | "auto">("auto");

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return 0;

    const base = el.getBoundingClientRect().height || 0;

    let extra = 0;

    if (options.includeParentBox && el.parentElement) {
      const cs = getComputedStyle(el.parentElement);
      const paddingY =
        (parseFloat(cs.paddingTop || "0") || 0) +
        (parseFloat(cs.paddingBottom || "0") || 0);
      const borderY =
        (parseFloat(cs.borderTopWidth || "0") || 0) +
        (parseFloat(cs.borderBottomWidth || "0") || 0);
      const isBorderBox = cs.boxSizing === "border-box";
      if (isBorderBox) {
        extra += paddingY + borderY;
      }
    }

    if (options.includeSelfBox) {
      const cs = getComputedStyle(el);
      const paddingY =
        (parseFloat(cs.paddingTop || "0") || 0) +
        (parseFloat(cs.paddingBottom || "0") || 0);
      const borderY =
        (parseFloat(cs.borderTopWidth || "0") || 0) +
        (parseFloat(cs.borderBottomWidth || "0") || 0);
      const isBorderBox = cs.boxSizing === "border-box";
      if (isBorderBox) {
        extra += paddingY + borderY;
      }
    }

    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const total = Math.ceil((base + extra) * dpr) / dpr;

    return total;
  }, [options.includeParentBox, options.includeSelfBox]);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    setHeight(measure());

    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }

    const ro = new ResizeObserver(() => {
      const next = measure();
      requestAnimationFrame(() => setHeight(next));
    });

    ro.observe(el);
    if (options.includeParentBox && el.parentElement) {
      ro.observe(el.parentElement);
    }

    roRef.current = ro;

    return () => {
      ro.disconnect();
      roRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  React.useLayoutEffect(() => {
    if (height === 0 || height === "auto") {
      const next = measure();
      if (next !== 0) setHeight(next);
    }
  }, [height, measure]);

  return { ref, height } as const;
}
