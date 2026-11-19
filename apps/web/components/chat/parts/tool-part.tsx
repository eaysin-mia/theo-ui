"use client";

import { StatusIcon } from "@/components/chat/status-icon";
import { CodeBlock, CodeBlockContent } from "theo-ui/patterns/code-block";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "theo-ui/components/trace";

export interface ToolPartProps {
  toolName: string;
  queryOrTarget?: string;
  status?: "running" | "error" | "pending";
  output?: Record<string, unknown> | string;
  duration?: number;
}

export function ToolPart({
  toolName,
  queryOrTarget,
  status,
  output,
  duration,
}: ToolPartProps) {
  const isRunning = status === "running";
  const title = isRunning
    ? `Running ${toolName}${queryOrTarget ? `: ${queryOrTarget}` : ""}`
    : `Executed ${toolName}${queryOrTarget ? `: ${queryOrTarget}` : ""}`;

  const line = (
    <TraceLine status={status}>
      <TraceIcon>
        <StatusIcon status={status} />
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
      {!isRunning && duration && (
        <TraceDescription>
          {Math.max(1, Math.round(duration / 1000))}s
        </TraceDescription>
      )}
    </TraceLine>
  );

  if (!output) {
    return line;
  }

  const outputString =
    typeof output === "string" ? output : JSON.stringify(output, null, 2);

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <CodeBlock size="sm">
          <CodeBlockContent wrap className="max-h-56">
            {outputString}
          </CodeBlockContent>
        </CodeBlock>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
