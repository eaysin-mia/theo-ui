"use client";

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import {
  useAcceptInvitation,
  useRejectInvitation,
} from "@better-auth-ui/react/plugins/organization";
import type { Invitation } from "better-auth/client";
import { Check, Clock, X } from "lucide-react";

import { Badge } from "@theo/ui/components/badge";
import { Button } from "@theo/ui/components/button";
import { Spinner } from "@theo/ui/components/spinner";
import { organizationPlugin } from "@theo/ui/lib/auth/organization-plugin";

export type UserInvitationRowProps = {
  invitation: Invitation & { organizationName?: string };
};

/**
 * Single invitation row with accept/reject actions for the current user.
 */
export function UserInvitationRow({ invitation }: UserInvitationRowProps) {
  const { authClient } = useAuth<OrganizationAuthClient>();
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin);

  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation(authClient);

  const { mutate: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation(authClient);

  return (
    <div
      role="listitem"
      className="flex items-center justify-between gap-4 p-4 text-sm"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
          <Clock />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2 truncate text-sm leading-snug font-semibold text-foreground">
            <span>{invitation.organizationName}</span>
            <Badge variant="secondary">
              {roles?.[invitation.role] ?? invitation.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(invitation.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isAccepting || isRejecting}
          onClick={() => acceptInvitation({ invitationId: invitation.id })}
        >
          {isAccepting ? <Spinner /> : <Check />}
          {organizationLocalization.accept}
        </Button>

        <Button
          variant="outline"
          size="icon-sm"
          className="text-destructive"
          disabled={isAccepting || isRejecting}
          onClick={() => rejectInvitation({ invitationId: invitation.id })}
          aria-label={organizationLocalization.rejectInvitation}
        >
          {isRejecting ? <Spinner /> : <X />}
        </Button>
      </div>
    </div>
  );
}
