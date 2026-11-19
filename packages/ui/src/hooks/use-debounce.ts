"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value by delaying updates until a specified time has passed.
 *
 * @param value The value to debounce.
 * @param delay Milliseconds to delay updates. Defaults to 300ms.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
