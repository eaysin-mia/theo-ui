"use client";

import * as React from "react";
import { StatusIcon } from "@/components/chat/status-icon";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "theoui/components/trace";

export function ReasoningPart({
  text,
  isStreaming = false,
  duration,
}: {
  text: string;
  isStreaming?: boolean;
  duration?: number;
}) {
  const [open, setOpen] = React.useState<boolean>(isStreaming);
  const status = isStreaming ? "running" : undefined;

  const line = (
    <TraceLine status={status}>
      <TraceIcon>
        <StatusIcon status={status} />
      </TraceIcon>
      <TraceTitle>{isStreaming ? "Thinking..." : "Thought process"}</TraceTitle>
      {!isStreaming && duration !== undefined && (
        <TraceDescription>
          {Math.max(1, Math.round(duration / 1000))}s
        </TraceDescription>
      )}
    </TraceLine>
  );

  if (!text) {
    return line;
  }

  return (
    <TraceCollapsible open={open} onOpenChange={setOpen}>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="font-mono text-xs whitespace-pre-wrap">
        {text}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
