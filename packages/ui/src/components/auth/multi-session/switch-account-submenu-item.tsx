"use client";

import type {
  ListDeviceSession,
  MultiSessionAuthClient,
} from "@better-auth-ui/core/plugins/multi-session";
import { useAuth } from "@better-auth-ui/react";
import { useSetActiveSession } from "@better-auth-ui/react/plugins/multi-session";
import { UserView } from "theo-ui/components/auth/user/user-view";
import { MenuItem } from "theo-ui/components/menu";
import { Spinner } from "theo-ui/components/spinner";

export type SwitchAccountSubmenuItemProps = {
  deviceSession: ListDeviceSession;
};

/**
 * Render a menu item for switching to a different authenticated session.
 *
 * Built with Coss UI MenuItem primitives.
 */
export function SwitchAccountSubmenuItem({
  deviceSession,
}: SwitchAccountSubmenuItemProps) {
  const { authClient } = useAuth<MultiSessionAuthClient>();
  const { mutate: setActiveSession, isPending } = useSetActiveSession(
    authClient,
    {
      onSuccess: () => window.scrollTo({ top: 0 }),
    },
  );

  return (
    <MenuItem
      disabled={isPending}
      onClick={() =>
        setActiveSession({ sessionToken: deviceSession.session.token })
      }
    >
      <UserView user={deviceSession.user} />

      {isPending && <Spinner className="ms-auto size-4" />}
    </MenuItem>
  );
}
