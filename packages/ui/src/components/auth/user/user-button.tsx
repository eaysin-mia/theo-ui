"use client";

import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session";
import { useAuth, useSession } from "@better-auth-ui/react";
import { useSetActiveSession } from "@better-auth-ui/react/plugins/multi-session";
import type { User } from "better-auth";
import {
  ChevronsUpDown,
  LogIn,
  LogOut,
  Settings,
  UserPlus2,
} from "lucide-react";
import { isValidElement, type ReactElement, type ReactNode } from "react";

import { buttonVariants } from "@theo/ui/components/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@theo/ui/components/menu";
import { cn } from "@theo/ui/lib/utils";
import { UserAvatar } from "./user-avatar";
import { UserView } from "./user-view";

/** Auth states a `UserButton` link can be visible in. */
export type UserButtonLinkVisibility =
  "authenticated" | "unauthenticated" | "always";

/** A simple link entry rendered as a `MenuItem` in the `UserButton` menu. */
export type UserButtonLink = {
  /** Visible label. */
  label: ReactNode;
  /** Destination URL. */
  href: string;
  /** Optional leading icon. Sized/coloured to match built-in items. */
  icon?: ReactNode;
  /** Forwarded to the underlying `MenuItem`. */
  variant?: "default" | "destructive";
  /**
   * When this link is visible based on auth state.
   * @default "always"
   */
  visibility?: UserButtonLinkVisibility;
};

export type UserButtonProps = {
  render?: React.ReactElement;
  className?: string;
  popupClassName?: string;
  align?: "center" | "end" | "start" | undefined;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  size?: "default" | "icon";
  variant?:
    "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
  /** Additional menu entries rendered above the built-in items. */
  links?: (UserButtonLink | ReactElement)[];
  /** Hide the built-in "Settings" link. Useful when replacing it via `links`. */
  hideSettings?: boolean;
};

function renderUserLink(
  link: UserButtonLink | ReactElement,
  navigate: (options: { to: string; replace?: boolean }) => void,
  fallbackKey: string,
): ReactNode {
  if (isValidElement(link)) return link;

  const { label, href, icon, variant } = link;
  return (
    <MenuItem
      key={fallbackKey}
      onClick={() => navigate({ to: href })}
      variant={variant}
    >
      {icon}
      {label}
    </MenuItem>
  );
}

/**
 * Render a user dropdown button that shows user info, settings, theme controls, and authentication actions.
 *
 * Built with Coss UI Menu primitives.
 */
export function UserButton({
  align,
  className,
  hideSettings = false,
  links,
  popupClassName,
  render,
  side,
  sideOffset,
  size = "default",
  variant = "ghost",
}: UserButtonProps) {
  const { authClient, basePaths, localization, navigate, plugins, viewPaths } =
    useAuth<MultiSessionAuthClient>();

  const { isPending: settingActiveSession } = useSetActiveSession(authClient);
  const { data: session, isPending: sessionPending } = useSession(authClient);

  const user = session?.user as
    | (User & {
        username?: string | null;
        displayUsername?: string | null;
      })
    | undefined;

  const userLinks = links?.flatMap((link, index) => {
    if (!isValidElement(link)) {
      const visibility = link.visibility ?? "always";
      if (visibility === "authenticated" && !session) return [];
      if (visibility === "unauthenticated" && session) return [];
    }
    return [
      renderUserLink(link, navigate, `user-button-link-${index.toString()}`),
    ];
  });

  // Whether anything renders between the user info label and the
  // sign-out item, so the leading separator isn't shown with nothing
  // to separate (see #439).
  const hasSessionMenuItems =
    (userLinks?.length ?? 0) > 0 ||
    !hideSettings ||
    plugins.some((plugin) => (plugin.userMenuItems?.length ?? 0) > 0);

  return (
    <Menu>
      <MenuTrigger
        aria-label={size === "icon" ? localization.auth.account : undefined}
        className={
          render
            ? className
            : size === "icon"
              ? cn(
                  buttonVariants({ size: "icon", variant: "ghost" }),
                  "size-8 rounded-full p-0 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden",
                  className,
                )
              : cn(
                  buttonVariants({ size: "lg", variant }),
                  "h-auto py-2.5 font-normal",
                  className,
                )
        }
        render={render}
      >
        {size === "icon" ? (
          <UserAvatar />
        ) : (
          <>
            {session || sessionPending || settingActiveSession ? (
              <UserView
                className="flex-1"
                isPending={!!settingActiveSession || sessionPending}
              />
            ) : (
              <>
                <UserAvatar />

                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium in-data-[slot=sidebar-menu-button]:text-inherit">
                    {localization.auth.account}
                  </span>
                </div>
              </>
            )}

            <ChevronsUpDown
              aria-hidden="true"
              className="ms-auto size-4 shrink-0 opacity-64 group-data-[collapsible=icon]:hidden"
            />
          </>
        )}
      </MenuTrigger>

      <MenuPopup
        align={align}
        className={cn("w-60 min-w-56 p-1", popupClassName)}
        side={side}
        sideOffset={sideOffset}
      >
        {session && user ? (
          <>
            <div className="flex items-center gap-2.5 px-2 py-2 text-left select-none">
              <UserAvatar className="size-8 shrink-0" user={user} />
              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm font-medium text-foreground">
                  {user.displayUsername ||
                    user.username ||
                    user.name ||
                    user.email}
                </span>
                {user.email && (
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            {hasSessionMenuItems && <MenuSeparator />}

            {userLinks}

            {!hideSettings && (
              <MenuItem
                onClick={() =>
                  navigate({
                    to: `${basePaths.settings}/${viewPaths.settings.account}`,
                  })
                }
              >
                <Settings aria-hidden="true" />

                {localization.settings.settings}
              </MenuItem>
            )}

            {plugins.flatMap((plugin) =>
              plugin.userMenuItems?.map((Item, index) => (
                <Item key={`${plugin.id}-${index.toString()}`} />
              )),
            )}

            <MenuSeparator />

            <MenuItem
              onClick={() =>
                navigate({
                  to: `${basePaths.auth}/${viewPaths.auth.signOut}`,
                })
              }
              variant="destructive"
            >
              <LogOut aria-hidden="true" />

              {localization.auth.signOut}
            </MenuItem>
          </>
        ) : (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground select-none">
              {localization.auth.account}
            </div>

            <MenuSeparator />

            {userLinks}

            <MenuItem
              onClick={() =>
                navigate({
                  to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
                })
              }
            >
              <LogIn aria-hidden="true" />

              {localization.auth.signIn}
            </MenuItem>

            <MenuItem
              onClick={() =>
                navigate({
                  to: `${basePaths.auth}/${viewPaths.auth.signUp}`,
                })
              }
            >
              <UserPlus2 aria-hidden="true" />

              {localization.auth.signUp}
            </MenuItem>

            {plugins.flatMap((plugin) =>
              plugin.userMenuItems?.map((Item, index) => (
                <Item key={`${plugin.id}-${index.toString()}`} />
              )),
            )}
          </>
        )}
      </MenuPopup>
    </Menu>
  );
}
