"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "theo-ui/components/sidebar";
import {
  MoreHorizontalIcon,
  FolderIcon,
  ArrowRightIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "theo-ui/components/menu";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: React.ReactNode;
  }[];
}) {
  const { isMobile } = useSidebar();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton render={<a href={item.url} />}>
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
            <Menu>
              <MenuTrigger render={<SidebarMenuAction showOnHover />}>
                <MoreHorizontalIcon aria-hidden="true" />
                <span className="sr-only">More</span>
              </MenuTrigger>
              <MenuPopup
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <MenuItem>
                  <FolderIcon aria-hidden="true" />
                  View Project
                </MenuItem>
                <MenuItem>
                  <ArrowRightIcon aria-hidden="true" />
                  Share Project
                </MenuItem>
                <MenuSeparator />
                <MenuItem variant="destructive">
                  <Trash2Icon aria-hidden="true" />
                  Delete Project
                </MenuItem>
              </MenuPopup>
            </Menu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon
              aria-hidden="true"
              className="text-sidebar-foreground/70"
            />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
