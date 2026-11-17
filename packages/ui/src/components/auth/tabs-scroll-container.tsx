"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface TabsScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  activeValue?: string;
  hideNav?: boolean;
}

export function TabsScrollContainer({
  activeValue,
  hideNav,
  className,
  children,
  ...props
}: TabsScrollContainerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  const scrollToActive = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = scrollerRef.current;
      if (!el) return;

      // Find the active tab inside the container
      const activeEl = el.querySelector<HTMLElement>(
        `[data-active], [aria-selected="true"]${
          activeValue ? `, [data-value="${activeValue}"]` : ""
        }`,
      );

      if (activeEl) {
        const elRect = el.getBoundingClientRect();
        const tabRect = activeEl.getBoundingClientRect();
        const currentScrollLeft = el.scrollLeft;
        const tabLeftRelative = tabRect.left - elRect.left + currentScrollLeft;
        const targetScrollLeft =
          tabLeftRelative - (elRect.width - tabRect.width) / 2;

        el.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior,
        });
      }
    },
    [activeValue],
  );

  // Measure and adjust bounds on mount and container resize
  useEffect(() => {
    checkScroll();
    const el = scrollerRef.current;
    if (!el) return;

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        checkScroll();
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [checkScroll]);

  // Center the active tab on mount, navigation, and whenever activeValue updates
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollToActive("instant");
      checkScroll();
    });

    const timer1 = setTimeout(() => {
      scrollToActive("instant");
      checkScroll();
    }, 60);

    const timer2 = setTimeout(() => {
      checkScroll();
    }, 200);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeValue, scrollToActive, checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(140, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  // Mask styles for smooth edge fading like Hero UI
  const maskStyle = useMemo(() => {
    if (canScrollLeft && canScrollRight) {
      return {
        maskImage:
          "linear-gradient(to right, transparent 0px, black 28px, black calc(100% - 28px), transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0px, black 28px, black calc(100% - 28px), transparent 100%)",
      };
    }
    if (canScrollLeft) {
      return {
        maskImage:
          "linear-gradient(to right, transparent 0px, black 28px, black 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0px, black 28px, black 100%)",
      };
    }
    if (canScrollRight) {
      return {
        maskImage:
          "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
      };
    }
    return undefined;
  }, [canScrollLeft, canScrollRight]);

  return (
    <div
      className={cn(
        "relative w-full max-w-full",
        hideNav && "hidden",
        className,
      )}
      onClick={(e) => {
        // When clicking a tab trigger, immediately center it smoothly
        const target = (e.target as HTMLElement).closest<HTMLElement>(
          '[role="tab"], [data-slot="tabs-tab"], button',
        );
        if (target && scrollerRef.current) {
          const el = scrollerRef.current;
          const elRect = el.getBoundingClientRect();
          const tabRect = target.getBoundingClientRect();
          const currentScrollLeft = el.scrollLeft;
          const tabLeftRelative =
            tabRect.left - elRect.left + currentScrollLeft;
          const targetScrollLeft =
            tabLeftRelative - (elRect.width - tabRect.width) / 2;
          el.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: "smooth",
          });
        }
      }}
      {...props}
    >
      {/* Scroll Prev Button */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={(e) => {
            e.stopPropagation();
            handleScroll("left");
          }}
          className="absolute top-1/2 left-0 z-10 flex h-7 w-6 -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      {/* Scroller Container */}
      <div
        ref={scrollerRef}
        onScroll={checkScroll}
        style={maskStyle}
        className="no-scrollbar w-full overflow-x-auto scroll-smooth"
      >
        {children}
      </div>

      {/* Scroll Next Button */}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={(e) => {
            e.stopPropagation();
            handleScroll("right");
          }}
          className="absolute top-1/2 right-0 z-10 flex h-7 w-6 -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
