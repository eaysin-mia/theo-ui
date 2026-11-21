"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  AppSidebar,
  useSidebar,
} from "theoui";
import { UserButton } from "theoui/auth";
import { cn } from "theoui/lib";
import { GalleryVerticalEndIcon, SearchIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "@/components/command-palette";
import { dashboardNavItems } from "@/lib/navigation";

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

function DashboardSidebarUser() {
  const { isMobile } = useSidebar();
  return (
    <UserButton
      render={<SidebarMenuButton size="lg" tooltip="Account" />}
      side={isMobile ? "bottom" : "right"}
      align="end"
      sideOffset={4}
      className="w-full"
    />
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
        app={{
          name: "Theo UI",
          logo: <GalleryVerticalEndIcon aria-hidden="true" />,
          subtitle: "Workspace",
          href: "/",
        }}
        items={dashboardNavItems}
        teams={[]}
        currentPath={pathname}
        onSearchClick={() => setOpen(true)}
        user={<DashboardSidebarUser />}
        renderLink={({
          href,
          children,
          ...rest
        }: {
          href?: string;
          children?: React.ReactNode;
        }) => (
          <Link href={href ?? "/"} {...rest}>
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
