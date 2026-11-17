"use client";

import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import { ArrowLeftRight } from "lucide-react";

import { MenuSub, MenuSubTrigger } from "@theo/ui/menu";
import { multiSessionPlugin } from "@theo/ui/auth/plugins/multi-session-plugin";
import { SwitchAccountSubmenuContent } from "@theo/ui/auth/multi-session/switch-account-submenu-content";

export type SwitchAccountSubmenuProps = {
  className?: string;
};

/**
 * Render a submenu trigger for switching between multiple authenticated sessions.
 *
 * Built with Coss UI MenuSub primitives.
 */
export function SwitchAccountSubmenu({ className }: SwitchAccountSubmenuProps) {
  const { authClient } = useAuth();
  const { data: session } = useSession(authClient);
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin);

  if (!session) {
    return null;
  }

  return (
    <MenuSub>
      <MenuSubTrigger className={className}>
        <ArrowLeftRight aria-hidden="true" />

        {multiSessionLocalization.switchAccount}
      </MenuSubTrigger>

      <SwitchAccountSubmenuContent />
    </MenuSub>
  );
}
