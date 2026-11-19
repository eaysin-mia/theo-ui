"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface UseClickOutsideOptions {
  /** Whether the listener is currently active. Defaults to true. */
  enabled?: boolean;
  /** Event types to listen for. Defaults to ["mousedown", "touchstart"]. */
  events?: Array<"mousedown" | "mouseup" | "touchstart" | "touchend">;
}

/**
 * Invokes a callback when a click occurs outside the specified element ref(s).
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  target: RefObject<T | null> | Array<RefObject<T | null>>,
  handler: (event: MouseEvent | TouchEvent) => void,
  options: UseClickOutsideOptions = {},
): void {
  const { enabled = true, events = ["mousedown", "touchstart"] } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const targets = Array.isArray(target) ? target : [target];
      const clickedEl = event.target as Node | null;

      if (!clickedEl) return;

      const isInside = targets.some((ref) => {
        const el = ref.current;
        return el && el.contains(clickedEl);
      });

      if (!isInside) {
        handlerRef.current(event);
      }
    };

    for (const eventName of events) {
      document.addEventListener(eventName, listener, true);
    }

    return () => {
      for (const eventName of events) {
        document.removeEventListener(eventName, listener, true);
      }
    };
  }, [enabled, events, target]);
}
