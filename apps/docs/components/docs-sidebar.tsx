"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { docSections, getDocHref } from "@/lib/docs";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-[calc(var(--header-height)+1px)] z-30 hidden h-[calc(100svh-var(--footer-height)-4rem)] bg-transparent lg:flex"
    >
      <SidebarContent className="[scrollbar-width:none] overflow-x-hidden px-2 [&::-webkit-scrollbar]:hidden">
        <div className="sticky -top-1 z-10 h-8 shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs" />
        {docSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="font-medium text-muted-foreground">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.docs.map((doc) => {
                  const href = getDocHref(doc);
                  const active = pathname === href;

                  return (
                    <SidebarMenuItem key={doc.slug}>
                      <SidebarMenuButton
                        isActive={active}
                        className="relative h-7.5 w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent"
                        render={<Link href={href} />}
                      >
                        <span className="absolute inset-0 flex w-(--sidebar-width) bg-transparent" />
                        {doc.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
}
