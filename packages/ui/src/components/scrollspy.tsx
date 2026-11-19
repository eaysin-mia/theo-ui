"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@theo/ui/lib/utils";

export interface ScrollspyProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  /** Ref to the scrollable container or an element containing a Coss UI ScrollArea */
  targetRef?: React.RefObject<
    HTMLElement | HTMLDivElement | Document | Window | null | undefined
  >;
  /** Callback fired when the active section ID changes */
  onUpdate?: (id: string) => void;
  /** Default active section ID on mount */
  defaultValue?: string;
  /** Top offset in pixels (can also be customized per anchor via data-scrollspy-offset) */
  offset?: number;
  /** Smooth scrolling behavior when clicking anchors (defaults to true) */
  smooth?: boolean;
  /** Custom data-attribute prefix (defaults to "scrollspy") */
  dataAttribute?: string;
  /** Sync active section with window URL hash (defaults to true) */
  history?: boolean;
}

/** Resolves the actual scrollable element, including Coss UI ScrollArea viewports */
function getScrollElement(
  target: HTMLElement | Document | Window | null | undefined,
): HTMLElement | Window {
  if (!target || target === document || target instanceof Document)
    return window;
  if (target instanceof Window) return target;

  // Auto-detect Coss UI ScrollArea viewport if wrapped
  const viewport = target.querySelector<HTMLElement>(
    '[data-slot="scroll-area-viewport"]',
  );
  if (viewport) return viewport;

  return target;
}

export function Scrollspy({
  children,
  targetRef,
  onUpdate,
  defaultValue,
  className,
  offset = 0,
  smooth = true,
  dataAttribute = "scrollspy",
  history = true,
  ...props
}: ScrollspyProps) {
  const selfRef = useRef<HTMLDivElement | null>(null);
  const prevIdTracker = useRef<string | null>(null);
  const rafId = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Maintain activeId in React state so React reconciliation never wipes data-active
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (defaultValue) return defaultValue;
    if (typeof window !== "undefined" && window.location.hash) {
      return window.location.hash.replace(/^#/, "");
    }
    return null;
  });

  // Sets active states in React state, DOM attributes, URL history, and fires onUpdate
  const setActiveSection = useCallback(
    (sectionId: string | null, force = false) => {
      if (!sectionId) return;

      setActiveId(sectionId);

      if (selfRef.current) {
        const anchors = selfRef.current.querySelectorAll(
          `[data-${dataAttribute}-anchor]`,
        );

        anchors.forEach((item) => {
          const id = item.getAttribute(`data-${dataAttribute}-anchor`);
          if (id === sectionId) {
            item.setAttribute("data-active", "true");
            item.setAttribute("data-state", "active");
          } else {
            item.removeAttribute("data-active");
            item.setAttribute("data-state", "inactive");
          }
        });
      }

      if (onUpdate && prevIdTracker.current !== sectionId) {
        onUpdate(sectionId);
      }

      if (history && (force || prevIdTracker.current !== sectionId)) {
        if (
          typeof window !== "undefined" &&
          window.location.hash !== `#${sectionId}`
        ) {
          window.history.replaceState(null, "", `#${sectionId}`);
        }
      }

      prevIdTracker.current = sectionId;
    },
    [dataAttribute, history, onUpdate],
  );

  const handleScroll = useCallback(() => {
    if (!selfRef.current || isProgrammaticScrollRef.current) return;

    const anchors = Array.from(
      selfRef.current.querySelectorAll<HTMLElement>(
        `[data-${dataAttribute}-anchor]`,
      ),
    );
    if (anchors.length === 0) return;

    const scrollTarget = getScrollElement(targetRef?.current);
    const isWindow = scrollTarget === window;

    const scrollElement = isWindow
      ? document.documentElement
      : (scrollTarget as HTMLElement);

    const scrollTop = isWindow
      ? window.scrollY || document.documentElement.scrollTop
      : scrollElement.scrollTop;

    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;

    // Check if scrolled to the very bottom
    if (scrollTop + clientHeight >= scrollHeight - 2) {
      const lastAnchor = anchors[anchors.length - 1];
      const sectionId = lastAnchor?.getAttribute(
        `data-${dataAttribute}-anchor`,
      );
      if (sectionId) {
        setActiveSection(sectionId);
        return;
      }
    }

    const containerTop = isWindow
      ? 0
      : scrollElement.getBoundingClientRect().top;

    let targetId: string | null = null;
    let minDelta = Infinity;
    const tolerance = 2; // Subpixel rendering tolerance

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      if (!anchor) continue;

      const sectionId = anchor.getAttribute(`data-${dataAttribute}-anchor`);
      if (!sectionId) continue;

      const sectionElement = document.getElementById(sectionId);
      if (!sectionElement) continue;

      let customOffset = offset;
      const dataOffset = anchor.getAttribute(`data-${dataAttribute}-offset`);
      if (dataOffset) {
        const parsed = parseInt(dataOffset, 10);
        if (!Number.isNaN(parsed)) customOffset = parsed;
      }

      const rect = sectionElement.getBoundingClientRect();
      const relativeTop = rect.top - containerTop - customOffset;

      if (relativeTop <= tolerance && Math.abs(relativeTop) < minDelta) {
        minDelta = Math.abs(relativeTop);
        targetId = sectionId;
      }
    }

    // Default to the first anchor if scrolled above the first threshold
    if (!targetId && anchors[0]) {
      const firstId = anchors[0].getAttribute(`data-${dataAttribute}-anchor`);
      if (firstId) targetId = firstId;
    }

    if (targetId) {
      setActiveSection(targetId);
    }
  }, [dataAttribute, offset, setActiveSection, targetRef]);

  const scrollToAnchor = useCallback(
    (anchorElement: HTMLElement) => {
      const rawSectionId = anchorElement.getAttribute(
        `data-${dataAttribute}-anchor`,
      );
      if (!rawSectionId) return;

      const sectionId = rawSectionId.replace(/^#/, "");
      const sectionElement = document.getElementById(sectionId);
      if (!sectionElement) return;

      const scrollTarget = getScrollElement(targetRef?.current);
      const isWindow = scrollTarget === window;

      const scrollElement = isWindow
        ? document.documentElement
        : (scrollTarget as HTMLElement);

      let customOffset = offset;
      const dataOffset = anchorElement.getAttribute(
        `data-${dataAttribute}-offset`,
      );
      if (dataOffset) {
        const parsed = parseInt(dataOffset, 10);
        if (!Number.isNaN(parsed)) customOffset = parsed;
      }

      const containerTop = isWindow
        ? 0
        : scrollElement.getBoundingClientRect().top;
      const rect = sectionElement.getBoundingClientRect();
      const currentScrollTop = isWindow
        ? window.scrollY || document.documentElement.scrollTop
        : scrollElement.scrollTop;

      const targetScrollTop =
        currentScrollTop + (rect.top - containerTop) - customOffset;

      // Lock programmatic scrolling so intermediate scroll frames never flash active states
      if (smooth) {
        isProgrammaticScrollRef.current = true;
        if (scrollEndTimerRef.current) {
          clearTimeout(scrollEndTimerRef.current);
        }
        scrollEndTimerRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 600);
      }

      // Immediately activate the target section
      setActiveSection(sectionId, true);

      scrollTarget.scrollTo({
        top: Math.max(0, targetScrollTop),
        left: 0,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [dataAttribute, offset, smooth, targetRef, setActiveSection],
  );

  // Delegated click handler on the container
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    props.onClick?.(e);
    if (e.defaultPrevented) return;

    const target = e.target as HTMLElement | null;
    const anchor = target?.closest<HTMLElement>(
      `[data-${dataAttribute}-anchor]`,
    );
    if (!anchor || !selfRef.current?.contains(anchor)) return;

    e.preventDefault();
    scrollToAnchor(anchor);
  };

  // Replaces or passes data-active to children in React's virtual DOM
  const renderChildren = useCallback(
    (nodes: React.ReactNode): React.ReactNode => {
      return React.Children.map(nodes, (child) => {
        if (!React.isValidElement(child)) return child;

        const childProps = child.props as
          Record<string, unknown> | null | undefined;
        if (!childProps) return child;

        const anchorId = childProps[`data-${dataAttribute}-anchor`];

        if (typeof anchorId === "string") {
          const isActive = anchorId === activeId;
          return React.cloneElement(child, {
            "data-active": isActive ? "true" : undefined,
            "data-state": isActive ? "active" : "inactive",
          } as React.HTMLAttributes<HTMLElement>);
        }

        if (childProps.children && typeof childProps.children !== "function") {
          return React.cloneElement(child, {
            children: renderChildren(childProps.children as React.ReactNode),
          } as React.HTMLAttributes<HTMLElement>);
        }

        return child;
      });
    },
    [activeId, dataAttribute],
  );

  useEffect(() => {
    const onScroll = () => {
      // If programmatically smooth scrolling, debounce the lock release
      if (isProgrammaticScrollRef.current) {
        if (scrollEndTimerRef.current) {
          clearTimeout(scrollEndTimerRef.current);
        }
        scrollEndTimerRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
          handleScroll();
        }, 150);
        return;
      }

      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        handleScroll();
      });
    };

    // User manual interaction (wheel or touch) immediately cancels the programmatic lock
    const onUserInteraction = () => {
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        if (scrollEndTimerRef.current) {
          clearTimeout(scrollEndTimerRef.current);
        }
      }
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("wheel", onUserInteraction, { passive: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true });

    // Initial sync with URL hash or scroll position on mount
    const timeout = setTimeout(() => {
      if (window.location.hash) {
        const hash = CSS.escape(window.location.hash.replace(/^#/, ""));
        if (hash && selfRef.current) {
          const targetAnchor = selfRef.current.querySelector<HTMLElement>(
            `[data-${dataAttribute}-anchor="${hash}"]`,
          );
          if (targetAnchor) {
            scrollToAnchor(targetAnchor);
            return;
          }
        }
      }
      handleScroll();
    }, 100);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("wheel", onUserInteraction);
      window.removeEventListener("touchstart", onUserInteraction);
      clearTimeout(timeout);
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [dataAttribute, handleScroll, scrollToAnchor]);

  return (
    <div
      data-slot="scrollspy"
      className={cn(className)}
      ref={selfRef}
      onClick={handleClick}
      {...props}
    >
      {renderChildren(children)}
    </div>
  );
}
