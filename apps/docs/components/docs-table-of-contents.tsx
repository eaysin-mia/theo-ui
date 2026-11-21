"use client";

import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";

import type { DocHeading } from "@/lib/docs";

export function DocsTableOfContents({ headings }: { headings: DocHeading[] }) {
  const pathname = usePathname();

  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);

    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const activeLine = window.innerHeight * 0.2;
    let activeId = headings[0]?.id ?? "";

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element && element.getBoundingClientRect().top <= activeLine) {
        activeId = heading.id;
      }
    }

    return activeId;
  }, [headings]);

  const getServerSnapshot = useCallback(
    () => headings[0]?.id ?? "",
    [headings],
  );

  const activeHeading = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="On this page"
      className="flex flex-col gap-2 p-4 pt-0 text-sm"
    >
      <p className="sticky top-0 flex h-6 items-center bg-background text-xs text-muted-foreground">
        On This Page
      </p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`${pathname}#${heading.id}`}
          data-active={heading.id === activeHeading}
          data-depth={heading.depth}
          className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:text-foreground data-[depth=3]:pl-4 data-[depth=4]:pl-6"
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );
}
