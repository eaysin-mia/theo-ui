"use client";

import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session";
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import { useListDeviceSessions } from "@better-auth-ui/react/plugins/multi-session";
import { Check, CirclePlus } from "lucide-react";
import { UserView } from "theo-ui/components/auth/user/user-view";
import { MenuItem, MenuSeparator, MenuSubPopup } from "theo-ui/components/menu";
import { multiSessionPlugin } from "theo-ui/lib/auth/multi-session-plugin";
import { SwitchAccountSubmenuItem } from "./switch-account-submenu-item";

/**
 * Render the submenu content for switching between multiple authenticated sessions.
 *
 * Built with Coss UI MenuSubPopup primitives.
 */
export function SwitchAccountSubmenuContent() {
  const { authClient, basePaths, viewPaths, navigate } =
    useAuth<MultiSessionAuthClient>();
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin);
  const { data: session } = useSession(authClient);
  const { data: deviceSessions, isPending } = useListDeviceSessions(authClient);

  return (
    <MenuSubPopup className="max-w-[48svw] min-w-48 md:min-w-56">
      <MenuItem>
        <UserView isPending={isPending} />

        {!isPending && <Check aria-hidden="true" className="ms-auto" />}
      </MenuItem>

      {deviceSessions
        ?.filter(
          (deviceSession) => deviceSession.session.id !== session?.session.id,
        )
        .map((deviceSession) => (
          <SwitchAccountSubmenuItem
            key={deviceSession.session.id}
            deviceSession={deviceSession}
          />
        ))}

      <MenuSeparator />

      <MenuItem
        onClick={() =>
          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
          })
        }
      >
        <CirclePlus aria-hidden="true" />

        {multiSessionLocalization.addAccount}
      </MenuItem>
    </MenuSubPopup>
  );
}
