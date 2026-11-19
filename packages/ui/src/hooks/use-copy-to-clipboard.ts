"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCopyToClipboardOptions {
  /** Timeout in milliseconds before resetting `copied` state. Defaults to 2000ms. */
  timeout?: number;
  /** Optional callback on successful copy */
  onCopy?: (text: string) => void;
  /** Optional callback on copy error */
  onError?: (error: Error) => void;
}

export interface UseCopyToClipboardResult {
  /** Whether text was recently copied successfully */
  copied: boolean;
  /** Copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Reset copied state manually */
  reset: () => void;
}

/**
 * Copies text to the system clipboard with automatic status timeout and fallback.
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardResult {
  const { timeout = 2000, onCopy, onError } = options;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      reset();

      if (!text && text !== "") {
        return false;
      }

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for non-secure contexts or older browsers
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          textarea.style.top = "0";
          textarea.setAttribute("readonly", "");
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }

        setCopied(true);
        onCopy?.(text);

        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to copy");
        onError?.(error);
        setCopied(false);
        return false;
      }
    },
    [onCopy, onError, reset, timeout],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { copied, copy, reset };
}
