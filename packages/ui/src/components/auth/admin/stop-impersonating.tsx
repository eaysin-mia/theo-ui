"use client";

import {
  type AdminAuthClient,
  isImpersonatingSession,
} from "@better-auth-ui/core/plugins/admin";
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import { useStopImpersonating } from "@better-auth-ui/react/plugins/admin";
import { UserRoundCheck } from "lucide-react";

import { MenuItem } from "theoui/components/menu";
import { Spinner } from "theoui/components/spinner";
import { adminPlugin } from "theoui/lib/auth/admin-plugin";

export type StopImpersonatingProps = {
  className?: string;
};

/**
 * Restore the administrator's session when the current session is
 * impersonating another user.
 *
 * Built with Coss UI MenuItem primitives.
 */
export function StopImpersonating({ className }: StopImpersonatingProps) {
  const { authClient } = useAuth();
  const { localization } = useAuthPlugin(adminPlugin);
  const { data: session } = useSession(authClient);
  const stopImpersonating = useStopImpersonating(authClient as AdminAuthClient);

  if (!isImpersonatingSession(session)) {
    return null;
  }

  return (
    <MenuItem
      className={className}
      disabled={stopImpersonating.isPending}
      onClick={() => stopImpersonating.mutate(undefined)}
    >
      {stopImpersonating.isPending ? (
        <Spinner />
      ) : (
        <UserRoundCheck aria-hidden="true" className="text-muted-foreground" />
      )}

      {localization.stopImpersonating}
    </MenuItem>
  );
}
