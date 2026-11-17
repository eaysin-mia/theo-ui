"use client";

import * as React from "react";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from "@theo/ui/menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@theo/ui/sidebar";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";

export function TeamSwitcher({
  teams,
  onAddTeam,
}: {
  teams: {
    name: string;
    logo: React.ReactNode;
    plan: string;
  }[];
  onAddTeam?: () => void;
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger
            render={<SidebarMenuButton size="lg" tooltip={activeTeam.name} />}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-border/80 bg-muted/60 text-foreground transition-colors group-hover:border-foreground/20 group-hover:bg-accent [&>svg]:size-4">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {activeTeam.plan}
              </span>
            </div>
            <ChevronsUpDownIcon className="ms-auto" aria-hidden="true" />
          </MenuTrigger>
          <MenuPopup
            className="w-(--anchor-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <MenuGroup>
              <MenuGroupLabel>Teams</MenuGroupLabel>
              {teams.map((team, index) => (
                <MenuItem key={team.name} onClick={() => setActiveTeam(team)}>
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {team.logo}
                  </div>
                  {team.name}
                  <MenuShortcut>⌘{index + 1}</MenuShortcut>
                </MenuItem>
              ))}
            </MenuGroup>
            {onAddTeam && (
              <>
                <MenuSeparator />
                <MenuGroup>
                  <MenuItem onClick={onAddTeam}>
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <PlusIcon aria-hidden="true" />
                    </div>
                    <span className="font-medium text-muted-foreground">
                      Add team
                    </span>
                  </MenuItem>
                </MenuGroup>
              </>
            )}
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
