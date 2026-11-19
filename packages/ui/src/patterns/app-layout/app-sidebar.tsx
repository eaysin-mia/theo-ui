"use client";

import * as React from "react";
import { UserButton } from "theoui/components/auth/user/user-button";
import { NavMain, type NavMainItem } from "theoui/patterns/app-layout/nav-main";
import { TeamSwitcher } from "theoui/patterns/app-layout/team-switcher";
import { Kbd } from "theoui/components/kbd";
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
} from "theoui/components/sidebar";
import { GalleryVerticalEndIcon, SearchIcon } from "lucide-react";

export function SidebarUser() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton
          render={<SidebarMenuButton size="lg" tooltip="Account" />}
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
          className="w-full"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export type SidebarTeam = {
  name: string;
  logo: React.ReactNode;
  plan: string;
};

export type SidebarApp = {
  name: string;
  logo?: React.ReactNode;
  subtitle?: string;
  href?: string;
};

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  app?: SidebarApp;
  teams?: SidebarTeam[];
  items?: NavMainItem[];
  currentPath?: string;
  onSearchClick?: () => void;
  renderLink?: (
    props: React.ComponentProps<"a"> & {
      href: string;
      children?: React.ReactNode;
    },
  ) => React.ReactElement;
  user?: React.ReactNode;
  footer?: React.ReactNode;
};

export const defaultApp: SidebarApp = {
  name: "App",
  logo: <GalleryVerticalEndIcon aria-hidden="true" />,
  href: "/",
};

export function AppBrand({
  app = defaultApp,
  renderLink,
}: {
  app?: SidebarApp;
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
      {app.logo && (
        <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/60 text-foreground transition-colors group-hover:border-foreground/20 group-hover:bg-accent [&>svg]:size-4">
          {app.logo}
        </div>
      )}
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
  items: navItems = [],
  currentPath,
  onSearchClick,
  renderLink,
  user,
  footer,
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
    <TeamSwitcher teams={teams} />
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
  }, [navItems, currentPath]);

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
        {items.length > 0 && (
          <NavMain items={items} renderLink={renderLink} className="pt-1" />
        )}
      </SidebarContent>
      <SidebarFooter>
        {footer ??
          (user ? (
            <SidebarMenu>
              <SidebarMenuItem>{user}</SidebarMenuItem>
            </SidebarMenu>
          ) : (
            <SidebarUser />
          ))}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
