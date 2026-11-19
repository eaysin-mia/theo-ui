"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `true` once the component has mounted on the client (hydrated),
 * and `false` during server-side rendering or before hydration.
 *
 * Safe for conditional rendering of client-only APIs (localStorage, window dimensions,
 * portals, local time formatting) without React hydration mismatch warnings.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
