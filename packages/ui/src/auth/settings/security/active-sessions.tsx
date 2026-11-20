"use client";

import {
  getAuthErrorMessage,
  isReauthenticationRequiredError,
} from "@better-auth-ui/core";
import { useAuth, useListSessions, useSession } from "@better-auth-ui/react";
import { Fragment } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "#components/card";
import { Separator } from "#components/separator";
import { Skeleton } from "#components/skeleton";
import { ReauthenticationAction } from "../../reauthentication";
import { ActiveSession } from "./active-session";
import { SessionActions } from "./session-actions";

export type ActiveSessionsProps = {
  className?: string;
};

/**
 * Render a card listing all active sessions for the current user with revoke controls.
 *
 * Shows each session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @returns A JSX element containing the sessions card
 */
export function ActiveSessions({ className }: ActiveSessionsProps) {
  const { authClient, localization } = useAuth();
  const { data: session } = useSession(authClient);

  const sessionsQuery = useListSessions(authClient, {
    meta: { errorPresentation: "inline" },
  });
  const { data: sessions, error, isPending } = sessionsQuery;

  const activeSessions = [...(sessions ?? [])].sort((activeSession) =>
    activeSession.id === session?.session.id ? -1 : 1,
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{localization.settings.activeSessions}</CardTitle>
        <CardDescription>
          Manage and sign out of your active sessions on other devices.
        </CardDescription>
      </CardHeader>

      <CardPanel className="p-0">
        {isReauthenticationRequiredError(error) ? (
          <ReauthenticationAction />
        ) : error ? (
          <div role="alert" className="p-4 text-sm text-destructive">
            {getAuthErrorMessage(error, localization) ??
              localization.errors.generic}
          </div>
        ) : isPending ? (
          <div role="list" className="flex flex-col">
            <SessionRowSkeleton />
          </div>
        ) : (
          <div role="list" className="flex flex-col">
            {activeSessions?.map((activeSession, index) => (
              <Fragment key={activeSession.id}>
                {index > 0 && <Separator />}
                <ActiveSession activeSession={activeSession} />
              </Fragment>
            ))}
          </div>
        )}
      </CardPanel>

      {!isPending && !error && (
        <SessionActions
          hasOtherSessions={activeSessions.some(
            (activeSession) => activeSession.id !== session?.session.id,
          )}
        />
      )}
    </Card>
  );
}

function SessionRowSkeleton() {
  return (
    <div role="listitem" className="flex items-center gap-3 p-4">
      <Skeleton className="size-8 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
