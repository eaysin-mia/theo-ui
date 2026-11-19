"use client";

import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session";
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import { useListDeviceSessions } from "@better-auth-ui/react/plugins/multi-session";
import { Fragment } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/components/card";
import { Separator } from "@theo/ui/components/separator";
import { multiSessionPlugin } from "@theo/ui/lib/auth/multi-session-plugin";
import { ManageAccount } from "./manage-account";

export type ManageAccountsProps = {
  className?: string;
};

/**
 * Render a card that lists and manages all device sessions for the current user.
 *
 * Shows each session with user information and actions to switch to or revoke a session.
 * When device session data is loading, a pending placeholder row is displayed.
 *
 * @returns A JSX element containing the accounts management card
 */
export function ManageAccounts({ className }: ManageAccountsProps) {
  const { authClient } = useAuth<MultiSessionAuthClient>();
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin);
  const { data: session } = useSession(authClient);

  const { data: deviceSessions, isPending } = useListDeviceSessions(authClient);

  const otherSessions = deviceSessions?.filter(
    (deviceSession) => deviceSession.session.id !== session?.session.id,
  );

  const allRows = [
    {
      key: session?.session.id ?? "current",
      deviceSession: !isPending ? session : null,
      isPending,
    },
    ...(otherSessions?.map((deviceSession) => ({
      key: deviceSession.session.id,
      deviceSession,
      isPending: false,
    })) ?? []),
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{multiSessionLocalization.manageAccounts}</CardTitle>
        <CardDescription>
          Switch between active accounts or sign out from this device.
        </CardDescription>
      </CardHeader>

      <CardPanel className="p-0">
        <div role="list" className="flex flex-col">
          {allRows.map((row, index) => (
            <Fragment key={row.key}>
              {index > 0 && <Separator />}
              <ManageAccount
                deviceSession={row.deviceSession}
                isPending={row.isPending}
              />
            </Fragment>
          ))}
        </div>
      </CardPanel>
    </Card>
  );
}
