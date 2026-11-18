"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { ChevronDownIcon } from "lucide-react";

export interface NavMainItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  badge?: React.ReactNode;
  items?: {
    title: string;
    url: string;
    isActive?: boolean;
    badge?: React.ReactNode;
  }[];
}

export function NavMain({
  label,
  items,
  className,
  renderLink,
}: {
  label?: string;
  items: NavMainItem[];
  className?: string;
  renderLink?: (
    props: React.ComponentProps<"a"> & {
      href: string;
      children?: React.ReactNode;
    },
  ) => React.ReactElement;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const handleLinkClick = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <SidebarGroup className={className}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  render={(buttonProps) =>
                    renderLink ? (
                      renderLink({
                        ...buttonProps,
                        href: item.url,
                        onClick: (e) => {
                          buttonProps?.onClick?.(e);
                          handleLinkClick();
                        },
                      })
                    ) : (
                      <a
                        {...buttonProps}
                        href={item.url}
                        onClick={(e) => {
                          buttonProps?.onClick?.(e);
                          handleLinkClick();
                        }}
                      />
                    )
                  }
                  isActive={item.isActive}
                >
                  {item.icon}
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ms-auto flex items-center">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <NavMainCollapsibleItem
              key={item.title}
              item={item}
              renderLink={renderLink}
              onNavigate={handleLinkClick}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavMainCollapsibleItem({
  item,
  renderLink,
  onNavigate,
}: {
  item: NavMainItem;
  renderLink?: (
    props: React.ComponentProps<"a"> & {
      href: string;
      children?: React.ReactNode;
    },
  ) => React.ReactElement;
  onNavigate?: () => void;
}) {
  const hasActiveSub = item.items?.some((sub) => sub.isActive);
  const isParentActive = item.isActive || hasActiveSub;
  const [open, setOpen] = React.useState(Boolean(isParentActive));

  React.useEffect(() => {
    if (isParentActive) {
      setOpen(true);
    }
  }, [isParentActive]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton tooltip={item.title} isActive={isParentActive} />
        }
      >
        {item.icon}
        <span>{item.title}</span>
        {item.badge && (
          <span className="ms-auto me-1 flex items-center">{item.badge}</span>
        )}
        <ChevronDownIcon
          aria-hidden="true"
          className="ms-auto size-4 shrink-0 opacity-70 transition-transform duration-200 group-data-open/collapsible:rotate-180 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub variant="flat">
          {item.items?.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                render={(buttonProps) =>
                  renderLink ? (
                    renderLink({
                      ...buttonProps,
                      href: subItem.url,
                      onClick: (e) => {
                        buttonProps?.onClick?.(e);
                        onNavigate?.();
                      },
                    })
                  ) : (
                    <a
                      {...buttonProps}
                      href={subItem.url}
                      onClick={(e) => {
                        buttonProps?.onClick?.(e);
                        onNavigate?.();
                      }}
                    />
                  )
                }
                isActive={subItem.isActive}
              >
                <span>{subItem.title}</span>
                {subItem.badge && (
                  <span className="ms-auto flex items-center">
                    {subItem.badge}
                  </span>
                )}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
