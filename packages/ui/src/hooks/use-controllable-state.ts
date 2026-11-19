"use client";

import { useCallback, useRef, useState } from "react";

export interface UseControllableStateProps<T> {
  /** The controlled value */
  value?: T;
  /** The initial uncontrolled default value */
  defaultValue?: T | (() => T);
  /** Change callback when state updates */
  onChange?: (value: T) => void;
}

/**
 * Manages state that can be either controlled by the caller or uncontrolled internally.
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateProps<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(
    defaultValue as T,
  );

  const value = isControlled ? controlledValue : uncontrolledValue;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const nextValue =
        typeof next === "function" ? (next as (prev: T) => T)(value) : next;

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChangeRef.current?.(nextValue);
    },
    [isControlled, value],
  );

  return [value, setValue];
}
