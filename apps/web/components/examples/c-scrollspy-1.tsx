"use client";

import { useRef } from "react";
import { Scrollspy } from "@workspace/ui/components/scrollspy";

import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

export function Pattern() {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const nav = [
    {
      id: "section-1",
      label: "Section 1",
    },
    {
      id: "section-2",
      label: "Section 2",
    },
    {
      id: "section-3",
      label: "Section 3",
    },
    {
      id: "section-4",
      label: "Section 4",
    },
    {
      id: "section-5",
      label: "Section 5",
    },
  ];

  return (
    <div className="flex w-full grow gap-5">
      <div className="flex w-37.5 flex-col gap-2">
        <Scrollspy
          offset={50}
          defaultValue="section-1"
          targetRef={parentRef}
          className="flex flex-col gap-2.5"
        >
          {nav.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              data-scrollspy-anchor={item.id}
              className="data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:before:hidden data-[active=true]:hover:bg-primary/90 data-[active=true]:hover:text-primary-foreground data-[active=true]:data-pressed:bg-primary/90 dark:data-[active=true]:border-primary dark:data-[active=true]:bg-primary dark:data-[active=true]:text-primary-foreground dark:data-[active=true]:hover:bg-primary/90 dark:data-[active=true]:data-pressed:bg-primary/90"
            >
              {item.label}
            </Button>
          ))}
        </Scrollspy>
      </div>
      <div className="grow" ref={parentRef}>
        <ScrollArea className="-me-5 h-125 grow pe-5">
          <div className="space-y-8">
            {nav.map((item) => (
              <div key={item.id} id={item.id} className="space-y-2.5">
                <h3 className="text-base text-foreground">{item.label}</h3>
                <div className="h-87.5 rounded-2xl bg-muted"></div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
