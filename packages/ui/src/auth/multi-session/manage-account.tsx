"use client";

import type {
  ListDeviceSession,
  MultiSessionAuthClient,
} from "@better-auth-ui/core/plugins/multi-session";
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import {
  useRevokeMultiSession,
  useSetActiveSession,
} from "@better-auth-ui/react/plugins/multi-session";
import { ArrowLeftRight, LogOut, MoreHorizontal } from "lucide-react";
import { toastManager } from "theoui/components/toast";
import { UserView } from "theoui/auth/user/user-view";
import { Button, buttonVariants } from "theoui/components/button";
import { Skeleton } from "theoui/components/skeleton";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "theoui/components/menu";
import { Spinner } from "theoui/components/spinner";
import { multiSessionPlugin } from "theoui/lib/auth/multi-session-plugin";
import { cn } from "theoui/lib/utils";

export type ManageAccountProps = {
  deviceSession?: ListDeviceSession | null;
  isPending?: boolean;
};

/**
 * Render a single account row with user info and switch/revoke controls.
 *
 * Shows the user's avatar and info. For the active session, shows a sign-out button.
 * For non-active sessions, shows a dropdown menu with switch and sign-out options.
 *
 * @param deviceSession - The device session object containing session and user data
 * @param isPending - Whether the device session is pending
 * @returns A JSX element containing the account row
 */
export function ManageAccount({
  deviceSession,
  isPending,
}: ManageAccountProps) {
  const { authClient, localization } = useAuth<MultiSessionAuthClient>();
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin);
  const { data: session } = useSession(authClient);

  const { mutate: setActiveSession, isPending: isSwitching } =
    useSetActiveSession(authClient, {
      onSuccess: () => window.scrollTo({ top: 0 }),
    });

  const { mutate: revokeSession, isPending: isRevoking } =
    useRevokeMultiSession(authClient, {
      onSuccess: () =>
        toastManager.add({
          type: "success",
          title: localization.settings.revokeSessionSuccess,
        }),
    });

  const isActive = deviceSession?.session.userId === session?.session.userId;
  const isBusy = isSwitching || isRevoking;

  return (
    <div
      role="listitem"
      className="flex items-center justify-between gap-4 p-4 text-sm"
    >
      <UserView
        className="min-w-0 flex-1"
        user={deviceSession?.user}
        isPending={isPending}
      />
      <div className="flex shrink-0 items-center gap-2">
        {isPending ? <Skeleton className="h-7 w-20 rounded-md" /> : null}

        {deviceSession && isActive && (
          <Button
            className="shrink-0"
            variant="outline"
            size="sm"
            onClick={() =>
              revokeSession({ sessionToken: deviceSession.session.token })
            }
            disabled={isBusy}
          >
            {isRevoking ? <Spinner /> : <LogOut />}
            {localization.auth.signOut}
          </Button>
        )}

        {deviceSession && !isActive && (
          <Menu>
            <MenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "shrink-0",
              )}
              disabled={isBusy}
            >
              <MoreHorizontal />
            </MenuTrigger>

            <MenuPopup align="end" className="min-w-fit">
              <MenuItem
                onClick={() =>
                  setActiveSession({
                    sessionToken: deviceSession.session.token,
                  })
                }
              >
                <ArrowLeftRight className="text-muted-foreground" />
                {multiSessionLocalization.switchAccount}
              </MenuItem>

              <MenuItem
                onClick={() =>
                  revokeSession({
                    sessionToken: deviceSession.session.token,
                  })
                }
              >
                <LogOut className="text-muted-foreground" />
                {localization.auth.signOut}
              </MenuItem>
            </MenuPopup>
          </Menu>
        )}
      </div>
    </div>
  );
}
