"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CopyPageButton() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyPageLink() {
    setError("");
    if (!navigator.clipboard?.writeText) {
      setError("Clipboard access is unavailable in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch (reason) {
      if (reason instanceof DOMException) {
        setError("The page link could not be copied.");
        return;
      }

      throw reason;
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={copied ? "Page link copied" : "Copy page link"}
              onClick={copyPageLink}
            />
          }
        >
          {copied ? <Check /> : <Copy />}
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied" : "Copy page link"}</TooltipContent>
      </Tooltip>
      <span role="status" className="sr-only">
        {error}
      </span>
    </>
  );
}
