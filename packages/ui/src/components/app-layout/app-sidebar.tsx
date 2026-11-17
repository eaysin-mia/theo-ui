"use client";

import * as React from "react";
import { NavMain } from "@theo/ui/app-layout/nav-main";
import { TeamSwitcher } from "@theo/ui/app-layout/team-switcher";
import { Kbd } from "@theo/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@theo/ui/sidebar";
import { LayoutDashboardIcon, SearchIcon } from "lucide-react";
import type { NavMainItem } from "@theo/ui/app-layout/nav-main";

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  app?: {
    name: string;
    logo: React.ReactNode;
    subtitle?: string;
    href?: string;
  };
  teams?: {
    name: string;
    logo: React.ReactNode;
    plan: string;
  }[];
  navItems: NavMainItem[];
  currentPath?: string;
  onSearchClick?: () => void;
  onAddTeam?: () => void;
  renderUser?: (options: { isMobile: boolean }) => React.ReactNode;
  renderLink?: (
    props: React.ComponentProps<"a"> & {
      href: string;
      children?: React.ReactNode;
    },
  ) => React.ReactElement;
};

const defaultApp = {
  name: "Application",
  logo: <LayoutDashboardIcon aria-hidden="true" />,
  href: "/",
};

export function AppBrand({
  app = defaultApp,
  renderLink,
}: {
  app?: {
    name: string;
    logo: React.ReactNode;
    subtitle?: string;
    href?: string;
  };
  renderLink?: (
    props: React.ComponentProps<"a"> & {
      href: string;
      children?: React.ReactNode;
    },
  ) => React.ReactElement;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const handleBrandClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const content = (
    <SidebarMenuButton size="lg" tooltip={app.name}>
      <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/60 text-foreground transition-colors group-hover:border-foreground/20 group-hover:bg-accent [&>svg]:size-4">
        {app.logo}
      </div>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-semibold text-foreground">
          {app.name}
        </span>
        {app.subtitle && (
          <span className="truncate text-xs text-muted-foreground">
            {app.subtitle}
          </span>
        )}
      </div>
    </SidebarMenuButton>
  );

  const wrappedLink =
    renderLink && app.href ? (
      renderLink({
        href: app.href,
        onClick: handleBrandClick,
        children: content,
      })
    ) : (
      <a href={app.href ?? "/"} onClick={handleBrandClick}>
        {content}
      </a>
    );

  return (
    <SidebarMenu>
      <SidebarMenuItem>{wrappedLink}</SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({
  app = defaultApp,
  teams = [],
  navItems,
  currentPath,
  onSearchClick,
  onAddTeam,
  renderUser,
  renderLink,
  ...props
}: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const handleSearchClick = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onSearchClick?.();
  }, [isMobile, setOpenMobile, onSearchClick]);

  const hasTeams = Boolean(teams && teams.length > 0);
  const brandElement = hasTeams ? (
    <TeamSwitcher teams={teams} onAddTeam={onAddTeam} />
  ) : (
    <AppBrand app={app} renderLink={renderLink} />
  );
  const items = React.useMemo(() => {
    return navItems.map((item) => {
      const isItemActive = currentPath
        ? item.url === currentPath ||
          (item.url !== "/" && currentPath.startsWith(item.url))
        : false;

      const subItems = item.items?.map((sub) => ({
        ...sub,
        isActive: currentPath ? currentPath === sub.url : undefined,
      }));

      const hasActiveSub = subItems?.some((sub) => sub.isActive);

      return {
        ...item,
        isActive: isItemActive || hasActiveSub,
        items: subItems,
      };
    });
  }, [currentPath, navItems]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-1 p-2 pb-1">
        {/* Expanded state: Brand/Workspace with inline collapse toggle */}
        <div className="flex items-center justify-between gap-1 group-data-[collapsible=icon]:hidden">
          <div className="min-w-0 flex-1">{brandElement}</div>
          <SidebarTrigger className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>

        {/* Collapsed icon rail state: top expand trigger and brand logo */}
        <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
          <SidebarTrigger className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          {brandElement}
        </div>

        {/* Quick Search / Command Trigger */}
        {onSearchClick && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                variant="outline"
                tooltip="Search (⌘K)"
                onClick={handleSearchClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <SearchIcon className="size-4 shrink-0" />
                <span className="truncate">Search...</span>
                <Kbd className="ms-auto text-[10px] group-data-[collapsible=icon]:hidden">
                  ⌘K
                </Kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} renderLink={renderLink} className="pt-1" />
      </SidebarContent>
      <SidebarFooter>
        {renderUser && (
          <SidebarMenu>
            <SidebarMenuItem>{renderUser({ isMobile })}</SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
