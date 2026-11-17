"use client";

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import { useListUserInvitations } from "@better-auth-ui/react/plugins/organization";
import { Fragment } from "react";

import {
  Card,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/card";
import { Separator } from "@theo/ui/separator";
import { organizationPlugin } from "@theo/ui/auth/plugins/organization-plugin";
import { UserInvitationRow } from "@theo/ui/auth/organization/user-invitation-row";
import { UserInvitationRowSkeleton } from "@theo/ui/auth/organization/user-invitation-row-skeleton";
import { UserInvitationsEmpty } from "@theo/ui/auth/organization/user-invitations-empty";

export type UserInvitationsProps = {
  className?: string;
};

/**
 * Organization invitations for the signed-in user. Always renders the section
 * card; uses `UserInvitationsEmpty` when there are no pending invitations.
 */
export function UserInvitations({ className }: UserInvitationsProps) {
  const { authClient } = useAuth<OrganizationAuthClient>();
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin);
  const session = useSession(authClient);
  const emailVerified = session.data?.user.emailVerified === true;

  const { data: invitations, isPending } = useListUserInvitations(authClient, {
    enabled: emailVerified,
  });

  return (
    <Card className={className}>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>{organizationLocalization.invitations}</CardTitle>
      </CardHeader>

      <CardPanel className="p-0">
        {session.isPending || (emailVerified && isPending) ? (
          <div role="list" className="flex flex-col">
            <UserInvitationRowSkeleton />
          </div>
        ) : !invitations?.length ? (
          <UserInvitationsEmpty verificationRequired={!emailVerified} />
        ) : (
          <div role="list" className="flex flex-col">
            {invitations.map((invitation, index) => (
              <Fragment key={invitation.id}>
                {index > 0 && <Separator />}
                <UserInvitationRow invitation={invitation} />
              </Fragment>
            ))}
          </div>
        )}
      </CardPanel>
    </Card>
  );
}
