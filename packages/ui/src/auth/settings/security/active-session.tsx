"use client";

import { useAuth, useRevokeSession, useSession } from "@better-auth-ui/react";
import type { Session } from "better-auth";
import Bowser from "bowser";
import { LogOut, Monitor, Smartphone, X } from "lucide-react";
import { toastManager } from "theoui/components/toast";

import { Badge } from "theoui/components/badge";
import { Button } from "theoui/components/button";
import { Spinner } from "theoui/components/spinner";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, threshold] of UNITS) {
    if (seconds >= threshold) {
      return rtf.format(-Math.floor(seconds / threshold), unit);
    }
  }

  return rtf.format(0, "second");
}

export type ActiveSessionProps = {
  activeSession: Session;
};

/**
 * Render a single active session row with device info and revoke control.
 *
 * Shows the session's browser, OS, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @param session - The session object containing id, token, userAgent, ipAddress, and createdAt
 * @returns A JSX element containing the active session row
 */
export function ActiveSession({ activeSession }: ActiveSessionProps) {
  const { authClient, basePaths, localization, viewPaths, navigate } =
    useAuth();
  const { data: session } = useSession(authClient, { refetchOnMount: false });

  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession(
    authClient,
    {
      onSuccess: () =>
        toastManager.add({
          type: "success",
          title: localization.settings.revokeSessionSuccess,
        }),
    },
  );

  const isCurrentSession = activeSession.token === session?.session.token;
  const ua = activeSession.userAgent
    ? Bowser.parse(activeSession.userAgent)
    : undefined;
  const isMobile =
    ua?.platform.type === "mobile" || ua?.platform.type === "tablet";

  return (
    <div
      role="listitem"
      className="flex items-center justify-between gap-4 p-4 text-sm"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
          {isMobile ? <Smartphone /> : <Monitor />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate leading-snug font-semibold text-foreground">
            {ua?.browser.name || "Unknown Browser"}
            {ua?.os.name ? `, ${ua.os.name}` : ""}
          </p>
          {isCurrentSession ? (
            <Badge variant="secondary" className="w-fit">
              {localization.settings.currentSession}
            </Badge>
          ) : (
            activeSession.createdAt && (
              <p className="text-xs text-muted-foreground capitalize">
                {timeAgo(activeSession.createdAt)}
              </p>
            )
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            isCurrentSession
              ? navigate({
                  to: `${basePaths.auth}/${viewPaths.auth.signOut}`,
                })
              : revokeSession(activeSession)
          }
          disabled={isRevoking}
          aria-label={
            isCurrentSession
              ? localization.auth.signOut
              : localization.settings.revokeSession
          }
        >
          {isRevoking ? <Spinner /> : isCurrentSession ? <LogOut /> : <X />}

          {isCurrentSession
            ? localization.auth.signOut
            : localization.settings.revoke}
        </Button>
      </div>
    </div>
  );
}
