import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and merges Tailwind CSS classes without style conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Re-export Base UI composition primitives
export { useRender } from "@base-ui/react/use-render";
export { mergeProps } from "@base-ui/react/merge-props";

/**
 * Chains multiple event handlers together.
 * If the original event handler calls `event.preventDefault()`, subsequent handlers
 * will not be executed unless `checkForDefaultPrevented` is false.
 */
export function composeEventHandlers<E extends React.SyntheticEvent | Event>(
  originalHandler?: (event: E) => void,
  ourHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalHandler?.(event);
    if (!checkForDefaultPrevented || !event.defaultPrevented) {
      return ourHandler?.(event);
    }
  };
}

/**
 * Creates a React Context along with a type-safe hook that guarantees
 * the consumer is rendered within its corresponding Provider.
 */
export function createSafeContext<ContextType>(componentName: string) {
  const Context = React.createContext<ContextType | null>(null);

  function useSafeContext(): ContextType {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(
        `[${componentName}]: Compound components must be rendered inside <${componentName} />`,
      );
    }
    return context;
  }

  return [Context.Provider, useSafeContext, Context] as const;
}
