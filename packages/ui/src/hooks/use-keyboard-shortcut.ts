"use client";

import { useEffect, useRef } from "react";

export type ModifierKey = "ctrl" | "shift" | "alt" | "meta";

export interface ShortcutKeyCombination {
  /** The primary key, e.g. "k", "Escape", "Enter", "/" */
  key: string;
  /** Modifiers required: "ctrl" | "shift" | "alt" | "meta" */
  modifiers?: ModifierKey[];
}

export interface UseKeyboardShortcutOptions {
  /** Whether the shortcut listener is active. Defaults to true. */
  enabled?: boolean;
  /** Prevent default browser behavior on match. Defaults to true. */
  preventDefault?: boolean;
  /** Target element to bind the listener to. Defaults to window. */
  target?: HTMLElement | Document | Window | null;
}

/**
 * Attaches a declarative keyboard shortcut listener with modifier key validation.
 *
 * Example:
 * ```tsx
 * useKeyboardShortcut({ key: "k", modifiers: ["meta"] }, () => {
 *   setOpen(true);
 * });
 * ```
 */
export function useKeyboardShortcut(
  shortcut: ShortcutKeyCombination | string,
  handler: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {},
): void {
  const { enabled = true, preventDefault = true, target } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const keyConfig: ShortcutKeyCombination =
      typeof shortcut === "string" ? { key: shortcut } : shortcut;

    const targetKey = keyConfig.key.toLowerCase();
    const requiredModifiers = new Set(
      (keyConfig.modifiers ?? []).map((m) => m.toLowerCase()),
    );

    const handleKeyDown = (event: Event) => {
      const e = event as KeyboardEvent;
      const pressedKey = e.key.toLowerCase();

      if (pressedKey !== targetKey) return;

      const hasMeta =
        e.metaKey || (e.ctrlKey && !requiredModifiers.has("ctrl"));
      const isMetaMatch = requiredModifiers.has("meta") ? hasMeta : !e.metaKey;
      const isCtrlMatch = requiredModifiers.has("ctrl") ? e.ctrlKey : true;
      const isShiftMatch = requiredModifiers.has("shift")
        ? e.shiftKey
        : !e.shiftKey;
      const isAltMatch = requiredModifiers.has("alt") ? e.altKey : !e.altKey;

      if (isMetaMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        handlerRef.current(e);
      }
    };

    const targetEl = target ?? window;
    targetEl.addEventListener("keydown", handleKeyDown);
    return () => {
      targetEl.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, preventDefault, shortcut, target]);
}
