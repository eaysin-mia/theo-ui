"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@workspace/ui/components/app-layout";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import { SearchIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "@/components/command-palette";

function MobileSearchTrigger() {
  const { setOpen } = useCommandPalette();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Open command palette"
    >
      <SearchIcon className="size-4" />
    </button>
  );
}

function DashboardInner({
  children,
  defaultOpen,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  const { setOpen } = useCommandPalette();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        teams={[]}
        currentPath={pathname}
        onSearchClick={() => setOpen(true)}
        renderLink={({ href, children, ...rest }) => (
          <Link href={href} {...rest}>
            {children}
          </Link>
        )}
      />
      <SidebarInset
        className={cn(
          "relative flex h-svh min-w-0 flex-col",
          pathname.startsWith("/chat")
            ? "overflow-hidden"
            : "overflow-x-hidden overflow-y-auto",
        )}
      >
        {/* Mobile App Bar (md:hidden) - in normal flow, so it never overlaps page content */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2.5">
            <SidebarTrigger className="size-8 text-muted-foreground hover:text-foreground" />
            <span className="text-sm font-semibold tracking-tight">
              Theo UI
            </span>
          </div>
          <MobileSearchTrigger />
        </header>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            pathname.startsWith("/chat")
              ? "overflow-hidden p-0"
              : "mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8",
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardShell({
  children,
  defaultOpen,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <CommandPaletteProvider>
      <DashboardInner defaultOpen={defaultOpen}>{children}</DashboardInner>
    </CommandPaletteProvider>
  );
}
