"use client";

import { ArrowUpRightIcon, GlobeIcon } from "lucide-react";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@theo/ui/trace";

export interface SourceItem {
  title: string;
  url: string;
}

export function SourcesPart({ sources }: { sources: SourceItem[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <GlobeIcon className="size-3.5" />
            </TraceIcon>
            <TraceTitle>
              Used {sources.length}{" "}
              {sources.length === 1 ? "source" : "sources"}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace className="gap-1">
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="group/source inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <TraceLine>
                  <TraceIcon>
                    <GlobeIcon className="size-3" />
                  </TraceIcon>
                  <TraceTitle className="text-xs">{source.title}</TraceTitle>
                  <TraceIcon>
                    <ArrowUpRightIcon className="size-3 opacity-60 group-hover/source:opacity-100" />
                  </TraceIcon>
                </TraceLine>
              </a>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
