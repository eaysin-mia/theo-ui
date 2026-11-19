"use client";

import {
  groupOAuthConsents,
  type OAuthProviderAuthClient,
} from "@better-auth-ui/core/plugins/oauth-provider";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useListOAuthConsents } from "@better-auth-ui/react/plugins/oauth-provider";
import { Fragment } from "react";

import {
  Card,
  CardHeader,
  CardPanel,
  CardTitle,
} from "theo-ui/components/card";
import { Separator } from "theo-ui/components/separator";
import { oauthProviderPlugin } from "theo-ui/lib/auth/oauth-provider-plugin";
import { AuthorizedApplication } from "./authorized-application";
import { AuthorizedApplicationSkeleton } from "./authorized-application-skeleton";
import { AuthorizedApplicationsEmpty } from "./authorized-applications-empty";

export type AuthorizedApplicationsProps = {
  className?: string;
};

/**
 * Security card listing the OAuth applications this account has authorized.
 *
 * It manages consent records, not sign-in sessions and not live access
 * tokens. Better Auth can store more than one consent per client, so records
 * are grouped by client ID and rendered as a single application.
 */
export function AuthorizedApplications({
  className,
}: AuthorizedApplicationsProps) {
  const { authClient } = useAuth();
  const { localization } = useAuthPlugin(oauthProviderPlugin);

  const { data: consents, isPending } = useListOAuthConsents(
    authClient as OAuthProviderAuthClient,
  );

  const applications = groupOAuthConsents(consents);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{localization.connectedApplications}</CardTitle>
      </CardHeader>

      <CardPanel className="p-0">
        {isPending ? (
          <div role="list" className="flex flex-col">
            <AuthorizedApplicationSkeleton />
          </div>
        ) : !applications.length ? (
          <AuthorizedApplicationsEmpty />
        ) : (
          <div role="list" className="flex flex-col">
            {applications.map((application, index) => (
              <Fragment key={application.clientId}>
                {index > 0 && <Separator />}
                <AuthorizedApplication application={application} />
              </Fragment>
            ))}
          </div>
        )}
      </CardPanel>
    </Card>
  );
}
