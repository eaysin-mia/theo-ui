"use client";

import type { OAuthProviderAuthClient } from "@better-auth-ui/core/plugins/oauth-provider";
import {
  type AuthorizedOAuthApplication,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl,
} from "@better-auth-ui/core/plugins/oauth-provider";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { usePublicOAuthClient } from "@better-auth-ui/react/plugins/oauth-provider";
import { ShieldCheck, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theo/ui/components/avatar";
import { Button } from "@theo/ui/components/button";
import { Skeleton } from "@theo/ui/components/skeleton";
import { oauthProviderPlugin } from "@theo/ui/lib/auth/oauth-provider-plugin";
import { RemoveAuthorizationDialog } from "./remove-authorization-dialog";

export type AuthorizedApplicationProps = {
  /** @remarks `AuthorizedOAuthApplication` */
  application: AuthorizedOAuthApplication;
};

/**
 * A single authorized application row.
 *
 * Each row loads its own public client metadata so one slow or missing
 * application never blocks the rest of the card.
 */
export function AuthorizedApplication({
  application,
}: AuthorizedApplicationProps) {
  const { authClient } = useAuth();
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin);
  const [removeOpen, setRemoveOpen] = useState(false);

  const publicClient = usePublicOAuthClient(
    authClient as OAuthProviderAuthClient,
    application.clientId,
  );

  const client = publicClient.data;
  const clientName = client?.client_name || application.clientId;
  const logoUrl = sanitizeOAuthClientUrl(client?.logo_uri);
  const websiteUrl = sanitizeOAuthClientUrl(client?.client_uri);

  return (
    <div
      role="listitem"
      className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <div className="size-10 shrink-0">
        {publicClient.isPending ? (
          <Skeleton className="size-10 shrink-0 rounded-md" />
        ) : (
          <Avatar className="size-10 shrink-0 rounded-md">
            <AvatarImage
              alt={clientName}
              referrerPolicy="no-referrer"
              src={logoUrl}
            />
            <AvatarFallback className="rounded-md">
              <ShieldCheck className="size-4.5" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        {publicClient.isPending ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <p className="truncate text-sm leading-snug font-semibold text-foreground">
            {clientName}
          </p>
        )}

        {websiteUrl ? (
          <p className="text-xs text-muted-foreground">
            <a
              className="truncate text-xs text-muted-foreground underline-offset-4 hover:underline"
              href={websiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {websiteUrl}
            </a>
          </p>
        ) : null}

        {application.updatedAt ? (
          <p className="text-xs text-muted-foreground">
            {`${localization.lastAuthorized} ${application.updatedAt.toLocaleDateString(
              undefined,
              { dateStyle: "medium" },
            )}`}
          </p>
        ) : null}
      </div>
      <div className="col-start-2 flex shrink-0 items-center gap-2 sm:col-start-3 sm:row-start-1">
        <Button size="sm" variant="outline" onClick={() => setRemoveOpen(true)}>
          {localization.removeAuthorization}
        </Button>

        <RemoveAuthorizationDialog
          application={application}
          clientName={clientName}
          open={removeOpen}
          onOpenChange={setRemoveOpen}
        />
      </div>
      {application.scopes.length > 0 ? (
        <details className="group/permissions col-span-full sm:col-span-2 sm:col-start-2">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-sm text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 group-open/permissions:rotate-90"
            />
            {localization.permissions}{" "}
            <span>({application.scopes.length})</span>
          </summary>
          <ul className="mt-3 grid gap-3 rounded-lg bg-muted/50 p-4">
            {application.scopes.map((scope) => {
              const details = resolveOAuthScopeMetadata(scopeMetadata, scope, {
                clientId: application.clientId,
                requestedScopes: application.scopes,
              });
              return (
                <li key={scope} className="flex gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <div className="grid min-w-0 gap-1">
                    <p className="text-sm font-medium wrap-break-word">
                      {details.label}
                    </p>
                    {details.description ? (
                      <p className="text-sm leading-5 text-muted-foreground">
                        {details.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
